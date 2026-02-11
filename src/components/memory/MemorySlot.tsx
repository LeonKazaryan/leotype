import { motion } from 'framer-motion'
import type { MemorySlot as MemorySlotType } from '../../types/memory'
import type { ThemeClasses } from '../../utils/themes'
import { memoryConfig } from '../../config/memory'

interface MemorySlotProps {
  slot: MemorySlotType
  isNew: boolean
  themeClasses: ThemeClasses
}

const { slotClasses, animation } = memoryConfig.ui

function MemorySlot({ slot, isNew, themeClasses }: MemorySlotProps) {
  const isFilled = slot.guess.trim().length > 0
  const displayText = isFilled ? slot.guess : slot.hint || ''

  return (
    <motion.div
      animate={isNew ? { scale: animation.slotPopScale } : { scale: 1 }}
      transition={{ duration: animation.slotPopDuration, ease: 'easeOut' }}
      className={`min-w-[110px] px-4 py-2 rounded-full border text-sm font-semibold text-center ${
        isFilled ? slotClasses.filled : slotClasses.empty
      } ${!isFilled && slot.hint ? slotClasses.hint : themeClasses.secondary}`}
    >
      {displayText || ' '}
    </motion.div>
  )
}

export default MemorySlot
