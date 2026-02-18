import { create } from 'zustand'
import { rankedConfig } from '../config/ranked'
import type { RankedMatchState, RankedOpponent, RankedPhase, RankedProfile, RankedResultSummary } from '../types/ranked'
import { rankedSocketEvents } from '../config/pvpSocket'
import { connectRealtimeSocket, emitRanked, onRanked, offRanked, connectPvpSocket } from '../services/pvpSocketClient'
import type { AuthUser } from '../utils/auth'

type RankedStore = {
  userId: string | null
  overlayOpen: boolean
  phase: RankedPhase
  profile: RankedProfile | null
  searchStatus: { range: number; elapsedMs: number } | null
  opponent: RankedOpponent | null
  match: RankedMatchState
  result: RankedResultSummary | null
  countdownTimer: number | null
  opponentProgressTimer: number | null
  opponentSimStart: number | null
  opponentSimTotalMs: number | null
  openOverlay: (user: AuthUser) => void
  closeOverlay: () => void
  loadProfile: () => Promise<void>
  joinQueue: (params?: { language?: 'ru' | 'en'; difficulty?: 'easy' | 'medium' | 'hard' }) => void
  cancelQueue: () => void
  sendProgress: (payload: { progress: number; wpm: number; accuracy: number; errors: number; timeSec: number; words: number; characters: number }) => void
  finishMatch: (payload: { wpm: number; accuracy: number; errors: number; timeSec: number; words: number; characters: number }) => void
}

const defaultMatch: RankedMatchState = {
  matchId: '',
  stage: 'search',
  startAt: null,
  countdown: rankedConfig.match.countdownSeconds,
  text: '',
  wordCount: 25,
  difficulty: 'medium',
  language: 'ru',
  progress: { self: 0, opponent: 0 },
}

const computeCountdown = (startAt: number | null) => {
  if (!startAt) return rankedConfig.match.countdownSeconds
  const remaining = Math.max(0, startAt - Date.now())
  return Math.ceil(remaining / rankedConfig.match.countdownTickMs)
}

export const useRankedStore = create<RankedStore>((set, get) => ({
  overlayOpen: false,
  userId: null,
  phase: 'idle',
  profile: null,
  searchStatus: null,
  opponent: null,
  match: defaultMatch,
  result: null,
  countdownTimer: null,
  opponentProgressTimer: null,
  opponentSimStart: null,
  opponentSimTotalMs: null,

  openOverlay: (user) => {
    connectRealtimeSocket() || connectPvpSocket()
    set({ overlayOpen: true, phase: 'search', result: null, userId: user.id })

    const clearCountdown = () => {
      const timer = get().countdownTimer
      if (timer) {
        window.clearInterval(timer)
        set({ countdownTimer: null })
      }
    }

    const clearOpponentTimer = () => {
      const timer = get().opponentProgressTimer
      if (timer) {
        cancelAnimationFrame(timer)
        set({ opponentProgressTimer: null, opponentSimStart: null, opponentSimTotalMs: null })
      }
    }

    offRanked(rankedSocketEvents.server.searchStatus)
    offRanked(rankedSocketEvents.server.matchFound)
    offRanked(rankedSocketEvents.server.matchState)
    offRanked(rankedSocketEvents.server.result)
    offRanked(rankedSocketEvents.server.error)

    onRanked(rankedSocketEvents.server.searchStatus, (payload: { range: number; elapsedMs: number }) => {
      set({ searchStatus: payload })
    })

    onRanked(rankedSocketEvents.server.matchFound, (payload: any) => {
      const countdown = computeCountdown(payload.startAt)
      set({
          phase: 'found',
          opponent: payload.opponent,
          match: {
            matchId: payload.matchId,
            stage: 'countdown',
          startAt: payload.startAt,
          countdown,
          text: payload.text,
          wordCount: payload.wordCount,
          difficulty: payload.difficulty,
          language: payload.language,
          progress: { self: 0, opponent: 0 },
        },
      })
    })

    onRanked(rankedSocketEvents.server.matchState, (payload: any) => {
      const current = get().match
      const countdown = computeCountdown(payload.startAt ?? current.startAt)
      const opponent = get().opponent
      set({
        phase: payload.stage === 'typing' ? 'match' : 'countdown',
        match: {
          ...current,
          stage: payload.stage,
          startAt: payload.startAt ?? current.startAt,
          countdown,
          progress: payload.progress
            ? {
                self: payload.progress.find((p: any) => p.userId === get().userId)?.progress ?? current.progress.self,
                opponent: payload.progress.find((p: any) => p.userId !== get().userId)?.progress ?? current.progress.opponent,
              }
            : current.progress,
        },
      })

      clearCountdown()
      clearOpponentTimer()
      if (payload.stage === 'countdown') {
        const timer = window.setInterval(() => {
          set((state) => ({
            match: {
              ...state.match,
              countdown: computeCountdown(state.match.startAt),
            },
          }))
        }, rankedConfig.match.countdownTickMs)
        set({ countdownTimer: timer })
      }

      if (payload.stage === 'typing' && opponent?.isBot && opponent.expectedTimeSec && current.startAt) {
        const startAt = current.startAt
        const totalMs = opponent.expectedTimeSec * 1000
        const simStart = performance.now()
        const loop = (tickStart: number) => {
          const elapsed = Math.max(0, performance.now() - simStart + Math.max(0, Date.now() - startAt))
          const target = Math.min(1, elapsed / totalMs)
          set((state) => {
            const nextProgress = Math.max(state.match.progress.opponent, target)
            return {
              match: {
                ...state.match,
                progress: { ...state.match.progress, opponent: nextProgress },
              },
            }
          })
          if (target < 1) {
            const id = requestAnimationFrame(loop)
            set({ opponentProgressTimer: id })
          } else {
            set({ opponentProgressTimer: null })
          }
        }
        const id = requestAnimationFrame(loop)
        set({ opponentProgressTimer: id, opponentSimStart: simStart, opponentSimTotalMs: totalMs })
      }
    })

    onRanked(rankedSocketEvents.server.result, (payload: RankedResultSummary) => {
      clearCountdown()
      clearOpponentTimer()
      set({
        phase: 'result',
        result: payload,
        match: { ...get().match, stage: 'finished' },
      })
    })

    onRanked(rankedSocketEvents.server.error, () => {
      clearCountdown()
      set({ phase: 'idle', searchStatus: null })
    })
  },

  closeOverlay: () => {
    const timer = get().countdownTimer
    const oppTimer = get().opponentProgressTimer
    if (timer) window.clearInterval(timer)
    if (oppTimer) cancelAnimationFrame(oppTimer)
    set({
      overlayOpen: false,
      phase: 'idle',
      searchStatus: null,
      opponent: null,
      match: defaultMatch,
      result: null,
      countdownTimer: null,
      opponentProgressTimer: null,
      opponentSimStart: null,
      opponentSimTotalMs: null,
    })
    emitRanked(rankedSocketEvents.client.cancelQueue)
  },

  loadProfile: async () => {
    try {
      const res = await fetch('/api/ranked/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('leotype_token')}` } })
      if (!res.ok) return
      const data = (await res.json()) as RankedProfile
      set({ profile: data })
    } catch (err) {
      console.error('ranked profile load failed', err)
    }
  },

  joinQueue: (params) => {
    set({ phase: 'search', searchStatus: null, result: null, opponent: null, match: defaultMatch })
    emitRanked(rankedSocketEvents.client.joinQueue, {
      language: params?.language,
      difficulty: params?.difficulty,
    })
  },

  cancelQueue: () => {
    get().closeOverlay()
  },

  sendProgress: (payload) => {
    emitRanked(rankedSocketEvents.client.progress, payload)
  },

  finishMatch: (payload) => {
    emitRanked(rankedSocketEvents.client.finish, payload)
  },
}))
