import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

const keyboardLayout = [
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.'],
]

function Keyboard() {
  const settings = useTypingStore((state) => state.settings)
  const testState = useTypingStore((state) => state.testState)
  const text = useTypingStore((state) => state.text)
  const themeClasses = getThemeClasses(settings.theme)
  
  if (!settings.showKeyboard) {
    return null
  }
  
  const getKeyStatus = (key: string): 'active' | 'correct' | 'incorrect' | 'normal' => {
    const currentIndex = testState.userInput.length
    const currentChar = text[currentIndex]?.toLowerCase()
    
    if (key === currentChar) {
      return 'active'
    }
    
    if (currentIndex > 0) {
      const prevChar = text[currentIndex - 1]?.toLowerCase()
      if (key === prevChar) {
        return 'correct'
      }
    }
    
    return 'normal'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 rounded-2xl p-6 ${themeClasses.card} border-2 ${themeClasses.border} shadow-xl`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${themeClasses.primary} text-center`}>
        Виртуальная клавиатура
      </h3>
      <div className="flex flex-col items-center gap-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => {
              const status = getKeyStatus(key)
              const isActive = status === 'active'
              
              return (
                <motion.div
                  key={key}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor:
                      status === 'active'
                        ? 'rgba(14, 165, 233, 0.3)'
                        : status === 'correct'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${
                    isActive
                      ? `${themeClasses.border} ${themeClasses.accent} font-bold`
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
