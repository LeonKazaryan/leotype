import type { Server, Socket } from 'socket.io'
import { prisma } from '../db/prisma.js'
import { rankedSocketEvents } from '../config/pvpSocket.js'
import { rankedConfig } from '../config/ranked.js'
import { pvpConfig } from '../config/pvp.js'
import { RankedQueueManager } from './rankedQueueManager.js'
import { RankedMatchManager } from './rankedMatchManager.js'
import type { RankedQueueEntry, RankedProgressPayload } from '../types/ranked.js'

const queueManager = new RankedQueueManager()
const matchManager = new RankedMatchManager()
const statusTimers = new Map<string, NodeJS.Timeout>()
const activeMatchByUser = new Map<string, string>()

const clearStatusTimer = (userId: string) => {
  const timer = statusTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    statusTimers.delete(userId)
  }
}

const emitSearchStatus = (socket: Socket, entry: RankedQueueEntry, now: number) => {
  const status = queueManager.getStatusFor(entry.userId, now)
  if (!status) return
  socket.emit(rankedSocketEvents.server.searchStatus, {
    range: status.range,
    elapsedMs: status.elapsedMs,
  })
}

const getRating = async (userId: string) => {
  const profile = await prisma.rankedProfile.findUnique({ where: { userId } })
  return profile?.rating ?? rankedConfig.rating.start
}

const findSocketByUserId = (io: Server, userId: string) => {
  return [...io.sockets.sockets.values()].find((client) => client.data.userId === userId) ?? null
}

export const registerRankedSocket = (io: Server) => {
  // reuse auth middleware from pvp registration if already attached
  io.on('connection', (socket) => {
    const userId = socket.data.userId as string | undefined
    const username = socket.data.username as string | undefined
    if (!userId || !username) return

    socket.on(rankedSocketEvents.client.joinQueue, async (payload) => {
      if (activeMatchByUser.has(userId)) {
        socket.emit(rankedSocketEvents.server.error, { code: 'ALREADY_IN_MATCH' })
        return
      }
      if (queueManager.getActiveUserIds().includes(userId)) {
        socket.emit(rankedSocketEvents.server.error, { code: 'ALREADY_IN_QUEUE' })
        return
      }

      const rating = await getRating(userId)
      const entry: RankedQueueEntry = {
        userId,
        nickname: username,
        rating,
        joinedAt: Date.now(),
        language: payload?.language === 'en' ? 'en' : 'ru',
        difficulty: payload?.difficulty === 'hard' || payload?.difficulty === 'easy' ? payload.difficulty : 'medium',
      }

      queueManager.enqueue(entry)
      emitSearchStatus(socket, entry, Date.now())

      const timer = setInterval(() => {
        const nowTick = Date.now()
        emitSearchStatus(socket, entry, nowTick)

        const pairTick = queueManager.tryFindPair(nowTick)
        if (pairTick) {
          clearStatusTimer(pairTick.a.userId)
          clearStatusTimer(pairTick.b.userId)
          startRankedMatch(io, pairTick.a, pairTick.b)
          return
        }

        if (queueManager.shouldSpawnBot(entry, nowTick)) {
          const self = queueManager.pop(userId)
          if (self) {
            clearStatusTimer(userId)
            startRankedMatch(io, self, createBotEntry(self))
          }
        }
      }, rankedConfig.ui.statusTextIntervalMs)
      statusTimers.set(userId, timer)

      const now = Date.now()
      // try pair immediately
      const pair = queueManager.tryFindPair(now)
      if (pair) {
        clearStatusTimer(pair.a.userId)
        clearStatusTimer(pair.b.userId)
        startRankedMatch(io, pair.a, pair.b)
        return
      }

      // bot fallback
      if (queueManager.shouldSpawnBot(entry, now)) {
        queueManager.pop(userId)
        clearStatusTimer(userId)
        startRankedMatch(io, entry, createBotEntry(entry))
      }
    })

    socket.on(rankedSocketEvents.client.cancelQueue, () => {
      queueManager.remove(userId)
      clearStatusTimer(userId)
    })

    socket.on(rankedSocketEvents.client.progress, (payload) => {
      const matchId = activeMatchByUser.get(userId)
      if (!matchId) return
      matchManager.updateProgress(matchId, userId, payload as RankedProgressPayload)
      const match = matchManager.getMatch(matchId)
      if (match) {
        io.to(matchId).emit(rankedSocketEvents.server.matchState, {
          matchId,
          stage: 'typing',
          progress: match.players.map((p) => ({
            userId: p.userId,
            progress: p.progress,
          })),
        })
      }
    })

    socket.on(rankedSocketEvents.client.finish, async (payload) => {
      const matchId = activeMatchByUser.get(userId)
      if (!matchId) return
      matchManager.finishPlayer(matchId, userId, payload as RankedProgressPayload)
      const match = matchManager.getMatch(matchId)
      if (!match) return

      const allFinished = match.players.every((p) => p.finishedAt || p.isBot)
      if (!allFinished) return

      const result = await matchManager.finalizeMatch(matchId)
      if (!result) return

      io.to(match.id).emit(rankedSocketEvents.server.matchState, {
        matchId,
        stage: 'finished',
        progress: match.players.map((p) => ({ userId: p.userId, progress: p.progress })),
      })

      match.players.forEach((p) => {
        if (p.userId) {
          const opponent = match.players.find((o) => o !== p)
          activeMatchByUser.delete(p.userId)
          clearStatusTimer(p.userId)
          const client = findSocketByUserId(io, p.userId)
          client?.emit(rankedSocketEvents.server.result, {
            matchId,
            ratingBefore: p.ratingBefore,
            ratingAfter: p.ratingAfter,
            delta: p.delta,
            opponent: opponent?.nickname,
            opponentStats: opponent?.stats,
            stats: p.stats,
          })
        }
      })
    })

    socket.on('disconnect', () => {
      queueManager.remove(userId)
      clearStatusTimer(userId)
    })
  })
}

const createBotEntry = (entry: RankedQueueEntry): RankedQueueEntry => {
  const profile = rankedConfig.bots.profiles[Math.floor(Math.random() * rankedConfig.bots.profiles.length)]
  const name = rankedConfig.bots.names[Math.floor(Math.random() * rankedConfig.bots.names.length)]
  return {
    userId: `bot_${Math.random().toString(36).slice(2, 8)}`,
    nickname: name,
    rating: entry.rating,
    joinedAt: Date.now(),
    language: entry.language,
    difficulty: entry.difficulty,
    botProfile: profile,
  }
}

const startRankedMatch = async (io: Server, a: RankedQueueEntry, b: RankedQueueEntry) => {
  const match = await matchManager.createMatch({
    players: [
      { userId: a.userId, nickname: a.nickname, rating: a.rating, isBot: a.userId.startsWith('bot_'), botProfile: a.botProfile },
      { userId: b.userId, nickname: b.nickname, rating: b.rating, isBot: b.userId.startsWith('bot_'), botProfile: b.botProfile },
    ],
    wordCount: pvpConfig.defaults.wordCount,
    difficulty: pvpConfig.defaults.difficulty as 'easy' | 'medium' | 'hard',
    language: a.language,
  })

  const sockets = [findSocketByUserId(io, a.userId), findSocketByUserId(io, b.userId)].filter(Boolean) as Socket[]
  sockets.forEach((sock) => {
    sock.join(match.id)
    activeMatchByUser.set(sock.data.userId as string, match.id)
    const isBotOpponent = sock.data.userId === a.userId ? b.userId.startsWith('bot_') : a.userId.startsWith('bot_')
    const botProfile = sock.data.userId === a.userId ? b.botProfile : a.botProfile
    const expectedTimeSec = botProfile ? Math.max(1, Math.round((match.wordCount / botProfile.wpm) * 60)) : undefined

    sock.emit(rankedSocketEvents.server.matchFound, {
      matchId: match.id,
      opponent: {
        nickname: sock.data.userId === a.userId ? b.nickname : a.nickname,
        rating: sock.data.userId === a.userId ? b.rating : a.rating,
        isBot: isBotOpponent,
        expectedTimeSec,
        expectedWpm: botProfile?.wpm,
        expectedAccuracy: botProfile?.accuracy,
      },
      startAt: match.startAt,
      text: match.text,
      wordCount: match.wordCount,
      difficulty: match.difficulty,
      language: match.language,
    })
  })

  io.to(match.id).emit(rankedSocketEvents.server.matchState, {
    matchId: match.id,
    stage: 'countdown',
    startAt: match.startAt,
  })

  setTimeout(() => {
    io.to(match.id).emit(rankedSocketEvents.server.matchState, {
      matchId: match.id,
      stage: 'typing',
      startAt: match.startAt,
    })
  }, Math.max(0, match.startAt - Date.now()))
}
