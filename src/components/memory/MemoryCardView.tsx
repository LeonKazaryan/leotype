import { AnimatePresence, motion } from 'framer-motion'
import type { MemoryCard } from '../../types/memory'
import type { Theme } from '../../types'
import type { ThemeClasses } from '../../utils/themes'
import { memoryConfig } from '../../config/memory'

interface MemoryCardViewProps {
  card: MemoryCard | undefined
  remainingLabel: string
  themeClasses: ThemeClasses
  theme: Theme
}

const { cardClasses, cardClassesLight, timerBadge, stageBackground, animation } = memoryConfig.ui

function MemoryCardView({ card, remainingLabel, themeClasses, theme }: MemoryCardViewProps) {
  const isLight = theme === 'light'
  const cardPalette = isLight ? cardClassesLight : cardClasses
  const timerPalette = isLight ? timerBadge.light : timerBadge.dark
  const stagePalette = isLight ? stageBackground.light : stageBackground.dark

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[260px]">
      <div className={`absolute inset-0 rounded-3xl z-0 ${stagePalette}`} />
      <AnimatePresence mode="wait">
        {card && (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, rotateX: animation.cardEnter.rotateX, y: animation.cardEnter.y }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{
              opacity: 0,
              rotateX: animation.cardExit.rotateX,
              y: animation.cardExit.y,
              transition: { duration: animation.cardOutDuration },
            }}
            transition={{ duration: animation.cardInDuration, ease: 'easeOut' }}
            className={`${cardPalette.container} ${cardPalette.sheen} ${cardPalette.glow} px-12 py-10 text-center z-10`}
          >
            <span className={`text-4xl sm:text-5xl font-bold ${themeClasses.primary}`}>{card.word}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`mt-6 text-sm px-3 py-1 rounded-full border ${timerPalette} z-10 backdrop-blur-none`}
      >
        {remainingLabel}
      </div>
    </div>
  )
}

export default MemoryCardView
