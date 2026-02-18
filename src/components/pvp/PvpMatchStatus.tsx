import { motion, AnimatePresence } from 'framer-motion'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import NeuralTypingLoader from '../loaders/NeuralTypingLoader'

interface PvpMatchStatusProps {
  title: string
  hint: string
  show: boolean
}

function PvpMatchStatus({ title, hint, show }: PvpMatchStatusProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const difficulty = useTypingStore((state) => state.settings.aiDifficulty)
  const themeClasses = getThemeClasses(theme)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 text-center`}
        >
          <NeuralTypingLoader
            title={title}
            hint={hint}
            difficulty={difficulty}
            theme={theme}
            themeClasses={themeClasses}
            size="compact"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PvpMatchStatus
