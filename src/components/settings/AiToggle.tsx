import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ThemeClasses } from '../../utils/themes'
import { iconSize, iconStroke, menuIcons } from '../../config/menu'

interface AiToggleProps {
  label: string
  placeholder: string
  topic: string
  onTopicChange: (topic: string) => void
  themeClasses: ThemeClasses
}

function AiToggle({ label, placeholder, topic, onTopicChange, themeClasses }: AiToggleProps) {
  const [isOpen, setIsOpen] = useState(Boolean(topic.trim()))
  const inputRef = useRef<HTMLInputElement | null>(null)
  const AiIcon = menuIcons.ai
  const hasTopic = topic.trim().length > 0
  const isActive = isOpen || hasTopic

  useEffect(() => {
    if (hasTopic) {
      setIsOpen(true)
    }
  }, [hasTopic])

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AiIcon className={themeClasses.secondary} size={iconSize} strokeWidth={iconStroke} />
          <span className={`text-xs uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>{label}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => {
            if (isActive) {
              onTopicChange('')
              setIsOpen(false)
              return
            }
            setIsOpen(true)
          }}
          className={`relative h-6 w-11 rounded-full border transition-colors ${
            isActive
              ? `${themeClasses.accent} ${themeClasses.accentBorder} shadow-[0_0_12px_currentColor]`
              : `${themeClasses.secondary} ${themeClasses.border} opacity-70`
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
              isActive ? `${themeClasses.accentBg} translate-x-5` : `${themeClasses.card} translate-x-0`
            }`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <input
                ref={inputRef}
                type="text"
                value={topic}
                onChange={(event) => onTopicChange(event.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-3 py-2 text-sm ${
                  hasTopic ? `${themeClasses.accentBorder} ring-1 ${themeClasses.accentRing}` : themeClasses.border
                } ${themeClasses.secondary} bg-transparent focus:outline-none focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AiToggle
