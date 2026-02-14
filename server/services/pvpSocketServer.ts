import type { Server, Socket } from 'socket.io'
import { pvpSocketEvents } from '../config/pvpSocket.js'
import { PvpRoomManager } from './pvpRoomManager.js'
import { verifySocketToken } from '../utils/socketAuth.js'
import { prisma } from '../db/prisma.js'
import { pvpConfig } from '../config/pvp.js'
import { generateMatchText } from './pvpMatchService.js'
import type { PvpErrorCode, PvpRoom, PvpPlayerStats } from '../types/pvp.js'

const manager = new PvpRoomManager()
const startTimers = new Map<string, NodeJS.Timeout>()
const finishTimers = new Map<string, NodeJS.Timeout>()
const lastProgressAt = new Map<string, number>()

const emitRoomState = (io: Server, room: PvpRoom) => {
  io.to(room.id).emit(pvpSocketEvents.server.roomState, { room, serverTime: Date.now() })
}

const emitLobby = (io: Server) => {
  io.emit(pvpSocketEvents.server.rooms, { rooms: manager.listPublicRooms() })
}

const emitError = (socket: Socket, code: PvpErrorCode) => {
  socket.emit(pvpSocketEvents.server.error, { code })
}

const clampStat = (value: number, maxValue: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue)) return 0
  return Math.max(0, Math.min(Math.floor(value), Math.floor(maxValue)))
}

const clampPlayerStats = (room: PvpRoom, stats: PvpPlayerStats & { progress?: number }) => {
  const maxWords = room.settings.wordCount
  const maxChars = room.match.text.length
  return {
    ...stats,
    words: clampStat(stats.words, maxWords),
    characters: clampStat(stats.characters, maxChars),
  }
}

const clearRoomTimers = (roomId: string) => {
  const startTimer = startTimers.get(roomId)
  if (startTimer) {
    clearTimeout(startTimer)
    startTimers.delete(roomId)
  }
  const finishTimer = finishTimers.get(roomId)
  if (finishTimer) {
    clearTimeout(finishTimer)
    finishTimers.delete(roomId)
  }
}

export const registerPvpSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = typeof socket.handshake.auth?.token === 'string'
        ? socket.handshake.auth.token
        : typeof socket.handshake.headers?.authorization === 'string'
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : ''

      if (!token) {
        return next(new Error('UNAUTHORIZED'))
      }

      const payload = verifySocketToken(token)
      const user = await prisma.user.findUnique({ where: { id: payload.userId } })
      if (!user) {
        return next(new Error('UNAUTHORIZED'))
      }

      socket.data.userId = user.id
      socket.data.username = payload.username ?? user.username
      return next()
    } catch (error) {
      return next(new Error('UNAUTHORIZED'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string
    const username = socket.data.username as string

    const handleRoomUpdate = (room: PvpRoom | null) => {
      if (!room) {
        emitLobby(io)
        return
      }
      socket.join(room.id)
      emitRoomState(io, room)
      emitLobby(io)
    }

    socket.on(pvpSocketEvents.client.requestRooms, () => {
      socket.emit(pvpSocketEvents.server.rooms, { rooms: manager.listPublicRooms() })
    })

    socket.on(pvpSocketEvents.client.createRoom, (payload) => {
      const room = manager.createRoom({
        userId,
        nickname: username,
        maxPlayers: payload?.maxPlayers ?? pvpConfig.room.maxPlayers,
        privacy: payload?.privacy ?? 'public',
        name: payload?.name ?? '',
        settings: payload?.settings ?? {},
      })

      handleRoomUpdate(room)
    })

    socket.on(pvpSocketEvents.client.joinRoom, (payload) => {
      const code = typeof payload?.code === 'string' ? payload.code : ''
      const result = manager.joinRoom({ userId, nickname: username, code })
      if (result.error) {
        emitError(socket, result.error)
        return
      }
      if (result.room) {
        handleRoomUpdate(result.room)
      }
    })

    socket.on(pvpSocketEvents.client.leaveRoom, () => {
      const result = manager.leaveRoom(userId)
      if (!result.room && result.removedRoomId) {
        clearRoomTimers(result.removedRoomId)
      }
      emitLobby(io)
      if (result.room) {
        emitRoomState(io, result.room)
      }
    })

    socket.on(pvpSocketEvents.client.setReady, (payload) => {
      const ready = !!payload?.ready
      const room = manager.setReady(userId, ready)
      if (!room) {
        emitError(socket, 'NOT_IN_ROOM')
        return
      }
      emitRoomState(io, room)
    })

    socket.on(pvpSocketEvents.client.updateSettings, (payload) => {
      const result = manager.updateSettings(userId, payload?.settings ?? {})
      if (result.error) {
        emitError(socket, result.error)
        return
      }
      if (result.room) {
        emitRoomState(io, result.room)
      }
    })

    socket.on(pvpSocketEvents.client.resetRoom, () => {
      const result = manager.resetRoom(userId)
      if (result.error) {
        emitError(socket, result.error)
        return
      }
      if (result.room) {
        emitRoomState(io, result.room)
        emitLobby(io)
      }
    })

    socket.on(pvpSocketEvents.client.destroyRoom, () => {
      const result = manager.destroyRoom(userId)
      if (result.error) {
        emitError(socket, result.error)
        return
      }
      if (result.removedRoomId && result.playerIds) {
        io.to(result.removedRoomId).emit(pvpSocketEvents.server.error, { code: 'ROOM_CLOSED' })
        for (const client of io.sockets.sockets.values()) {
          if (result.playerIds.includes(client.data.userId)) {
            client.leave(result.removedRoomId)
          }
        }
        clearRoomTimers(result.removedRoomId)
        emitLobby(io)
      }
    })

    socket.on(pvpSocketEvents.client.startMatch, async (payload) => {
      const result = manager.beginMatch(userId)
      if (result.error) {
        emitError(socket, result.error)
        return
      }
      if (!result.room) return

      emitRoomState(io, result.room)

      try {
        const text = await generateMatchText({
          wordCount: result.room.settings.wordCount,
          difficulty: result.room.settings.difficulty,
          language: typeof payload?.language === 'string' ? payload.language : undefined,
          topic: result.room.settings.topic,
        })

        const startAt = Date.now() + pvpConfig.match.syncHoldMs + pvpConfig.match.countdownSeconds * pvpConfig.match.countdownTickMs
        const updated = manager.setMatchCountdown(result.room.id, { text, startAt })
        if (!updated) return

        emitRoomState(io, updated)

        clearRoomTimers(updated.id)
        const startTimer = setTimeout(() => {
          const typingRoom = manager.setMatchTyping(updated.id)
          if (typingRoom) {
            emitRoomState(io, typingRoom)
          }
        }, startAt - Date.now())
        startTimers.set(updated.id, startTimer)
      } catch (error) {
        emitError(socket, 'TEXT_GENERATION_FAILED')
      }
    })

    socket.on(pvpSocketEvents.client.updateProgress, (payload) => {
      const now = Date.now()
      const last = lastProgressAt.get(userId) ?? 0
      if (now - last < pvpConfig.network.progressMinIntervalMs) return
      lastProgressAt.set(userId, now)

      const stats: PvpPlayerStats & { progress: number } = {
        progress: typeof payload?.progress === 'number' ? payload.progress : 0,
        wpm: typeof payload?.wpm === 'number' ? payload.wpm : 0,
        accuracy: typeof payload?.accuracy === 'number' ? payload.accuracy : 0,
        errors: typeof payload?.errors === 'number' ? payload.errors : 0,
        timeSec: typeof payload?.timeSec === 'number' ? payload.timeSec : 0,
        words: typeof payload?.words === 'number' ? payload.words : 0,
        characters: typeof payload?.characters === 'number' ? payload.characters : 0,
      }

      const roomSnapshot = manager.getRoomForPlayer(userId)
      if (!roomSnapshot) return
      const playerSnapshot = roomSnapshot.players.find((player) => player.id === userId)
      if (!playerSnapshot || playerSnapshot.status === 'finished') return

      const clampedStats = clampPlayerStats(roomSnapshot, stats)
      const room = manager.updateProgress(userId, clampedStats)
      if (room) {
        emitRoomState(io, room)
      }
    })

    socket.on(pvpSocketEvents.client.finishMatch, (payload) => {
      const stats: PvpPlayerStats = {
        wpm: typeof payload?.wpm === 'number' ? payload.wpm : 0,
        accuracy: typeof payload?.accuracy === 'number' ? payload.accuracy : 0,
        errors: typeof payload?.errors === 'number' ? payload.errors : 0,
        timeSec: typeof payload?.timeSec === 'number' ? payload.timeSec : 0,
        words: typeof payload?.words === 'number' ? payload.words : 0,
        characters: typeof payload?.characters === 'number' ? payload.characters : 0,
      }

      const roomSnapshot = manager.getRoomForPlayer(userId)
      if (!roomSnapshot) return
      const playerSnapshot = roomSnapshot.players.find((player) => player.id === userId)
      if (!playerSnapshot || playerSnapshot.status === 'finished') return

      const clampedStats = clampPlayerStats(roomSnapshot, stats)
      const room = manager.finishPlayer(userId, clampedStats)
      if (!room) return

      emitRoomState(io, room)

      const words = Math.max(0, Math.floor(clampedStats.words))
      const characters = Math.max(0, Math.floor(clampedStats.characters))
      if (words > 0 || characters > 0) {
        prisma.user.update({
          where: { id: userId },
          data: {
            wordsWritten: { increment: words },
            charactersWritten: { increment: characters },
          },
        }).catch((error) => {
          console.error('PVP stats update error:', error)
        })
      }

      if (room.players.every((player) => player.status === 'finished')) {
        const finishedRoom = manager.finalizeMatch(room.id)
        if (finishedRoom) {
          emitRoomState(io, finishedRoom)
        }
        return
      }

      if (!finishTimers.has(room.id)) {
        const finishTimer = setTimeout(() => {
          const finishedRoom = manager.finalizeMatch(room.id)
          if (finishedRoom) {
            emitRoomState(io, finishedRoom)
          }
        }, pvpConfig.match.finishGraceMs)
        finishTimers.set(room.id, finishTimer)
      }
    })

    socket.on('disconnect', () => {
      const result = manager.leaveRoom(userId)
      if (!result.room && result.removedRoomId) {
        clearRoomTimers(result.removedRoomId)
      }
      emitLobby(io)
      if (result.room) {
        emitRoomState(io, result.room)
      }
    })
  })
}
