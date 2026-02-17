import { motion } from 'framer-motion'
import type { AIDifficulty, TestMode, TestSettings } from '../../types'
import type { ThemeClasses } from '../../utils/themes'
import { iconSize, iconStroke, menuIcons } from '../../config/menu'
import ModeSelector from './ModeSelector'
import DifficultyRow from './DifficultyRow'
import AiToggle from './AiToggle'

interface MainMenuPanelProps {
  settings: TestSettings
  modes: TestMode[]
  timeOptions: number[]
  wordOptions: number[]
  aiDifficulties: AIDifficulty[]
  isMemoryLocked: boolean
  onRequireAuth: () => void
  onModeChange: (mode: TestMode) => void
  onTimeChange: (time: number) => void
  onWordsChange: (words: number) => void
  onAiDifficultyChange: (difficulty: AIDifficulty) => void
  onAiTopicChange: (topic: string) => void
  onStart: () => void
  startLabel: string
  isActionBusy: boolean
  aiHintText: string
  labels: {
    mode: string
    time: string
    words: string
    difficulty: string
    ai: string
    modeOptions: Record<TestMode, string>
    difficultyOptions: Record<AIDifficulty, string>
    aiPlaceholder: string
  }
  themeClasses: ThemeClasses
}

function MainMenuPanel({
  settings,
  modes,
  timeOptions,
  wordOptions,
  aiDifficulties,
  isMemoryLocked,
  onRequireAuth,
  onModeChange,
  onTimeChange,
  onWordsChange,
  onAiDifficultyChange,
  onAiTopicChange,
  onStart,
  startLabel,
  isActionBusy,
  aiHintText,
  labels,
  themeClasses,
}: MainMenuPanelProps) {
  const DifficultyIcon = menuIcons.difficulty

  return (
    <div className={`rounded-3xl ${themeClasses.card} p-6 md:p-8 shadow-2xl`}>
      <div className="space-y-8">
        <section className="space-y-4">
          <div className={`text-xs uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>
            {labels.mode}
          </div>
          <ModeSelector
            modes={modes}
            activeMode={settings.mode}
            isMemoryLocked={isMemoryLocked}
            onRequireAuth={onRequireAuth}
            onSelect={onModeChange}
            labels={labels.modeOptions}
            themeClasses={themeClasses}
          />

          {settings.mode === 'time' && (
            <div className="space-y-2">
              <div className={`text-[10px] uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-50`}>
                {labels.time}
              </div>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map((time) => (
                  <motion.button
                    key={time}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onTimeChange(time)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      settings.time === time
                        ? `${themeClasses.accent} ring-1 ring-current shadow-[0_0_12px_currentColor]`
                        : `${themeClasses.secondary} opacity-60 hover:opacity-100`
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
              <div className={`text-[10px] uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-50`}>
                {labels.words}
              </div>
              <div className="flex flex-wrap gap-2">
                {wordOptions.map((words) => (
                  <motion.button
                    key={words}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onWordsChange(words)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      settings.words === words
                        ? `${themeClasses.accent} ring-1 ring-current shadow-[0_0_12px_currentColor]`
                        : `${themeClasses.secondary} opacity-60 hover:opacity-100`
                    }`}
                  >
                    {words}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <DifficultyIcon
              className={themeClasses.secondary}
              size={iconSize}
              strokeWidth={iconStroke}
            />
            <span className={`text-xs uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>
              {labels.difficulty}
            </span>
          </div>
          <DifficultyRow
            difficulties={aiDifficulties}
            value={settings.aiDifficulty}
            onChange={onAiDifficultyChange}
            labels={labels.difficultyOptions}
            themeClasses={themeClasses}
          />
        </section>

        <section className="space-y-3">
          <AiToggle
            label={labels.ai}
            placeholder={labels.aiPlaceholder}
            topic={settings.aiTopic}
            onTopicChange={onAiTopicChange}
            themeClasses={themeClasses}
          />
        </section>

        <div className="flex flex-col items-center gap-3 pt-2">
          <motion.button
            whileHover={!isActionBusy ? { scale: 1.03 } : undefined}
            whileTap={!isActionBusy ? { scale: 0.97 } : undefined}
            onClick={onStart}
            disabled={isActionBusy}
            className={`relative rounded-full px-12 py-3 text-sm font-semibold tracking-[0.18em] ${
              themeClasses.primary
            } border ${themeClasses.border} bg-transparent shadow-[0_0_22px_currentColor] transition-all ${
              isActionBusy ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-[0_0_28px_currentColor]'
            }`}
          >
            {startLabel}
          </motion.button>
          <p className={`text-xs ${themeClasses.secondary} opacity-50 text-center`}>{aiHintText}</p>
        </div>
      </div>
    </div>
  )
}

export default MainMenuPanel
