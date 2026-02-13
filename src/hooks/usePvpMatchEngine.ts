import { useEffect, useRef } from 'react'
import { pvpConfig } from '../config/pvp'
import { usePvpStore } from '../store/usePvpStore'
import type { PvpPlayer } from '../types/pvp'
import { getProgress } from '../utils/pvp'

const updateBotPlayers = (players: PvpPlayer[], textLength: number, elapsedMs: number) => {
  return players.map((player) => {
    if (!player.botProfile || player.status === 'finished') {
      return player
    }

    const charsPerMinute = player.botProfile.wpm * 5
    const charsPerMs = charsPerMinute / 60000
    const typedChars = Math.min(textLength, Math.floor(elapsedMs * charsPerMs))
    const progress = getProgress(typedChars, textLength)

    if (progress >= 1) {
      return {
        ...player,
        progress: 1,
        status: 'finished',
        stats: {
          wpm: player.botProfile.wpm,
          accuracy: player.botProfile.accuracy,
          errors: Math.max(0, Math.round(textLength * (1 - player.botProfile.accuracy / 100))),
          timeSec: Math.max(0.01, Math.round((elapsedMs / 1000) * 100) / 100),
        },
      }
    }

    return {
      ...player,
      progress,
      status: 'typing',
      stats: player.stats ?? {
        wpm: player.botProfile.wpm,
        accuracy: player.botProfile.accuracy,
        errors: 0,
        timeSec: 0,
      },
    }
  })
}

export const usePvpMatchEngine = () => {
  const match = usePvpStore((state) => state.match)
  const activeRoom = usePvpStore((state) => state.activeRoom)
  const setMatchStage = usePvpStore((state) => state.setMatchStage)
  const setCountdown = usePvpStore((state) => state.setCountdown)
  const updateMatch = usePvpStore((state) => state.updateMatch)
  const setActiveRoomPlayers = usePvpStore((state) => state.setActiveRoomPlayers)
  const finalizeResults = usePvpStore((state) => state.finalizeResults)

  const countdownRef = useRef<number | null>(null)
  const botTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (match.stage !== 'syncing') return

    const timeout = window.setTimeout(() => {
      setCountdown(pvpConfig.network.countdownSeconds)
      setMatchStage('countdown')
    }, pvpConfig.network.syncHoldMs)

    return () => window.clearTimeout(timeout)
  }, [match.stage, setCountdown, setMatchStage])

  useEffect(() => {
    if (match.stage !== 'countdown') return

    let current = pvpConfig.network.countdownSeconds
    setCountdown(current)

    countdownRef.current = window.setInterval(() => {
      current -= 1
      setCountdown(current)

      if (current <= 0) {
        if (countdownRef.current) {
          window.clearInterval(countdownRef.current)
        }
        updateMatch({ startedAt: Date.now() })
        setMatchStage('typing')

        if (activeRoom) {
          const typingPlayers = activeRoom.players.map((player) => ({
            ...player,
            status: 'typing' as const,
          }))
          setActiveRoomPlayers(typingPlayers)
        }
      }
    }, pvpConfig.network.countdownTickMs)

    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current)
      }
    }
  }, [match.stage, activeRoom, setCountdown, setMatchStage, setActiveRoomPlayers, updateMatch])

  useEffect(() => {
    if (match.stage !== 'typing' || !match.startedAt) return

    const start = match.startedAt
    const textLength = match.text.length

    botTimerRef.current = window.setInterval(() => {
      const room = usePvpStore.getState().activeRoom
      if (!room) return
      const elapsed = Date.now() - start
      const updatedPlayers = updateBotPlayers(room.players, textLength, elapsed)
      setActiveRoomPlayers(updatedPlayers)
    }, pvpConfig.network.botUpdateMs)

    return () => {
      if (botTimerRef.current) {
        window.clearInterval(botTimerRef.current)
      }
    }
  }, [match.stage, match.startedAt, match.text.length, setActiveRoomPlayers])

  useEffect(() => {
    if (match.stage !== 'typing' || !activeRoom) return

    const allFinished = activeRoom.players.every((player) => player.status === 'finished')
    if (allFinished) {
      finalizeResults()
      return
    }

    if (match.firstFinishAt) {
      const elapsed = Date.now() - match.firstFinishAt
      if (elapsed >= pvpConfig.network.finishGraceMs) {
        finalizeResults()
      }
    }
  }, [match.stage, match.firstFinishAt, activeRoom, finalizeResults])
}
