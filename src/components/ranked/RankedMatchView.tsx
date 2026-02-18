import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { useRankedStore } from '../../store/useRankedStore'
import { getThemeClasses } from '../../utils/themes'
import PvpTextDisplay from '../pvp/PvpTextDisplay'
import PvpStatsPanel from '../pvp/PvpStatsPanel'
import { getProgress } from '../../utils/pvp'
import { calculateStats } from '../../utils/stats'

function RankedMatchView() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  const match = useRankedStore((state) => state.match)
  const opponent = useRankedStore((state) => state.opponent)
  const sendProgress = useRankedStore((state) => state.sendProgress)
  const finishMatch = useRankedStore((state) => state.finishMatch)

  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastEmitRef = useRef(0)

  const progressSelf = match.progress.self ?? 0
  const progressOpponent = match.progress.opponent ?? 0

  const liveStats = useMemo(() => {
    const elapsedSec = Math.max(0.01, (Date.now() - (match.startAt ?? Date.now())) / 1000)
    const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length
    const wpm = Math.round((wordsTyped / elapsedSec) * 60)
    const errors = calculateStats(match.text, input, elapsedSec).characters.incorrect
    const accuracy = match.text.length
      ? Math.min(100, Math.max(0, Math.round((1 - errors / match.text.length) * 100)))
      : 100
    return { wpm, accuracy, errors, timeSec: elapsedSec, words: wordsTyped, characters: input.length }
  }, [input, match.startAt, match.text])

  useEffect(() => {
    if (match.stage === 'typing') {
      inputRef.current?.focus()
    }
  }, [match.stage])

  useEffect(() => {
    if (match.stage !== 'typing' || !match.startAt) return
    const now = Date.now()
    if (now - lastEmitRef.current < 150) return
    const progress = getProgress(input.length, match.text.length)
    sendProgress({
      progress,
      wpm: liveStats.wpm,
      accuracy: liveStats.accuracy,
      errors: liveStats.errors,
      timeSec: liveStats.timeSec,
      words: liveStats.words,
      characters: liveStats.characters,
    })
    lastEmitRef.current = now
  }, [input, match.stage, match.startAt, match.text.length, liveStats, progressOpponent, sendProgress])

  useEffect(() => {
    if (match.stage !== 'typing') return
    if (input.length >= match.text.length) {
      finishMatch({
        wpm: liveStats.wpm,
        accuracy: liveStats.accuracy,
        errors: liveStats.errors,
        timeSec: liveStats.timeSec,
        words: liveStats.words,
        characters: liveStats.characters,
      })
    }
  }, [input.length, match.stage, match.text.length, finishMatch, liveStats])

  const showCountdown = match.stage === 'countdown' && match.countdown > 0
  const typingDisabled = match.stage !== 'typing'

  return (
    <div className="relative w-full max-w-4xl rounded-3xl border px-6 py-5 shadow-2xl backdrop-blur-lg" style={{ background: 'rgba(15,23,42,0.9)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className={themeClasses.secondary}>Ты</span>
          <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              animate={{ width: `${progressSelf * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              className="h-full bg-primary-500"
            />
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full border border-primary-500 text-primary-400">VS</div>
        <div className="flex items-center gap-2 text-sm">
          <span className={themeClasses.secondary}>{opponent?.nickname ?? 'Opponent'}</span>
          <div className="w-48 h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              animate={{ width: `${progressOpponent * 100}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 28 }}
              className="h-full bg-pink-500"
            />
          </div>
        </div>
      </div>

      {showCountdown && (
        <div className="text-center mb-4">
          <div className={`text-5xl font-bold ${themeClasses.primary} glow-text`}>{match.countdown}</div>
          <div className={`text-xs ${themeClasses.secondary}`}>Старт через</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4">
        <div className="relative">
          <PvpTextDisplay text={match.text} input={input} caretIndex={input.length} errorShakeKey={0} streakActive={false} />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              if (typingDisabled) return
              const next = e.target.value.slice(0, match.text.length)
              setInput(next)
            }}
            spellCheck={false}
            className="absolute inset-0 opacity-0"
            disabled={typingDisabled}
          />
        </div>
        <PvpStatsPanel wpm={liveStats.wpm} accuracy={liveStats.accuracy} errors={liveStats.errors} />
      </div>
    </div>
  )
}

export default RankedMatchView
