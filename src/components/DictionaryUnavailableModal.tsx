import { AnimatePresence, motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'

type DictionaryUnavailableModalProps = {
  open: boolean
  onClose: () => void
}

function DictionaryUnavailableModal({ open, onClose }: DictionaryUnavailableModalProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`absolute inset-0 ${themeClasses.overlay}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative w-full max-w-lg rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-6 shadow-2xl`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className={`text-xl font-semibold ${themeClasses.primary} mb-3`}>
              {i18n.dictionary.unavailableTitle}
            </h2>
            <p className={`text-sm ${themeClasses.secondary} mb-5`}>
              {i18n.dictionary.unavailableBody}
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg border ${themeClasses.border} ${themeClasses.primary}`}
              >
                {i18n.common.ok}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DictionaryUnavailableModal
