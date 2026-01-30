import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import type { TestMode, Theme, AIDifficulty } from '../types'
import { supportedLanguages } from '../config/language'
import { settingsOptions } from '../config/settings'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'

function Settings() {
  const settings = useTypingStore(state => state.settings)
  const setMode = useTypingStore(state => state.setMode)
  const setTime = useTypingStore(state => state.setTime)
  const setWords = useTypingStore(state => state.setWords)
  const setTheme = useTypingStore(state => state.setTheme)
  const setLanguage = useTypingStore(state => state.setLanguage)
  const toggleKeyboard = useTypingStore(state => state.toggleKeyboard)
  const toggleAI = useTypingStore(state => state.toggleAI)
  const setAITopic = useTypingStore(state => state.setAITopic)
  const setAIDifficulty = useTypingStore(state => state.setAIDifficulty)
  const resetTest = useTypingStore(state => state.resetTest)
  const generateNewText = useTypingStore(state => state.generateNewText)
  const isGeneratingAI = useTypingStore(state => state.testState.isGeneratingAI)
  const i18n = useI18n()

  const themeClasses = getThemeClasses(settings.theme)
  const isQuoteMode = settings.mode === 'quote'
  const hasAITopic = settings.aiTopic.trim().length > 0
  const isQuoteBlocked = isQuoteMode && (!settings.useAI || !hasAITopic)

  const modes: TestMode[] = settingsOptions.modes
  const themes: Theme[] = settingsOptions.themes
  const timeOptions = settingsOptions.timeOptions
  const wordOptions = settingsOptions.wordOptions

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
            <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.settings.modeLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {modes.map(mode => (
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
                  {i18n.settings.modeOptions[mode]}
                </motion.button>
              ))}
            </div>
          </div>

          {settings.mode === 'time' && (
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                {i18n.settings.timeLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                {timeOptions.map(time => (
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
                {i18n.settings.wordsLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                {wordOptions.map(words => (
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
          <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.theme.label}</label>
          <div className="flex gap-2 flex-wrap">
            {themes.map(theme => (
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
                {i18n.theme.options[theme]}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.language.label}</label>
          <div className="flex gap-2 flex-wrap">
            {supportedLanguages.map((language) => (
              <motion.button
                key={language}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLanguage(language)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  settings.language === language
                    ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                }`}
              >
                {i18n.language.options[language]}
              </motion.button>
            ))}
          </div>
        </div>

        <div className={`border-t pt-4 ${themeClasses.border} border-opacity-20`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h3 className={`text-base font-semibold ${themeClasses.primary}`}>{i18n.settings.ai.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${themeClasses.secondary}`}>
                  {i18n.settings.ai.topicLabel}
                </label>
                <input
                  type="text"
                  value={settings.aiTopic}
                  onChange={e => setAITopic(e.target.value)}
                  placeholder={i18n.settings.ai.topicPlaceholder}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  {i18n.settings.ai.topicHint}
                </p>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${themeClasses.secondary}`}>
                  {i18n.settings.ai.difficultyLabel}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(difficulty => {
                    const icon = settingsOptions.aiDifficultyOptions[difficulty]

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
                        {icon} {i18n.settings.ai.difficultyOptions[difficulty]}
                      </motion.button>
                    )
                  })}
                </div>
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  {i18n.settings.ai.difficultyHint}
                </p>
              </div>
            </div>

            <div
              className={`text-xs ${themeClasses.secondary} opacity-70 text-center pt-2 border-t ${themeClasses.border} border-opacity-20`}
            >
              {i18n.settings.ai.hint}
            </div>
          </div>
        </div>

        <div className={`border-t pt-4 ${themeClasses.border} border-opacity-20`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                {i18n.settings.extrasLabel}
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
                  ⌨️ {settings.showKeyboard ? i18n.settings.keyboardToggle.hide : i18n.settings.keyboardToggle.show}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAI}
                  disabled={isQuoteMode}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    settings.useAI
                      ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                  } ${isQuoteMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🤖 {settings.useAI ? i18n.settings.aiToggle.on : i18n.settings.aiToggle.off}
                </motion.button>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                {i18n.settings.actionsLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={!isGeneratingAI ? { scale: 1.05 } : {}}
                  whileTap={!isGeneratingAI ? { scale: 0.95 } : {}}
                  onClick={generateNewText}
                  disabled={isGeneratingAI || isQuoteBlocked}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                    isGeneratingAI || isQuoteBlocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingAI ? i18n.settings.actions.generating : i18n.settings.actions.newText}
                </motion.button>
                <motion.button
                  whileHover={!isGeneratingAI ? { scale: 1.05 } : {}}
                  whileTap={!isGeneratingAI ? { scale: 0.95 } : {}}
                  onClick={resetTest}
                  disabled={isGeneratingAI || isQuoteBlocked}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                    isGeneratingAI || isQuoteBlocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingAI ? i18n.settings.actions.generating : i18n.settings.actions.reset}
                </motion.button>
              </div>
              {isQuoteMode && (
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  {i18n.settings.quoteRequirement}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
