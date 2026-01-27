import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

interface TextDisplayProps {
  text: string
  getCharStatus: (index: number) => 'correct' | 'incorrect' | 'pending' | 'current'
  caretPosition: number
}

function TextDisplay({ text, getCharStatus, caretPosition }: TextDisplayProps) {
  const settings = useTypingStore((state) => state.settings)
  const themeClasses = getThemeClasses(settings.theme)
  
  const chars = text.split('')
  
  const getCharColor = (status: string) => {
    switch (status) {
      case 'correct':
        return themeClasses.primary
      case 'incorrect':
        return 'text-red-500'
      case 'current':
        return themeClasses.secondary
      default:
        return themeClasses.secondary
    }
  }
  
  return (
    <div className="relative">
      <div
        className={`text-2xl leading-relaxed font-mono break-words ${themeClasses.secondary} select-none`}
        style={{ wordSpacing: '0.5em' }}
      >
        <span className="inline-flex flex-wrap items-baseline gap-0">
          {chars.map((char, index) => {
            const status = getCharStatus(index)
            const isSpace = char === ' '
            
            return (
              <motion.span
                key={index}
                initial={false}
                animate={{
                  scale: status === 'incorrect' ? [1, 1.1, 1] : status === 'correct' ? [1, 1.05, 1] : 1,
                  x: status === 'incorrect' ? [0, -3, 3, -3, 3, 0] : 0,
                }}
                transition={{
                  duration: status === 'incorrect' ? 0.3 : 0.15,
                  type: 'spring',
                  stiffness: 300,
                }}
                className={`${getCharColor(status)} ${
                  status === 'current' ? 'relative' : ''
                } ${isSpace ? 'inline-block w-2' : ''} ${
                  status === 'correct' ? 'transition-all duration-200' : ''
                }`}
              >
                {char === ' ' ? '\u00A0' : char}
                {status === 'current' && (
                <motion.span
                  className={`absolute left-0 w-0.5 ${themeClasses.accent} bg-current`}
                  style={{ top: '0.2em', height: '1em' }}
                  animate={{
                    opacity: [1, 0, 1],
                  }}
                  transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.span>
            )
          })}

          {caretPosition >= text.length && (
            <motion.span
              className={`inline-block w-0.5 ml-1 align-baseline self-baseline ${themeClasses.accent} bg-current`}
              style={{ height: '1em', lineHeight: '1em', transform: 'translateY(0.2em)' }}
              animate={{
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </span>
      </div>
    </div>
  )
}

export default TextDisplay
