import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { usePvpStore } from '../../store/usePvpStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import { pvpConfig } from '../../config/pvp'
import { getProgress } from '../../utils/pvp'
import { areCharsEquivalent } from '../../utils/charCompare'
import { usePvpMatchEngine } from '../../hooks/usePvpMatchEngine'
import { typingMetricsConfig } from '../../config/typingMetrics'
import PvpRaceTrack from './PvpRaceTrack'
import PvpTextDisplay from './PvpTextDisplay'
import PvpStatsPanel from './PvpStatsPanel'
import PvpCountdownOverlay from './PvpCountdownOverlay'
import PvpMatchStatus from './PvpMatchStatus'

const isPrintableKey = (key: string) => key.length === 1

function countErrors(text: string, input: string) {
  let errors = 0
  for (let i = 0; i < input.length; i += 1) {
    if (!areCharsEquivalent(text[i] ?? '', input[i])) errors += 1
  }
  return errors
}

function PvpMatchView() {
  usePvpMatchEngine()

  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  const match = usePvpStore((state) => state.match)
  const activeRoom = usePvpStore((state) => state.activeRoom)
  const input = usePvpStore((state) => state.input)
  const streakCount = usePvpStore((state) => state.streakCount)
  const errorShakeKey = usePvpStore((state) => state.errorShakeKey)
  const updateInput = usePvpStore((state) => state.updateInput)
  const updateLocalMetrics = usePvpStore((state) => state.updateLocalMetrics)
  const finishLocalPlayer = usePvpStore((state) => state.finishLocalPlayer)
  const currentUser = usePvpStore((state) => state.currentUser)
  const clockOffsetMs = usePvpStore((state) => state.clockOffsetMs)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastEmitRef = useRef(0)
  const [showLeading, setShowLeading] = useState(false)
  const [showGo, setShowGo] = useState(false)
  const prevStageRef = useRef(match.stage)

  const localPlayer = useMemo(() => {
    return activeRoom?.players.find((player) => player.id === currentUser?.id) ?? null
  }, [activeRoom, currentUser?.id])
  const isLocalFinished = localPlayer?.status === 'finished'

  const leaderId = useMemo(() => {
    if (!activeRoom || activeRoom.players.length === 0) return null
    return activeRoom.players.reduce((max, player) => (player.progress > max.progress ? player : max)).id
  }, [activeRoom])

  useEffect(() => {
    if (!leaderId || !currentUser) return
    if (leaderId === currentUser.id) {
      setShowLeading(true)
      const timer = window.setTimeout(() => setShowLeading(false), pvpConfig.ui.leadingBadgeMs)
      return () => window.clearTimeout(timer)
    }
  }, [leaderId, currentUser])

  useEffect(() => {
    const prevStage = prevStageRef.current
    prevStageRef.current = match.stage
    if (prevStage === 'countdown' && match.stage === 'typing') {
      setShowGo(true)
      const timer = window.setTimeout(() => setShowGo(false), pvpConfig.ui.goFlashMs)
      return () => window.clearTimeout(timer)
    }
  }, [match.stage])

  useEffect(() => {
    if (match.stage === 'typing') {
      inputRef.current?.focus()
    }
  }, [match.stage])

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (match.stage !== 'typing' || isLocalFinished) return
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (!isPrintableKey(e.key)) return

      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (!inputRef.current) return
      if (document.activeElement === inputRef.current) return

      inputRef.current.focus()
      e.preventDefault()
      updateInput(input + e.key)
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [match.stage, updateInput, input, isLocalFinished])

  useEffect(() => {
    if (match.stage !== 'typing' || !match.startedAt || !localPlayer || isLocalFinished) return
    const now = Date.now()
    if (now - lastEmitRef.current < pvpConfig.network.progressThrottleMs) return

    const syncedNow = now + clockOffsetMs
    const elapsedSec = Math.max(pvpConfig.network.minElapsedSec, (syncedNow - match.startedAt) / 1000)
    const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length
    const minutesRatio = typingMetricsConfig.time.msPerMinute / typingMetricsConfig.time.msPerSecond
    const wpm = Math.round((wordsTyped / elapsedSec) * minutesRatio)
    const errors = countErrors(match.text, input)
    const accuracy = match.text.length
      ? Math.min(100, Math.max(0, Math.round((1 - errors / match.text.length) * 100)))
      : 100
    const progress = getProgress(input.length, match.text.length)
    const characters = input.length

    updateLocalMetrics({
      progress,
      wpm,
      accuracy,
      errors,
      timeSec: elapsedSec,
      words: wordsTyped,
      characters,
    })
    lastEmitRef.current = now
  }, [input, match.stage, match.startedAt, match.text, match.text.length, localPlayer, updateLocalMetrics, isLocalFinished, clockOffsetMs])

  useEffect(() => {
    if (match.stage !== 'typing' || !match.text || isLocalFinished) return
    if (input.length >= match.text.length) {
      finishLocalPlayer()
    }
  }, [input.length, match.stage, match.text, finishLocalPlayer, isLocalFinished])

  if (!activeRoom || !localPlayer) return null

  const streakActive = streakCount >= pvpConfig.ui.streakThreshold
  const liveWpm = localPlayer.stats?.wpm ?? 0
  const liveAccuracy = localPlayer.stats?.accuracy ?? 100
  const liveErrors = localPlayer.stats?.errors ?? 0
  const showCountdown = match.stage === 'countdown' && match.countdown > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-full max-w-6xl rounded-3xl border ${themeClasses.border} ${themeClasses.card} p-6 md:p-8 shadow-2xl overflow-hidden`}
      >
        <PvpCountdownOverlay value={match.countdown} show={showCountdown} />
        {showGo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className={`text-5xl font-bold ${themeClasses.primary} glow-text`}>{i18n.pvp.match.go}</div>
          </motion.div>
        )}

        {match.stage === 'generating' && (
          <PvpMatchStatus
            title={i18n.pvp.match.generatingTitle}
            hint={i18n.pvp.match.generatingHint}
            show
          />
        )}

        {match.stage === 'syncing' && (
          <PvpMatchStatus
            title={i18n.pvp.match.syncTitle}
            hint={i18n.pvp.match.syncHint}
            show
          />
        )}

        {match.stage !== 'generating' && match.stage !== 'syncing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${themeClasses.primary}`}>{i18n.pvp.match.title}</h2>
              {showLeading && (
                <span className={`text-xs px-2 py-1 rounded-full border ${themeClasses.border} ${themeClasses.accent}`}>
                  {i18n.pvp.match.leading}
                </span>
              )}
            </div>

            <PvpRaceTrack players={activeRoom.players} localPlayerId={localPlayer.id} />

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4">
              <div className="space-y-4 relative">
                <PvpTextDisplay
                  text={match.text}
                  input={input}
                  caretIndex={input.length}
                  errorShakeKey={errorShakeKey}
                  streakActive={streakActive}
                />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    if (isLocalFinished) return
                    updateInput(e.target.value)
                  }}
                  disabled={isLocalFinished || match.stage !== 'typing'}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="absolute inset-0 opacity-0 cursor-none"
                />
              </div>
              <PvpStatsPanel wpm={liveWpm} accuracy={liveAccuracy} errors={liveErrors} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PvpMatchView
