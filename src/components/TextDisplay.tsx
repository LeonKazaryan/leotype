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
        return `${themeClasses.accent} underline`
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
        {chars.map((char, index) => {
          const status = getCharStatus(index)
          const isSpace = char === ' '
          
          return (
            <motion.span
              key={index}
              initial={false}
              animate={{
                scale: status === 'current' ? 1.15 : status === 'incorrect' ? [1, 1.1, 1] : status === 'correct' ? [1, 1.05, 1] : 1,
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
                  className={`absolute left-0 top-0 w-0.5 h-6 ${themeClasses.accent} bg-current`}
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
      </div>
      
      {caretPosition >= text.length && (
        <motion.span
          className={`inline-block w-0.5 h-6 ml-1 ${themeClasses.accent} bg-current`}
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
    </div>
  )
}

export default TextDisplay
