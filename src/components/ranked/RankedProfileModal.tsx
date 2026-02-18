import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, BadgeCheck, Crosshair, Flag, Gauge, Percent, Swords, User } from 'lucide-react'
import type { RankedProfile } from '../../types/ranked'
import type { ThemeClasses } from '../../utils/themes'
import AnimatedNumber from '../AnimatedNumber'
import { useI18n } from '../../hooks/useI18n'
import { rankedConfig } from '../../config/ranked'

type RankedProfileModalProps = {
  open: boolean
  onClose: () => void
  onRetry: () => void
  onLogout?: () => void
  profile: RankedProfile | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  profileDelta?: number
  lastResultDelta?: number
  themeClasses: ThemeClasses
  user: { username: string } | null
}

const glassStyles =
  'relative w-full max-w-2xl rounded-3xl border p-6 shadow-2xl backdrop-blur-xl overflow-hidden'

function RankedProfileModal({
  open,
  onClose,
  onRetry,
  onLogout,
  profile,
  status,
  error,
  profileDelta,
  lastResultDelta,
  themeClasses,
  user,
}: RankedProfileModalProps) {
  const i18n = useI18n()
  const rating = profile?.rating ?? rankedConfig.rating.start
  const wins = profile?.wins ?? 0
  const losses = profile?.losses ?? 0
  const winRate = profile?.winRate ?? 0

  const deltaToShow = typeof profileDelta === 'number' && profileDelta !== 0 ? profileDelta : lastResultDelta

  const stats = [
    {
      label: i18n.rankedProfile.avgWpm,
      value: profile?.avgWpm ?? 0,
      icon: Gauge,
      decimals: 1,
    },
    {
      label: i18n.rankedProfile.avgAccuracy,
      value: profile?.avgAccuracy ?? 0,
      icon: Crosshair,
      suffix: '%',
      decimals: 1,
    },
    {
      label: i18n.rankedProfile.racesPlayed,
      value: profile?.racesPlayed ?? 0,
      icon: Flag,
    },
    {
      label: i18n.rankedProfile.winRate,
      value: winRate,
      icon: Percent,
      suffix: '%',
      helper: `${i18n.rankedProfile.winsLosses}: ${wins} / ${losses}`,
    },
  ]

  const renderSkeleton = () => (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-3 w-28 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="h-16 w-32 rounded-2xl bg-white/10 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse h-24"
          />
        ))}
      </div>
      <div className="h-12 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
    </div>
  )

  const renderError = () => (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: [0, -2, 2, -1, 0] }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 flex items-center gap-3`}
    >
      <AlertTriangle className="text-yellow-400" size={20} />
      <div className="flex-1">
        <div className={`text-sm font-semibold ${themeClasses.primary}`}>{i18n.rankedProfile.error}</div>
        {error && <div className={`text-xs ${themeClasses.secondary}`}>{error}</div>}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className={`text-xs px-3 py-1.5 rounded-lg border ${themeClasses.border} ${themeClasses.accent}`}
      >
        {i18n.rankedProfile.retry}
      </button>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${themeClasses.overlay}`}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`${glassStyles} ${themeClasses.card} ${themeClasses.border}`}
            style={{
              background:
                'linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)), rgba(8,12,24,0.35)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary-500/20 via-transparent to-primary-500/10" />
            </div>

            <div className="relative flex items-center justify-between gap-3 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${themeClasses.border} ${themeClasses.accent} bg-white/5`}
                >
                  {i18n.rankedProfile.tabs.overview}
                </button>
                <button
                  type="button"
                  disabled
                  title={i18n.rankedProfile.historySoon}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${themeClasses.border} ${themeClasses.secondary} opacity-60 cursor-not-allowed`}
                >
                  {i18n.rankedProfile.tabs.history}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${themeClasses.border} ${themeClasses.secondary} hover:${themeClasses.primary}`}
                  >
                    {i18n.rankedProfile.logout}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={i18n.common.close}
                  className={`${themeClasses.secondary} hover:${themeClasses.primary}`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="relative space-y-5">
              {status === 'loading' && renderSkeleton()}
              {status === 'error' && renderError()}

              {(status === 'ready' || status === 'idle') && profile && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${themeClasses.primary}`}>{user?.username ?? 'Player'}</div>
                      <div className={`text-sm ${themeClasses.secondary}`}>{i18n.rankedProfile.subtitle}</div>
                    </div>
                    <motion.div
                      layoutId="profile-rating"
                      className="relative min-w-[180px] rounded-2xl border border-primary-500/70 bg-primary-500/10 px-4 py-3 overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-2xl shadow-[0_0_24px_rgba(14,165,233,0.35)] pointer-events-none breathe-glow" />
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-primary-200">
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck size={14} />
                          {i18n.rankedProfile.rating}
                        </span>
                        <User size={14} />
                      </div>
                      <div className="mt-1 flex items-end gap-2">
                        <AnimatedNumber value={rating} className="text-4xl font-bold text-primary-100 glow-text" />
                        {typeof deltaToShow === 'number' && deltaToShow !== 0 && (
                          <motion.span
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: -2 }}
                            transition={{ duration: 0.3 }}
                            className={`text-sm font-semibold ${deltaToShow > 0 ? 'text-green-400' : 'text-red-400'} px-2 py-1 rounded-full bg-white/10`}
                          >
                            {deltaToShow > 0 ? '+' : ''}
                            {deltaToShow}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stats.map((stat, idx) => {
                      const Icon = stat.icon
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                          className={`group relative rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 transition-transform`}
                        >
                          <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 group-hover:shadow-lg transition duration-200" />
                          <div className="flex items-center justify-between">
                            <div className={`text-sm ${themeClasses.secondary}`}>{stat.label}</div>
                            <Icon className={themeClasses.primary} size={18} />
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <AnimatedNumber
                              value={stat.value}
                              decimals={stat.decimals ?? 0}
                              className={`text-2xl font-semibold ${themeClasses.primary}`}
                            />
                            {stat.suffix && <span className={`text-sm ${themeClasses.secondary}`}>{stat.suffix}</span>}
                          </div>
                          {stat.helper && <div className={`text-xs mt-1 ${themeClasses.secondary}`}>{stat.helper}</div>}
                        </motion.div>
                      )
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className={`relative rounded-2xl border ${themeClasses.border} ${themeClasses.card} px-4 py-3 overflow-hidden shimmer-once`}
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="inline-flex items-center gap-2 font-semibold">
                        <Swords size={16} className={themeClasses.primary} />
                        <span className={themeClasses.primary}>{i18n.rankedProfile.rankedLabel}</span>
                      </div>
                      <div className={`text-xs ${themeClasses.secondary} flex items-center gap-1`}>
                        <span>
                          {i18n.rankedProfile.winsLosses}: {wins} / {losses}
                        </span>
                        <span>•</span>
                        <span>
                          {i18n.rankedProfile.winRate}: {winRate}%
                        </span>
                        {typeof deltaToShow === 'number' && (
                          <>
                            <span>•</span>
                            <span className={deltaToShow > 0 ? 'text-green-400' : 'text-red-400'}>
                              {i18n.rankedProfile.lastMatch}:{' '}
                              {deltaToShow > 0 ? i18n.rankedProfile.win : i18n.rankedProfile.loss}{' '}
                              {deltaToShow > 0 ? '+' : ''}
                              {deltaToShow}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RankedProfileModal
