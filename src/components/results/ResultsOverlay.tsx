import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { resultsViewConfig } from '../../config/resultsView'

interface ResultsOverlayProps {
  isVisible: boolean
  children: ReactNode
  themeClasses: {
    overlay: string
  }
}

const { overlay } = resultsViewConfig

function ResultsOverlay({ isVisible, children, themeClasses }: ResultsOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 ${overlay.zIndexClass} flex items-center justify-center px-4 py-10`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: overlay.backdropDuration, ease: overlay.ease }}
        >
          <motion.div
            className={`absolute inset-0 ${themeClasses.overlay}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: overlay.backdropOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: overlay.backdropDuration, ease: overlay.ease }}
          />
          <motion.div
            className="relative z-10 w-full max-w-3xl"
            initial={{ opacity: 0, scale: overlay.panelScale, y: overlay.panelYOffset }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: overlay.panelScale, y: overlay.panelYOffset / 2 }}
            transition={{ duration: overlay.panelDuration, ease: overlay.ease }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ResultsOverlay
