import { motion } from 'framer-motion'
import type { ThemeClasses } from '../../utils/themes'
import { iconSize, iconStroke, menuIcons } from '../../config/menu'
import { useI18n } from '../../hooks/useI18n'

interface PvpBannerProps {
  themeClasses: ThemeClasses
  isLocked: boolean
  onOpen: () => void
  onRequireAuth: () => void
  shakeKey: number
}

type I18n = ReturnType<typeof useI18n>

function PvpBanner({ themeClasses, isLocked, onOpen, onRequireAuth, shakeKey }: PvpBannerProps) {
  const i18n: I18n = useI18n()
  const PvpIcon = menuIcons.pvp

  return (
    <motion.button
      key={shakeKey}
      type="button"
      onClick={() => {
        if (isLocked) {
          onRequireAuth()
          return
        }
        onOpen()
      }}
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      whileTap={!isLocked ? { scale: 0.99 } : undefined}
      animate={shakeKey > 0 ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full overflow-hidden rounded-3xl ${themeClasses.card} px-6 py-5 shadow-2xl ${
        isLocked ? 'opacity-70' : ''
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_65%)]" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
            <PvpIcon className={themeClasses.primary} size={iconSize} strokeWidth={iconStroke} />
          </div>
          <div className="space-y-1 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${themeClasses.primary}`}>
                {i18n.pvp.card.title}
              </span>
              <span className={`text-xs ${themeClasses.secondary} opacity-70`}>{i18n.pvp.card.subtitle}</span>
            </div>
            <p className={`text-sm ${themeClasses.secondary} opacity-60 max-w-[520px]`}>
              {i18n.pvp.card.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${themeClasses.border} ${themeClasses.accent}`}
          >
            <span className={`h-2 w-2 rounded-full ${themeClasses.accentBg} animate-pulse`} />
            {i18n.pvp.card.badge}
          </span>
          {isLocked && (
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${themeClasses.border} ${themeClasses.secondary} opacity-80`}
            >
              {i18n.settings.actions.loginToPlay}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export default PvpBanner
