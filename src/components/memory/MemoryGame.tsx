import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { useMemoryStore } from '../../store/useMemoryStore'
import { useMemoryEngine } from '../../hooks/useMemoryEngine'
import { memoryConfig } from '../../config/memory'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import NeuralTypingLoader from '../loaders/NeuralTypingLoader'
import {
  formatMemorySeconds,
  getMemorizeProgress,
  getRecallProgress,
  getRemainingSlotsCount,
  getNextSlotIndex,
} from '../../utils/memory'
import MemoryHud from './MemoryHud'
import MemoryCardView from './MemoryCardView'
import MemoryRecallView from './MemoryRecallView'
import MemoryResultsView from './MemoryResultsView'

function MemoryGame() {
  const settings = useTypingStore((state) => state.settings)
  const goToSettings = useTypingStore((state) => state.goToSettings)
  const setDictionaryUnavailable = useTypingStore((state) => state.setDictionaryUnavailable)
  const themeClasses = getThemeClasses(settings.theme)
  const i18n = useI18n()

  useMemoryEngine()

  const phase = useMemoryStore((state) => state.phase)
  const cards = useMemoryStore((state) => state.cards)
  const currentIndex = useMemoryStore((state) => state.currentIndex)
  const remainingMs = useMemoryStore((state) => state.remainingMs)
  const slots = useMemoryStore((state) => state.slots)
  const inputValue = useMemoryStore((state) => state.inputValue)
  const orderRequired = useMemoryStore((state) => state.orderRequired)
  const lastFilledSlotId = useMemoryStore((state) => state.lastFilledSlotId)
  const inputShakeKey = useMemoryStore((state) => state.inputShakeKey)
  const isLoading = useMemoryStore((state) => state.isLoading)
  const error = useMemoryStore((state) => state.error)
  const results = useMemoryStore((state) => state.results)
  const startSession = useMemoryStore((state) => state.startSession)
  const updateInput = useMemoryStore((state) => state.updateInput)
  const submitInput = useMemoryStore((state) => state.submitInput)
  const removeLast = useMemoryStore((state) => state.removeLast)
  const resetSession = useMemoryStore((state) => state.resetSession)

  useEffect(() => {
    return () => resetSession()
  }, [resetSession])

  useEffect(() => {
    if (!error) return
    if (error === memoryConfig.errors.dictionaryInsufficient) {
      setDictionaryUnavailable(true)
    }
    resetSession()
    goToSettings()
  }, [error, goToSettings, resetSession, setDictionaryUnavailable])

  const remainingLabel = useMemo(() => formatMemorySeconds(remainingMs), [remainingMs])
  const progress = useMemo(() => {
    if (phase === 'recall' || phase === 'results') {
      return getRecallProgress(slots)
    }
    return getMemorizeProgress(cards, currentIndex, remainingMs)
  }, [phase, slots, cards, currentIndex, remainingMs])

  const remainingCount = getRemainingSlotsCount(slots)
  const nextSlotIndex = getNextSlotIndex(slots)
  const placeholderIndex =
    nextSlotIndex >= 0 ? nextSlotIndex + memoryConfig.input.placeholderStartIndex : memoryConfig.input.placeholderStartIndex
  const inputPlaceholder = orderRequired
    ? i18n.memory.inputPlaceholder(placeholderIndex)
    : i18n.memory.inputPlaceholderFree

  const handleExit = () => {
    resetSession()
    goToSettings()
  }

  const handleRunAgain = () => {
    startSession({
      difficulty: settings.aiDifficulty,
      language: settings.language,
      topic: settings.aiTopic,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: memoryConfig.ui.animation.containerInScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: memoryConfig.ui.animation.containerInDuration }}
      className={`rounded-2xl p-8 ${themeClasses.card} border-2 ${themeClasses.border} shadow-2xl relative overflow-hidden`}
    >
      <MemoryHud
        phase={phase}
        currentIndex={currentIndex}
        totalCards={cards.length}
        progress={progress}
        onExit={handleExit}
        themeClasses={themeClasses}
        i18n={i18n}
      />

      <div className="mt-10 relative">
        {phase === 'memorize' || phase === 'transition' ? (
          <MemoryCardView
            card={cards[currentIndex]}
            remainingLabel={remainingLabel}
            themeClasses={themeClasses}
            theme={settings.theme}
          />
        ) : null}

        {phase === 'recall' && (
          <MemoryRecallView
            slots={slots}
            inputValue={inputValue}
            orderRequired={orderRequired}
            remainingCount={remainingCount}
            placeholder={inputPlaceholder}
            onInputChange={updateInput}
            onSubmit={submitInput}
            onBackspace={removeLast}
            lastFilledSlotId={lastFilledSlotId}
            inputShakeKey={inputShakeKey}
            themeClasses={themeClasses}
            i18n={i18n}
            theme={settings.theme}
          />
        )}
      </div>

      <AnimatePresence>
        {phase === 'transition' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: memoryConfig.ui.animation.overlayFadeDuration }}
            className={`absolute inset-0 flex items-center justify-center ${themeClasses.overlay} backdrop-blur-sm opacity-60`}
          >
            <motion.div
              initial={{ scale: memoryConfig.ui.animation.overlayScale }}
              animate={{ scale: 1 }}
              transition={{ duration: memoryConfig.ui.animation.overlayFadeDuration }}
              className={`px-6 py-3 rounded-full border ${themeClasses.border} ${themeClasses.card} shadow-xl`}
            >
              <span className={`text-sm font-semibold ${themeClasses.primary}`}>{i18n.memory.phases.recall}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: memoryConfig.ui.animation.overlayFadeDuration }}
            className="absolute inset-0 flex items-center justify-center bg-transparent px-4"
          >
            <NeuralTypingLoader
              title={i18n.memory.loadingTitle}
              hint={i18n.memory.loadingHint}
              difficulty={settings.aiDifficulty}
              theme={settings.theme}
              themeClasses={themeClasses}
              topic={settings.aiTopic}
              size="full"
              showReadyOnExit
            />
          </motion.div>
        )}
      </AnimatePresence>

      <MemoryResultsView
        isVisible={phase === 'results'}
        results={results}
        onRunAgain={handleRunAgain}
        onSettings={handleExit}
        themeClasses={themeClasses}
        i18n={i18n}
        orderRequired={orderRequired}
        theme={settings.theme}
      />
    </motion.div>
  )
}

export default MemoryGame
