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

  const renderChar = (char: string, index: number) => {
    const status = getCharStatus(index)

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
        } ${status === 'correct' ? 'transition-all duration-200' : ''}`}
      >
        {char}
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
  }
  
  return (
    <div className="relative">
      <div
        className={`text-2xl leading-relaxed font-mono ${themeClasses.secondary} select-none whitespace-normal`}
        style={{ wordBreak: 'normal', overflowWrap: 'normal' }}
      >
        <span className="inline">
          {text.split('').map((char, index) => renderChar(char, index))}

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
