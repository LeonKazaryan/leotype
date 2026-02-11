import { AnimatePresence, motion } from 'framer-motion'
import type { MemoryCard } from '../../types/memory'
import type { ThemeClasses } from '../../utils/themes'
import { memoryConfig } from '../../config/memory'

interface MemoryCardViewProps {
  card: MemoryCard | undefined
  remainingLabel: string
  themeClasses: ThemeClasses
}

const { cardClasses, animation } = memoryConfig.ui

function MemoryCardView({ card, remainingLabel, themeClasses }: MemoryCardViewProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[260px]">
      <div className="absolute inset-0 rounded-3xl bg-black/20 backdrop-blur-sm" />
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
            className={`${cardClasses.container} ${cardClasses.sheen} ${cardClasses.glow} px-12 py-10 text-center`}
          >
            <span className={`text-4xl sm:text-5xl font-bold ${themeClasses.primary}`}>{card.word}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`mt-6 text-sm ${themeClasses.secondary}`}>{remainingLabel}</div>
    </div>
  )
}

export default MemoryCardView
