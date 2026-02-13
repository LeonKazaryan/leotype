import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import { pvpConfig } from '../../config/pvp'

interface PvpEntryCardProps {
  isLocked: boolean
  onOpen: () => void
  onRequireAuth: () => void
  shakeKey: number
}

function PvpEntryCard({ isLocked, onOpen, onRequireAuth, shakeKey }: PvpEntryCardProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()
  const [isShaking, setShaking] = useState(false)

  useEffect(() => {
    if (shakeKey <= 0) return
    setShaking(true)
    const timer = window.setTimeout(() => setShaking(false), pvpConfig.ui.authShakeMs)
    return () => window.clearTimeout(timer)
  }, [shakeKey])

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (isLocked) {
          onRequireAuth()
          return
        }
        onOpen()
      }}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      animate={isShaking ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full text-left rounded-2xl border ${themeClasses.border} ${themeClasses.card} px-5 py-4 shadow-xl relative overflow-hidden ${
        isLocked ? 'opacity-70' : ''
      }`}
    >
      <div className="absolute inset-0 opacity-60 bg-gradient-to-br from-white/5 via-transparent to-white/10" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className={`text-lg font-semibold ${themeClasses.primary}`}>{i18n.pvp.card.title}</p>
              <p className={`text-sm ${themeClasses.secondary} opacity-80`}>{i18n.pvp.card.subtitle}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${themeClasses.border} ${themeClasses.accent}`}
          >
            <span className={`h-2 w-2 rounded-full ${themeClasses.accentBg} animate-pulse`} />
            {i18n.pvp.card.badge}
          </span>
        </div>
        <div className={`text-sm ${themeClasses.secondary} opacity-80`}>{i18n.pvp.card.description}</div>
      </div>
    </motion.button>
  )
}

export default PvpEntryCard
