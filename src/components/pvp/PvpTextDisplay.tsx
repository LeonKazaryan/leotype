import { memo } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { areCharsEquivalent } from '../../utils/charCompare'

type CharStatus = 'correct' | 'incorrect' | 'pending' | 'current'

interface PvpTextDisplayProps {
  text: string
  input: string
  caretIndex: number
  errorShakeKey: number
  streakActive: boolean
}

interface CharProps {
  char: string
  status: CharStatus
}

const PvpChar = memo(function PvpChar({ char, status }: CharProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  const getCharColor = (state: CharStatus) => {
    switch (state) {
      case 'correct':
        return themeClasses.primary
      case 'incorrect':
        return 'text-red-400'
      case 'current':
        return themeClasses.secondary
      default:
        return themeClasses.secondary
    }
  }

  return (
    <motion.span
      initial={false}
      animate={{
        scale: status === 'incorrect' ? [1, 1.08, 1] : status === 'correct' ? [1, 1.03, 1] : 1,
        x: status === 'incorrect' ? [0, -3, 3, -3, 3, 0] : 0,
      }}
      transition={{ duration: status === 'incorrect' ? 0.3 : 0.15, type: 'spring', stiffness: 300 }}
      className={`${getCharColor(status)} ${status === 'current' ? 'underline' : ''}`}
    >
      {char}
    </motion.span>
  )
}, (prev, next) => prev.status === next.status && prev.char === next.char)

const buildStatus = (text: string, input: string, index: number): CharStatus => {
  if (index < input.length) {
    return areCharsEquivalent(text[index], input[index]) ? 'correct' : 'incorrect'
  }
  if (index === input.length) return 'current'
  return 'pending'
}

function PvpTextDisplay({ text, input, caretIndex, errorShakeKey, streakActive }: PvpTextDisplayProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  return (
    <motion.div
      key={errorShakeKey}
      animate={{ x: errorShakeKey > 0 ? [0, -6, 6, -4, 4, 0] : 0 }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-6 ${
        streakActive ? 'shadow-lg shadow-white/10' : ''
      }`}
    >
      <div className={`text-xl leading-relaxed font-mono ${themeClasses.secondary} select-none whitespace-normal`}>
        {text.split('').map((char, index) => (
          <PvpChar
            key={index}
            char={char}
            status={buildStatus(text, input, index)}
          />
        ))}
      </div>
      <div className={`mt-3 text-xs ${themeClasses.secondary}`}>{caretIndex}/{text.length}</div>
    </motion.div>
  )
}

export default PvpTextDisplay
