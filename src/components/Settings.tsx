import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { useMemoryStore } from '../store/useMemoryStore'
import type { TestMode, Theme, AIDifficulty } from '../types'
import { supportedLanguages } from '../config/language'
import { settingsOptions } from '../config/settings'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'

interface SettingsProps {
  isAuthenticated: boolean
  onRequireAuth: () => void
}

function Settings({ isAuthenticated, onRequireAuth }: SettingsProps) {
  const settings = useTypingStore(state => state.settings)
  const setMode = useTypingStore(state => state.setMode)
  const setTime = useTypingStore(state => state.setTime)
  const setWords = useTypingStore(state => state.setWords)
  const setTheme = useTypingStore(state => state.setTheme)
  const setLanguage = useTypingStore(state => state.setLanguage)
  const toggleKeyboard = useTypingStore(state => state.toggleKeyboard)
  const setAITopic = useTypingStore(state => state.setAITopic)
  const setAIDifficulty = useTypingStore(state => state.setAIDifficulty)
  const resetTest = useTypingStore(state => state.resetTest)
  const generateNewText = useTypingStore(state => state.generateNewText)
  const setShowGame = useTypingStore(state => state.setShowGame)
  const isGeneratingAI = useTypingStore(state => state.testState.isGeneratingAI)
  const startMemorySession = useMemoryStore(state => state.startSession)
  const isMemoryLoading = useMemoryStore(state => state.isLoading)
  const i18n = useI18n()

  const themeClasses = getThemeClasses(settings.theme)
  const isQuoteMode = settings.mode === 'quote'
  const isMemoryMode = settings.mode === 'memory'
  const hasAITopic = settings.aiTopic.trim().length > 0
  const isAiDormant = !hasAITopic
  const isDifficultyLocked = isAiDormant && !isMemoryMode
  const aiEnabled = settings.useAI
  const isMemoryLocked = !isAuthenticated
  const aiHintText = isMemoryMode ? i18n.settings.ai.hintMemory : i18n.settings.ai.hint
  const isActionBusy = isMemoryMode ? isMemoryLoading : isGeneratingAI
  const primaryActionLabel = isMemoryMode
    ? isActionBusy
      ? i18n.settings.actions.generating
      : isMemoryLocked
        ? i18n.settings.actions.loginToPlay
        : i18n.settings.actions.start
    : isGeneratingAI
      ? i18n.settings.actions.generating
      : i18n.settings.actions.newText
  const showResetButton = !isMemoryMode

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.settings.modeLabel}</label>
            <div className="flex gap-2 flex-nowrap">
              {modes.map(mode => {
                const isLocked = mode === 'memory' && isMemoryLocked
                const isActive = settings.mode === mode
                const label = isLocked ? `${i18n.settings.modeOptions[mode]} 🔒` : i18n.settings.modeOptions[mode]

                return (
                  <div key={mode} className="relative group">
                    <motion.button
                      whileHover={!isLocked ? { scale: 1.05 } : {}}
                      whileTap={!isLocked ? { scale: 0.95 } : {}}
                      onClick={() => {
                        if (isLocked) {
                          onRequireAuth()
                          return
                        }
                        setMode(mode)
                      }}
                      aria-disabled={isLocked}
                      className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                          : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                      } ${isLocked ? 'opacity-60' : ''}`}
                    >
                      {label}
                    </motion.button>
                    {isLocked && (
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div
                          className={`rounded-lg px-3 py-2 text-xs ${themeClasses.card} ${themeClasses.secondary} border ${themeClasses.border} shadow-lg`}
                        >
                          {i18n.settings.modeLockedHint}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h3 className={`text-base font-semibold ${themeClasses.primary}`}>{i18n.settings.ai.title}</h3>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold border ${themeClasses.border} ${
                  aiEnabled ? themeClasses.accent : themeClasses.secondary
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full border ${
                    aiEnabled
                      ? `${themeClasses.accentBorder} ${themeClasses.accentBg} animate-pulse-slow`
                      : themeClasses.border
                  }`}
                />
                {i18n.settings.aiToggle[aiEnabled ? 'on' : 'off']}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className={`block text-sm font-medium transition-colors ${
                    hasAITopic ? themeClasses.accent : themeClasses.secondary
                  }`}
                >
                  {i18n.settings.ai.topicLabel}
                </label>
                <input
                  type="text"
                  value={settings.aiTopic}
                  onChange={e => setAITopic(e.target.value)}
                  placeholder={i18n.settings.ai.topicPlaceholder}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${
                    hasAITopic
                      ? `${themeClasses.accentBorder} ring-2 ${themeClasses.accentRing} shadow-lg`
                      : themeClasses.border
                  } ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                {hasAITopic ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`h-2 w-2 rounded-full border ${themeClasses.accentBorder} ${themeClasses.accentBg} animate-pulse-slow`}
                    />
                    <span className={`text-xs font-semibold ${themeClasses.accent}`}>
                      {i18n.settings.ai.topicStatus.active}
                    </span>
                  </div>
                ) : (
                  <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                    {i18n.settings.ai.topicStatus.inactive}
                  </p>
                )}
              </div>

              <div className={`space-y-2 transition-opacity ${isDifficultyLocked ? 'opacity-40' : 'opacity-100'}`}>
                <label className={`block text-sm font-medium ${themeClasses.secondary}`}>
                  {i18n.settings.ai.difficultyLabel}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(difficulty => {
                    const icon = settingsOptions.aiDifficultyOptions[difficulty]

                    return (
                      <motion.button
                        key={difficulty}
                        whileHover={!isDifficultyLocked ? { scale: 1.05 } : {}}
                        whileTap={!isDifficultyLocked ? { scale: 0.95 } : {}}
                        onClick={() => setAIDifficulty(difficulty)}
                        disabled={isDifficultyLocked}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                          settings.aiDifficulty === difficulty
                            ? `${themeClasses.accent} bg-opacity-20 border-2 ${themeClasses.border}`
                            : `${themeClasses.secondary} border-2 border-transparent hover:${themeClasses.border}`
                        } ${isDifficultyLocked ? 'cursor-not-allowed' : ''}`}
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
              className={`text-xs ${themeClasses.secondary} text-center pt-2 border-t ${themeClasses.border} border-opacity-20 transition-opacity ${
                isDifficultyLocked ? 'opacity-50' : 'opacity-80'
              }`}
            >
              {aiHintText}
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
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                {i18n.settings.actionsLabel}
              </label>
              <div className="flex gap-2 flex-wrap">
                <motion.button
                  whileHover={!isActionBusy ? { scale: 1.05 } : {}}
                  whileTap={!isActionBusy ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (isMemoryMode) {
                      if (isMemoryLocked) {
                        onRequireAuth()
                        return
                      }
                      setShowGame(true)
                      startMemorySession({
                        difficulty: settings.aiDifficulty,
                        language: settings.language,
                        topic: settings.aiTopic,
                      })
                      return
                    }
                    generateNewText()
                  }}
                  disabled={isActionBusy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                    isActionBusy ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {primaryActionLabel}
                </motion.button>
                {showResetButton && (
                  <motion.button
                    whileHover={!isGeneratingAI ? { scale: 1.05 } : {}}
                    whileTap={!isGeneratingAI ? { scale: 0.95 } : {}}
                    onClick={resetTest}
                    disabled={isGeneratingAI}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors whitespace-nowrap ${
                      isGeneratingAI ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGeneratingAI ? i18n.settings.actions.generating : i18n.settings.actions.reset}
                  </motion.button>
                )}
              </div>
              {isQuoteMode && (
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  {i18n.settings.quoteRequirement}
                </p>
              )}
              {isMemoryMode && isMemoryLocked && (
                <p className={`text-xs ${themeClasses.secondary} opacity-70`}>
                  {i18n.settings.memoryRequirement}
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
