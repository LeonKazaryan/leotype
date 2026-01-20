import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

function BackgroundEffects() {
  const settings = useTypingStore((state) => state.settings)
  const testState = useTypingStore((state) => state.testState)
  const themeClasses = getThemeClasses(settings.theme)
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {testState.isActive && (
        <>
          <motion.div
            className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full ${themeClasses.primary} opacity-10 blur-3xl`}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full ${themeClasses.accent} opacity-10 blur-3xl`}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
    </div>
  )
}

export default BackgroundEffects
