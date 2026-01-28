import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

type HeaderProps = {
  onOpenRegister: () => void
}

function Header({ onOpenRegister }: HeaderProps) {
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-6 flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenRegister}
          className={`px-5 py-2 rounded-full text-sm font-semibold ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
        >
          ✨ Регистрация
        </motion.button>
      </motion.div>
    </motion.header>
  )
}

export default Header
