import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { useMemoryStore } from '../store/useMemoryStore'
import { settingsOptions } from '../config/settings'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'
import RankedBanner from './settings/RankedBanner'
import { useRankedStore } from '../store/useRankedStore'
import MainMenuPanel from './settings/MainMenuPanel'
import { rankedConfig } from '../config/ranked'

interface SettingsProps {
  isAuthenticated: boolean
  onRequireAuth: () => void
  onOpenPvp: () => void
  onOpenRanked: () => void
  onRequirePvpAuth: () => void
}

function Settings({ isAuthenticated, onRequireAuth, onOpenPvp, onOpenRanked, onRequirePvpAuth }: SettingsProps) {
  const settings = useTypingStore((state) => state.settings)
  const setMode = useTypingStore((state) => state.setMode)
  const setTime = useTypingStore((state) => state.setTime)
  const setWords = useTypingStore((state) => state.setWords)
  const setAITopic = useTypingStore((state) => state.setAITopic)
  const setAIDifficulty = useTypingStore((state) => state.setAIDifficulty)
  const generateNewText = useTypingStore((state) => state.generateNewText)
  const setShowGame = useTypingStore((state) => state.setShowGame)
  const isGeneratingAI = useTypingStore((state) => state.testState.isGeneratingAI)
  const startMemorySession = useMemoryStore((state) => state.startSession)
  const isMemoryLoading = useMemoryStore((state) => state.isLoading)
  const i18n = useI18n()

  const themeClasses = getThemeClasses(settings.theme)
  const isMemoryMode = settings.mode === 'memory'
  const isMemoryLocked = !isAuthenticated
  const isPvpLocked = !isAuthenticated
  const rankedProfile = useRankedStore((state) => state.profile)
  const loadRankedProfile = useRankedStore((state) => state.loadProfile)
  const isActionBusy = isMemoryMode ? isMemoryLoading : isGeneratingAI
  const aiHintText = isMemoryMode ? i18n.settings.ai.hintMemory : i18n.settings.ai.hint

  const primaryActionLabel = isActionBusy
    ? i18n.settings.actions.generating
    : isMemoryMode && isMemoryLocked
      ? i18n.settings.actions.loginToPlay
      : i18n.settings.actions.start

  const handleStart = () => {
    if (isActionBusy) return
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
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
      <div className="space-y-6">
        <RankedBanner
          themeClasses={themeClasses}
          isLocked={isPvpLocked}
          onOpenCasual={onOpenPvp}
          onOpenRanked={() => {
            if (!isAuthenticated) {
              onRequirePvpAuth()
              return
            }
            loadRankedProfile()
            onOpenRanked()
          }}
          onRequireAuth={onRequirePvpAuth}
          rating={rankedProfile?.rating ?? rankedConfig.rating.start}
        />

        <MainMenuPanel
          settings={settings}
          modes={settingsOptions.modes}
          timeOptions={settingsOptions.timeOptions}
          wordOptions={settingsOptions.wordOptions}
          aiDifficulties={settingsOptions.aiDifficulties}
          isMemoryLocked={isMemoryLocked}
          onRequireAuth={onRequireAuth}
          onModeChange={setMode}
          onTimeChange={setTime}
          onWordsChange={setWords}
          onAiDifficultyChange={setAIDifficulty}
          onAiTopicChange={setAITopic}
          onStart={handleStart}
          startLabel={primaryActionLabel}
          isActionBusy={isActionBusy}
          aiHintText={aiHintText}
          labels={{
            mode: i18n.settings.modeLabel,
            time: i18n.settings.timeLabel,
            words: i18n.settings.wordsLabel,
            difficulty: i18n.settings.ai.difficultyLabel,
            ai: i18n.settings.ai.title,
            modeOptions: i18n.settings.modeOptions,
            difficultyOptions: i18n.settings.ai.difficultyOptions,
            aiPlaceholder: i18n.settings.ai.topicPlaceholder,
            aiOn: i18n.settings.aiToggle.on,
            aiOff: i18n.settings.aiToggle.off,
          }}
          themeClasses={themeClasses}
        />
      </div>
    </motion.div>
  )
}

export default Settings
