import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import { areCharsEquivalent, normalizeCharForKey } from '../utils/charCompare'
import { keyboardLayouts } from '../config/keyboard'
import { useI18n } from '../hooks/useI18n'

function Keyboard() {
  const settings = useTypingStore((state) => state.settings)
  const testState = useTypingStore((state) => state.testState)
  const text = useTypingStore((state) => state.text)
  const themeClasses = getThemeClasses(settings.theme)
  const i18n = useI18n()
  
  if (!settings.showKeyboard) {
    return null
  }
  
  const getKeyStatus = (key: string): 'active' | 'correct' | 'incorrect' | 'normal' => {
    const currentIndex = testState.userInput.length
    const currentChar = text[currentIndex]
    const currentKey = currentChar ? normalizeCharForKey(currentChar) : null

    const lastInputIndex = currentIndex - 1
    if (lastInputIndex >= 0) {
      const expectedChar = text[lastInputIndex]
      const inputChar = testState.userInput[lastInputIndex]
      if (expectedChar && inputChar && !areCharsEquivalent(expectedChar, inputChar)) {
        const incorrectKey = normalizeCharForKey(inputChar)
        if (incorrectKey && key === incorrectKey) {
          return 'incorrect'
        }
      }
    }
    
    if (currentKey && key === currentKey) {
      return 'active'
    }
    
    if (currentIndex > 0) {
      const prevChar = text[currentIndex - 1]
      const prevKey = prevChar ? normalizeCharForKey(prevChar) : null
      if (prevKey && key === prevKey) {
        return 'correct'
      }
    }
    
    return 'normal'
  }
  
  const layout = keyboardLayouts[settings.language] || keyboardLayouts.ru

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 rounded-2xl p-6 ${themeClasses.card} border-2 ${themeClasses.border} shadow-xl`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${themeClasses.primary} text-center`}>
        {i18n.keyboard.title}
      </h3>
      <div className="flex flex-col items-center gap-2">
        {layout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => {
              const status = getKeyStatus(key)
              const isActive = status === 'active'
              
              return (
                <motion.div
                  key={key}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    backgroundColor:
                      status === 'active'
                        ? 'rgba(14, 165, 233, 0.3)'
                        : status === 'incorrect'
                        ? 'rgba(239, 68, 68, 0.25)'
                        : status === 'correct'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'transparent',
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${
                    isActive
                      ? `${themeClasses.border} ${themeClasses.accent} font-bold`
                      : status === 'incorrect'
                      ? 'border-red-500 text-red-400'
                      : `${themeClasses.border} ${themeClasses.secondary}`
                  } text-sm`}
                >
                  {key}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default Keyboard
