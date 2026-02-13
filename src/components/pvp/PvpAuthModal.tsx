import { AnimatePresence, motion } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'

interface PvpAuthModalProps {
  open: boolean
  onClose: () => void
  onLogin: () => void
  onSignup: () => void
}

function PvpAuthModal({ open, onClose, onLogin, onSignup }: PvpAuthModalProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className={`relative w-full max-w-md rounded-2xl p-6 ${themeClasses.card} border ${themeClasses.border} shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${themeClasses.primary}`}>{i18n.pvp.auth.title}</h2>
                <p className={`text-sm ${themeClasses.secondary} opacity-80 mt-1`}>{i18n.pvp.auth.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={i18n.common.close}
                className={`text-lg ${themeClasses.secondary} hover:${themeClasses.primary} transition-colors`}
              >
                ✕
              </button>
            </div>

            <div className={`mt-4 rounded-xl border ${themeClasses.border} ${themeClasses.card} p-4`}
            >
              <p className={`text-sm ${themeClasses.secondary}`}>{i18n.pvp.auth.body}</p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onLogin}
                className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.accent}`}
              >
                {i18n.pvp.auth.login}
              </button>
              <button
                type="button"
                onClick={onSignup}
                className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.primary} bg-white/5`}
              >
                {i18n.pvp.auth.signup}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PvpAuthModal
