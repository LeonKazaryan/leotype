import { motion, AnimatePresence } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'

interface PvpCountdownOverlayProps {
  value: number
  show: boolean
}

function PvpCountdownOverlay({ value, show }: PvpCountdownOverlayProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.6, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className={`text-6xl font-bold ${themeClasses.primary} glow-text`}>{value}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PvpCountdownOverlay
