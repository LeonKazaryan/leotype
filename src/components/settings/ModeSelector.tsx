import { motion } from 'framer-motion'
import type { TestMode } from '../../types'
import type { ThemeClasses } from '../../utils/themes'
import { iconSize, iconStroke, modeIcons } from '../../config/menu'

interface ModeSelectorProps {
  modes: TestMode[]
  activeMode: TestMode
  isMemoryLocked: boolean
  onRequireAuth: () => void
  onSelect: (mode: TestMode) => void
  labels: Record<TestMode, string>
  themeClasses: ThemeClasses
}

function ModeSelector({
  modes,
  activeMode,
  isMemoryLocked,
  onRequireAuth,
  onSelect,
  labels,
  themeClasses,
}: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {modes.map((mode) => {
        const isLocked = mode === 'memory' && isMemoryLocked
        const isActive = activeMode === mode
        const Icon = modeIcons[mode]

        return (
          <motion.button
            key={mode}
            type="button"
            whileHover={!isLocked ? { scale: 1.02 } : undefined}
            whileTap={!isLocked ? { scale: 0.98 } : undefined}
            onClick={() => {
              if (isLocked) {
                onRequireAuth()
                return
              }
              onSelect(mode)
            }}
            aria-disabled={isLocked}
            className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
              isActive
                ? `${themeClasses.accent} ring-1 ring-current shadow-[0_0_18px_currentColor]`
                : `${themeClasses.secondary} opacity-70 hover:opacity-100`
            } ${isLocked ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-3">
              <Icon size={iconSize} strokeWidth={iconStroke} />
              <div>
                <p className={`text-sm font-semibold ${isActive ? themeClasses.primary : themeClasses.secondary}`}>
                  {labels[mode]}
                </p>
              </div>
            </div>
            <span
              className={`h-1.5 w-1.5 rounded-full border ${
                isActive ? `${themeClasses.accentBorder} ${themeClasses.accentBg}` : themeClasses.border
              }`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}

export default ModeSelector
