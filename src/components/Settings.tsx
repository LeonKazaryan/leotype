import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { TestMode, Theme, AIDifficulty } from '../types'
import { getThemeClasses } from '../utils/themes'

function Settings() {
  const settings = useTypingStore((state) => state.settings)
  const setMode = useTypingStore((state) => state.setMode)
  const setTime = useTypingStore((state) => state.setTime)
  const setWords = useTypingStore((state) => state.setWords)
  const setTheme = useTypingStore((state) => state.setTheme)
  const toggleKeyboard = useTypingStore((state) => state.toggleKeyboard)
  const toggleAI = useTypingStore((state) => state.toggleAI)
  const setAITopic = useTypingStore((state) => state.setAITopic)
  const setAIDifficulty = useTypingStore((state) => state.setAIDifficulty)
  const resetTest = useTypingStore((state) => state.resetTest)
  const generateNewText = useTypingStore((state) => state.generateNewText)
  const isGeneratingAI = useTypingStore((state) => state.testState.isGeneratingAI)
  
  const themeClasses = getThemeClasses(settings.theme)
  
  const modes: TestMode[] = ['time', 'words', 'quote']
  const themes: Theme[] = ['dark', 'light', 'neon', 'ocean', 'forest']
  const timeOptions = [15, 30, 60, 120]
  const wordOptions = [15, 20, 25, 50]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-6 ${themeClasses.card} border ${themeClasses.border} shadow-xl`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
              Режим
            </label>
            <div className="flex gap-2 flex-wrap">
              {modes.map((mode) => (
                <motion.button
                  key={mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode(mode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                Время (сек)
              </label>
              <div className="flex gap-2 flex-wrap">
                {timeOptions.map((time) => (
                  <motion.button
                    key={time}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTime(time)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[3rem] ${
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
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                Слов
              </label>
              <div className="flex gap-2 flex-wrap">
                {wordOptions.map((words) => (
                  <motion.button
                    key={words}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWords(words)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[3rem] ${
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
        </div>
        
        <div className="space-y-2">
          <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
            Тема
          </label>
          <div className="flex gap-2 flex-wrap">
            {themes.map((theme) => (
              <motion.button
                key={theme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
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
        
        <div className={`border-t pt-4 ${themeClasses.border} border-opacity-20`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className={`text-base font-semibold ${themeClasses.primary}`}>
                Настройки AI
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${themeClasses.secondary}`}>
                  Тематика
                </label>
                <input
                  type="text"
                  value={settings.aiTopic}
                  onChange={(e) => setAITopic(e.target.value)}
                  placeholder="Например: программирование, наука, история..."
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  Укажите тему для генерации текста
                </p>
              </div>
              
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${themeClasses.secondary}`}>
                  Сложность
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((difficulty) => {
                    const labels = {
                      easy: { text: 'Легкая', icon: '🟢' },
                      medium: { text: 'Средняя', icon: '🟡' },
                      hard: { text: 'Сложная', icon: '🔴' },
                    }
                    const label = labels[difficulty]
                    
                    return (
                      <motion.button
                        key={difficulty}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAIDifficulty(difficulty)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          settings.aiDifficulty === difficulty
                            ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                            : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                        }`}
                      >
                        {label.icon} {label.text}
                      </motion.button>
                    )
                  })}
                </div>
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  Выберите уровень сложности текста
                </p>
              </div>
            </div>
            
            <div className={`text-xs ${themeClasses.secondary} opacity-70 text-center pt-2 border-t ${themeClasses.border} border-opacity-20`}>
              💡 Настройки применяются при нажатии "Новый текст" или "Сброс"
            </div>
          </div>
        </div>
        
        <div className={`border-t pt-4 ${themeClasses.border} border-opacity-20`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                Дополнительно
              </label>
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleKeyboard}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    settings.showKeyboard
                      ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                  }`}
                >
                  ⌨️ {settings.showKeyboard ? 'Скрыть' : 'Показать'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAI}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    settings.useAI
                      ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                  }`}
                >
                  🤖 {settings.useAI ? 'Вкл' : 'Выкл'}
                </motion.button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                Действия
              </label>
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={!isGeneratingAI ? { scale: 1.05 } : {}}
                  whileTap={!isGeneratingAI ? { scale: 0.95 } : {}}
                  onClick={generateNewText}
                  disabled={isGeneratingAI}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                    isGeneratingAI ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingAI ? '⏳ Генерация...' : 'Новый текст'}
                </motion.button>
                <motion.button
                  whileHover={!isGeneratingAI ? { scale: 1.05 } : {}}
                  whileTap={!isGeneratingAI ? { scale: 0.95 } : {}}
                  onClick={resetTest}
                  disabled={isGeneratingAI}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                    isGeneratingAI ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingAI ? '⏳ Генерация...' : 'Сброс'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
