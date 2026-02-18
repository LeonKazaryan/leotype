import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Theme, AIDifficulty } from '../../types'
import { getLoaderPalette } from '../../utils/loaderPalette'
import { ThemeClasses } from '../../utils/themes'

export type LoaderSize = 'full' | 'compact'

interface NeuralTypingLoaderProps {
  title: string
  hint: string
  difficulty: AIDifficulty
  theme: Theme
  themeClasses: ThemeClasses
  topic?: string
  size?: LoaderSize
  showReadyOnExit?: boolean
}

type DifficultyTuning = {
  tickMs: number
  glitchChance: number
  nodeCount: number
  letterCount: number
  holdMs: number
}

const defaultSyllables = ['qu', 'an', 'to', 'mem', 'ry', 'syn', 'th', 'ax', 'vec', 'tor', 'nn', 'core', 'flux', 'byte']

const tuningMap: Record<AIDifficulty, DifficultyTuning> = {
  easy: { tickMs: 150, glitchChance: 0.0, nodeCount: 10, letterCount: 12, holdMs: 1400 },
  medium: { tickMs: 130, glitchChance: 0.01, nodeCount: 14, letterCount: 14, holdMs: 1200 },
  hard: { tickMs: 110, glitchChance: 0.03, nodeCount: 18, letterCount: 16, holdMs: 900 },
}

function buildPhrases(topic?: string) {
  if (!topic || topic.trim().length === 0) {
    return ['quantum', 'quantum memory', 'vector stack', 'neural field', 'latent typing', 'context window', 'token stream']
  }
  const words = topic.split(/[\s,]+/).filter(Boolean)
  const combos: string[] = []
  for (let i = 0; i < words.length; i++) {
    for (let j = i; j < Math.min(words.length, i + 3); j++) {
      combos.push(words.slice(i, j + 1).join(' '))
    }
  }
  if (combos.length === 0) return ['ai typing', topic.trim()]
  return combos.slice(0, 12)
}

function makePseudoWord(syllables: string[], min = 2, max = 3) {
  const len = Math.floor(Math.random() * (max - min + 1)) + min
  const parts = Array.from({ length: len }, () => syllables[Math.floor(Math.random() * syllables.length)])
  return parts.join('')
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function jitter(value: number, range: number) {
  return value + (Math.random() - 0.5) * range
}

export default function NeuralTypingLoader({
  title,
  hint,
  difficulty,
  theme,
  themeClasses,
  topic,
  size = 'full',
  showReadyOnExit = true,
}: NeuralTypingLoaderProps) {
  const reducedMotion = useReducedMotion()
  const palette = getLoaderPalette(theme)
  const tuning = tuningMap[difficulty]
  const [display, setDisplay] = useState('')
  const [target, setTarget] = useState('quantum memory')
  const [readyPulse, setReadyPulse] = useState(false)
  const holdRef = useRef<number>(0)
  const letters = useMemo(() => buildPhrases(topic), [topic])
  const nodes = useMemo(() => Array.from({ length: tuning.nodeCount }, (_, id) => ({ id })), [tuning.nodeCount])
  const lettersPool = useMemo(
    () => Array.from({ length: tuning.letterCount }, (_, id) => ({ id, char: String.fromCharCode(97 + (id % 26)) })),
    [tuning.letterCount],
  )
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTarget(letters[Math.floor(Math.random() * letters.length)] ?? 'text stream')
    setDisplay('')
    holdRef.current = 0
  }, [letters])

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(target)
      return
    }

    const nextTick = () => {
      setDisplay((prev) => {
        // if reached target, hold then switch
        if (prev === target) {
          holdRef.current += tuning.tickMs
          if (holdRef.current >= tuning.holdMs) {
            holdRef.current = 0
            const newTarget =
              Math.random() > 0.55 ? letters[Math.floor(Math.random() * letters.length)] : makePseudoWord(defaultSyllables)
            setTarget(newTarget)
          }
          return prev
        }

        const minLen = Math.min(prev.length, target.length)
        let mismatchIndex = minLen
        for (let i = 0; i < minLen; i++) {
          if (prev[i] !== target[i]) {
            mismatchIndex = i
            break
          }
        }

        // gentle replace/delete one char
        if (prev.length > target.length) {
          return prev.slice(0, -1)
        }
        if (mismatchIndex < prev.length) {
          const next = prev.split('')
          next[mismatchIndex] = target[mismatchIndex] ?? ''
          return next.join('').slice(0, target.length)
        }

        // type next char
        const nextChar = target[prev.length] ?? ''
        return prev + nextChar
      })
    }

    tickRef.current = setInterval(nextTick, tuning.tickMs)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [letters, target, tuning.tickMs, tuning.glitchChance, tuning.holdMs, reducedMotion])

  useEffect(() => {
    if (!showReadyOnExit) return
    const timer = setInterval(() => setReadyPulse((v) => !v), 1600)
    return () => clearInterval(timer)
  }, [showReadyOnExit])

  const wrapperPadding = size === 'full' ? 'p-8' : 'p-4'
  const heightClass = size === 'full' ? 'min-h-[260px]' : 'min-h-[160px]'
  const showGlitch = !reducedMotion && difficulty === 'hard'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative w-full ${heightClass} ${wrapperPadding} overflow-hidden rounded-2xl border ${themeClasses.border} ${themeClasses.card}`}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${palette.bgFrom}, transparent 35%), radial-gradient(circle at 70% 60%, ${palette.bgTo}, transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0))`,
        }}
      />

      {/* Neural nodes */}
      <div className="absolute inset-0 mix-blend-screen opacity-80">
        {nodes.map((node) => {
          const sizePx = randomRange(6, 11)
          const startX = randomRange(10, 90)
          const startY = randomRange(10, 90)
          return (
            <motion.span
              key={node.id}
              className="absolute rounded-full"
              style={{
                width: sizePx,
                height: sizePx,
                background: palette.node,
                boxShadow: palette.glow,
                left: `${startX}%`,
                top: `${startY}%`,
              }}
              animate={{
                x: [0, jitter(3, 4), 0],
                y: [0, jitter(3, 4), 0],
                opacity: [0.7, 0.85, 0.72],
              }}
              transition={{
                duration: randomRange(10, 15),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 1.4,
              }}
            />
          )
        })}
      </div>

      {/* Floating letters */}
      <div className="absolute inset-0 pointer-events-none">
        {lettersPool.map((item) => (
          <motion.span
            key={item.id}
            className="absolute text-xs font-semibold uppercase"
            style={{
              color: palette.line,
              left: `${randomRange(5, 95)}%`,
              top: `${randomRange(5, 95)}%`,
            }}
            animate={{
              y: [0, randomRange(-3, 3), 0],
              opacity: [0, 0.35, 0],
              scale: [0.96, 1.0, 0.98],
            }}
            transition={{
              duration: randomRange(6, 9),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 1.8,
            }}
          >
            {item.char}
          </motion.span>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center gap-3">
        <div className={`text-sm font-semibold tracking-wide uppercase ${themeClasses.secondary} opacity-80`}>{title}</div>
        <div className={`text-lg ${themeClasses.primary}`}>{hint}</div>

        <div className="mt-2 w-full max-w-xl">
          <div
            className={`relative mx-auto px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.overlayPlain} shadow-inner overflow-hidden`} 
            style={{ minWidth: '16ch' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-40" />
            <div className="relative flex items-center justify-center font-mono text-base sm:text-lg whitespace-nowrap">
              <span className={`${themeClasses.primary} flex items-center gap-1 transition-all duration-150`}>
                <span className="relative">
                  {display || target}
                  <span className={`absolute -right-2 top-0 h-full w-0.5 bg-current ${reducedMotion ? '' : 'caret-blink'}`} />
                </span>
              </span>
              {showGlitch && (
                <span className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
                  <span className="absolute inset-0 glitch-shift" />
                </span>
              )}
            </div>
          </div>
        </div>

        {showReadyOnExit && (
          <motion.div
            className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${themeClasses.border} ${themeClasses.secondary} bg-white/5`}
            animate={{
              scale: readyPulse ? 1.03 : 1,
              opacity: readyPulse ? 1 : 0.8,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <span className={`w-2 h-2 rounded-full ${themeClasses.accentBg} animate-pulse`} />
            <span>Text ready</span>
          </motion.div>
        )}
      </div>

      {/* Overlay frame */}
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" style={{ boxShadow: palette.glow }} />
    </motion.div>
  )
}
