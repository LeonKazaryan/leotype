import { motion } from 'framer-motion'
import type { ThemeClasses } from '../../utils/themes'
import { menuIcons, iconSize, iconStroke } from '../../config/menu'

interface RankedBannerProps {
  themeClasses: ThemeClasses
  isLocked: boolean
  onOpenCasual: () => void
  onOpenRanked: () => void
  onRequireAuth: () => void
  rating?: number
}

function RankedBanner({ themeClasses, isLocked, onOpenCasual, onOpenRanked, onRequireAuth, rating }: RankedBannerProps) {
  const CasualIcon = menuIcons.pvp
  const RankedIcon = menuIcons.difficulty

  const Card = ({
    title,
    description,
    cta,
    icon: Icon,
    onClick,
    badge,
  }: {
    title: string
    description: string
    cta: string
    icon: typeof CasualIcon
    badge?: string
    onClick: () => void
  }) => (
    <motion.button
      type="button"
      onClick={() => {
        if (isLocked) {
          onRequireAuth()
          return
        }
        onClick()
      }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(59,130,246,0.25)', backgroundColor: 'rgba(255,255,255,0.04)' }}
      whileTap={{ scale: 0.99 }}
      className={`relative w-full overflow-hidden rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-5 text-left transition`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-80" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
          <Icon className={themeClasses.primary} size={iconSize} strokeWidth={iconStroke} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${themeClasses.primary}`}>{title}</span>
            {badge && (
              <span className={`text-xs px-2 py-1 rounded-full border ${themeClasses.border} ${themeClasses.accent}`}>
                {badge}
              </span>
            )}
          </div>
          <p className={`text-sm ${themeClasses.secondary} opacity-80`}>{description}</p>
          <span className={`inline-flex items-center gap-2 text-sm font-semibold ${themeClasses.accent}`}>
            <span className="h-[1px] w-6 bg-current" />
            {cta}
          </span>
        </div>
      </div>
    </motion.button>
  )

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card
        title="Casual"
        description="Лобби, комнаты, приватные матчи"
        cta="Лобби"
        icon={CasualIcon}
        onClick={onOpenCasual}
        badge="Casual"
      />
      <Card
        title="Ranked"
        description="Быстрый матч по рейтингу"
        cta="Найти матч"
        icon={RankedIcon}
        onClick={onOpenRanked}
        badge={`Rating ${rating ?? 1000}`}
      />
    </div>
  )
}

export default RankedBanner
