import { prisma } from '../db/prisma.js'
import { rankedConfig } from '../config/ranked.js'
import type { RankedMatchPlayerSnapshot, RankedProgressPayload, RankedResult } from '../types/ranked.js'
import { calculateEloDelta, clampInt, clampProgress, sumToAverage } from '../utils/ranked.js'
import { generateMatchText } from './pvpMatchService.js'
import type { RankedBotProfile } from '../config/ranked.js'

type ActivePlayer = {
  userId: string | null
  nickname: string
  ratingBefore: number
  ratingAfter?: number
  delta?: number
  progress: number
  stats?: RankedProgressPayload
  finishedAt?: number
  isBot: boolean
  opponentId?: string | null
  botProfile?: RankedBotProfile
}

type ActiveMatch = {
  id: string
  text: string
  wordCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  language: 'ru' | 'en'
  startAt: number
  players: ActivePlayer[]
}

const resultFromTimes = (aTime: number, bTime: number): RankedResult | 'PENDING' => {
  if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) return 'PENDING'
  if (Math.abs(aTime - bTime) <= 0.001) return 'DRAW'
  return aTime < bTime ? 'WIN' : 'LOSS'
}

export class RankedMatchManager {
  private matches = new Map<string, ActiveMatch>()

  async createMatch(params: {
    players: RankedMatchPlayerSnapshot[]
    wordCount: number
    difficulty: 'easy' | 'medium' | 'hard'
    language: 'ru' | 'en'
  }) {
    const text = await generateMatchText({
      wordCount: params.wordCount,
      difficulty: params.difficulty,
      language: params.language,
    })

    const startAt = Date.now() + rankedConfig.match.syncHoldMs + rankedConfig.match.countdownSeconds * rankedConfig.match.countdownTickMs

    const match: ActiveMatch = {
      id: `ranked_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text,
      wordCount: params.wordCount,
      difficulty: params.difficulty,
      language: params.language,
      startAt,
      players: params.players.map((player) => ({
        userId: player.userId,
        nickname: player.nickname,
        ratingBefore: player.rating,
        progress: 0,
        isBot: player.isBot,
        opponentId: player.opponentId ?? null,
      })),
    }

    this.matches.set(match.id, match)
    return match
  }

  getMatch(matchId: string) {
    return this.matches.get(matchId) ?? null
  }

  updateProgress(matchId: string, userId: string, payload: RankedProgressPayload) {
    const match = this.matches.get(matchId)
    if (!match) return null
    const player = match.players.find((p) => p.userId === userId)
    if (!player || player.finishedAt) return null

    player.progress = clampProgress(payload.progress)
    player.stats = {
      ...payload,
      progress: player.progress,
      wpm: clampInt(payload.wpm, 1000),
      accuracy: clampInt(payload.accuracy, 100),
      errors: clampInt(payload.errors, match.wordCount * 2),
      timeSec: clampInt(payload.timeSec, 3600),
      words: clampInt(payload.words, match.wordCount),
      characters: clampInt(payload.characters, match.text.length),
    }
    return match
  }

  finishPlayer(matchId: string, userId: string, payload: RankedProgressPayload) {
    const match = this.matches.get(matchId)
    if (!match) return null
    const player = match.players.find((p) => p.userId === userId)
    if (!player || player.finishedAt) return null

    player.progress = 1
    player.stats = {
      ...payload,
      progress: 1,
      wpm: clampInt(payload.wpm, 1000),
      accuracy: clampInt(payload.accuracy, 100),
      errors: clampInt(payload.errors, match.wordCount * 2),
      timeSec: clampInt(payload.timeSec, 3600),
      words: clampInt(payload.words, match.wordCount),
      characters: clampInt(payload.characters, match.text.length),
    }
    player.finishedAt = Date.now()

    return match
  }

  private ensureBotStats(match: ActiveMatch, player: ActivePlayer) {
    if (!player.isBot || player.stats) return
    const profile = player.botProfile ?? rankedConfig.bots.profiles[0]
    const minutes = match.wordCount / profile.wpm
    const timeSec = Math.max(1, Math.round(minutes * 60))
    player.stats = {
      progress: 1,
      wpm: profile.wpm,
      accuracy: profile.accuracy,
      errors: 0,
      timeSec,
      words: match.wordCount,
      characters: match.text.length,
    }
    player.progress = 1
    player.finishedAt = Date.now()
  }

  async finalizeMatch(matchId: string) {
    const match = this.matches.get(matchId)
    if (!match) return null

    match.players.forEach((p) => this.ensureBotStats(match, p))

    const [p1, p2] = match.players
    if (!p1 || !p2 || !p1.stats || !p2.stats) return null

    const resultForP1 = resultFromTimes(p1.stats.timeSec, p2.stats.timeSec)
    const resultForP2: RankedResult = resultForP1 === 'WIN' ? 'LOSS' : resultForP1 === 'LOSS' ? 'WIN' : 'DRAW'

    const deltaP1 = calculateEloDelta(p1.ratingBefore, p2.ratingBefore, resultForP1 === 'PENDING' ? 'DRAW' : resultForP1)
    const deltaP2 = -deltaP1

    p1.delta = deltaP1
    p2.delta = deltaP2
    p1.ratingAfter = p1.ratingBefore + deltaP1
    p2.ratingAfter = p2.ratingBefore + deltaP2

    const prismaMatch = await prisma.rankedMatch.create({
      data: {
        id: match.id,
        startedAt: new Date(match.startAt),
        finishedAt: new Date(),
        language: match.language,
        wordCount: match.wordCount,
        difficulty: match.difficulty,
        participants: {
          create: [
            {
              userId: p1.isBot ? null : p1.userId,
              opponentId: p2.userId ?? undefined,
              isBot: p1.isBot,
              nickname: p1.nickname,
              ratingBefore: p1.ratingBefore,
              ratingAfter: p1.ratingAfter ?? p1.ratingBefore,
              delta: deltaP1,
              result: resultForP1 === 'PENDING' ? 'DRAW' : resultForP1,
              wpm: p1.stats.wpm,
              accuracy: p1.stats.accuracy,
              errors: p1.stats.errors,
              timeSec: p1.stats.timeSec,
              words: p1.stats.words,
              characters: p1.stats.characters,
            },
            {
              userId: p2.isBot ? null : p2.userId,
              opponentId: p1.userId ?? undefined,
              isBot: p2.isBot,
              nickname: p2.nickname,
              ratingBefore: p2.ratingBefore,
              ratingAfter: p2.ratingAfter ?? p2.ratingBefore,
              delta: deltaP2,
              result: resultForP2,
              wpm: p2.stats.wpm,
              accuracy: p2.stats.accuracy,
              errors: p2.stats.errors,
              timeSec: p2.stats.timeSec,
              words: p2.stats.words,
              characters: p2.stats.characters,
            },
          ],
        },
      },
    })

    await Promise.all(
      match.players
        .filter((p) => p.userId && !p.isBot)
        .map((p) =>
          prisma.rankedProfile.upsert({
            where: { userId: p.userId! },
            update: {
              rating: p.ratingAfter ?? p.ratingBefore,
              racesPlayed: { increment: 1 },
              wins: { increment: p.delta && p.delta > 0 ? 1 : 0 },
              losses: { increment: p.delta && p.delta < 0 ? 1 : 0 },
              sumWpm: { increment: p.stats?.wpm ?? 0 },
              sumAccuracy: { increment: p.stats?.accuracy ?? 0 },
              lastPlayedAt: new Date(),
            },
            create: {
              userId: p.userId!,
              rating: p.ratingAfter ?? p.ratingBefore,
              racesPlayed: 1,
              wins: p.delta && p.delta > 0 ? 1 : 0,
              losses: p.delta && p.delta < 0 ? 1 : 0,
              sumWpm: p.stats?.wpm ?? 0,
              sumAccuracy: p.stats?.accuracy ?? 0,
            },
          })
        )
    )

    this.matches.delete(matchId)

    return {
      match: prismaMatch,
      players: match.players,
    }
  }
}
