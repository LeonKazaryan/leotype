import { motion } from 'framer-motion'
import type { MemorySlot as MemorySlotType } from '../../types/memory'
import type { ThemeClasses } from '../../utils/themes'
import type { I18nDictionary } from '../../config/i18n'
import { memoryConfig } from '../../config/memory'
import MemorySlot from './MemorySlot'

interface MemoryRecallViewProps {
  slots: MemorySlotType[]
  inputValue: string
  orderRequired: boolean
  remainingCount: number
  placeholder: string
  autoFocus?: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
  onBackspace: () => void
  lastFilledSlotId: string | null
  inputShakeKey: number
  themeClasses: ThemeClasses
  i18n: I18nDictionary
}

const { animation } = memoryConfig.ui

function MemoryRecallView({
  slots,
  inputValue,
  orderRequired,
  remainingCount,
  placeholder,
  autoFocus = true,
  onInputChange,
  onSubmit,
  onBackspace,
  lastFilledSlotId,
  inputShakeKey,
  themeClasses,
  i18n,
}: MemoryRecallViewProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (memoryConfig.input.submitKeys.includes(event.key as (typeof memoryConfig.input.submitKeys)[number])) {
      event.preventDefault()
      onSubmit()
      return
    }
    if (event.key === memoryConfig.input.backspaceKey && inputValue.trim().length === 0) {
      onBackspace()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {slots.map((slot) => (
          <MemorySlot key={slot.id} slot={slot} isNew={slot.id === lastFilledSlotId} themeClasses={themeClasses} />
        ))}
      </div>

      {!orderRequired && (
        <p className={`text-sm text-center ${themeClasses.secondary}`}>
          {i18n.memory.remainingLabel(remainingCount)}
        </p>
      )}

      <motion.div
        key={inputShakeKey > 0 ? inputShakeKey : 'stable'}
        initial={false}
        animate={inputShakeKey > 0 ? { x: animation.inputShakeOffsets } : { x: 0 }}
        transition={{ duration: inputShakeKey > 0 ? animation.inputShakeDuration : 0 }}
        className="flex justify-center"
      >
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full max-w-md px-4 py-3 rounded-xl text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.primary} bg-transparent focus:outline-none focus:${themeClasses.accent} focus:${themeClasses.accentBorder} transition-colors placeholder:opacity-60`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </motion.div>

      <p className={`text-xs text-center ${themeClasses.secondary} opacity-70`}>
        {i18n.memory.inputHint}
      </p>
    </div>
  )
}

export default MemoryRecallView
