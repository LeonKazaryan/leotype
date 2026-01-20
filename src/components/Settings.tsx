import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { TestMode, Theme } from '../types'
import { getThemeClasses } from '../utils/themes'

function Settings() {
  const settings = useTypingStore((state) => state.settings)
  const setMode = useTypingStore((state) => state.setMode)
  const setTime = useTypingStore((state) => state.setTime)
  const setWords = useTypingStore((state) => state.setWords)
  const setTheme = useTypingStore((state) => state.setTheme)
  const toggleKeyboard = useTypingStore((state) => state.toggleKeyboard)
  const toggleAI = useTypingStore((state) => state.toggleAI)
  const resetTest = useTypingStore((state) => state.resetTest)
  const generateNewText = useTypingStore((state) => state.generateNewText)
  
  const themeClasses = getThemeClasses(settings.theme)
  
  const modes: TestMode[] = ['time', 'words', 'quote']
  const themes: Theme[] = ['dark', 'light', 'neon', 'ocean', 'forest']
  const timeOptions = [15, 30, 60, 120]
  const wordOptions = [10, 25, 50, 100]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-6 ${themeClasses.card} border ${themeClasses.border} shadow-xl`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondary}`}>
            Режим
          </label>
          <div className="flex gap-2">
            {modes.map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.mode === mode
                    ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                }`}
              >
                {mode === 'time' ? 'Время' : mode === 'words' ? 'Слова' : 'Цитата'}
              </motion.button>
            ))}
          </div>
        </div>
        
        {settings.mode === 'time' && (
          <div>
            <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondary}`}>
              Время (сек)
            </label>
            <div className="flex gap-2 flex-wrap">
              {timeOptions.map((time) => (
                <motion.button
                  key={time}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTime(time)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    settings.time === time
                      ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                  }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        {settings.mode === 'words' && (
          <div>
            <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondary}`}>
              Слов
            </label>
            <div className="flex gap-2 flex-wrap">
              {wordOptions.map((words) => (
                <motion.button
                  key={words}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWords(words)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    settings.words === words
                      ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                  }`}
                >
                  {words}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondary}`}>
            Тема
          </label>
          <div className="flex gap-2 flex-wrap">
            {themes.map((theme) => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors capitalize ${
                  settings.theme === theme
                    ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                }`}
              >
                {theme}
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${themeClasses.secondary}`}>
              Дополнительно
            </label>
            <div className="flex gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleKeyboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.showKeyboard
                    ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                }`}
              >
                {settings.showKeyboard ? 'Скрыть' : 'Показать'} клавиатуру
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAI}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.useAI
                    ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                }`}
              >
                🤖 {settings.useAI ? 'AI включен' : 'AI выключен'}
              </motion.button>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateNewText}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
            >
              Новый текст
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTest}
              className={`px-4 py-2 rounded-lg font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
            >
              Сброс
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
