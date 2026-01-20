import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

function Header() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.h1
        className={`text-6xl md:text-7xl font-bold mb-2 ${themeClasses.primary} glow-text`}
        animate={{
          textShadow: [
            '0 0 10px currentColor',
            '0 0 20px currentColor, 0 0 30px currentColor',
            '0 0 10px currentColor',
          ],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        Leotype
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-xl ${themeClasses.secondary}`}
      >
        Тренировка скорости печати нового уровня
      </motion.p>
    </motion.header>
  )
}

export default Header
