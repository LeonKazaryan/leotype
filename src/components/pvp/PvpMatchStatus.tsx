import { motion, AnimatePresence } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'

interface PvpMatchStatusProps {
  title: string
  hint: string
  show: boolean
}

function PvpMatchStatus({ title, hint, show }: PvpMatchStatusProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-6 text-center`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`w-10 h-10 border-4 border-t-4 rounded-full ${themeClasses.accent} border-opacity-50 mx-auto mb-4`}
          />
          <p className={`text-lg font-semibold ${themeClasses.primary}`}>{title}</p>
          <p className={`text-sm ${themeClasses.secondary} opacity-80 mt-2`}>{hint}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PvpMatchStatus
