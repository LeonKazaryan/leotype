import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'

type HeaderProps = {
  onOpenRegister: () => void
  user: {
    username: string
  } | null
  onLogout: () => void
}

function Header({ onOpenRegister, user, onLogout }: HeaderProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()
  const [hoverMenu, setHoverMenu] = useState(false)
  const [authHover, setAuthHover] = useState(false)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    const word = i18n.header.login
    setTypedText('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTypedText(word.slice(0, index))
      if (index >= word.length) {
        window.clearInterval(timer)
      }
    }, 300)

    return () => window.clearInterval(timer)
  }, [i18n.header.login])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center relative overflow-visible z-20 pt-6 md:pt-10"
    >
      <div className="fixed right-6 top-6 z-50 pointer-events-auto">
        {user ? (
          <div
            className="relative overflow-visible"
            onMouseEnter={() => setHoverMenu(true)}
            onMouseLeave={() => setHoverMenu(false)}
            onPointerEnter={() => setHoverMenu(true)}
            onPointerLeave={() => setHoverMenu(false)}
          >
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${themeClasses.primary} border ${themeClasses.border} bg-transparent transition-colors`}
            >
              {user.username}
            </button>
            {hoverMenu && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <div className="absolute -top-2 right-0 h-3 w-full" />
                <div
                  className={`min-w-[180px] rounded-xl ${themeClasses.card} border ${themeClasses.border} shadow-2xl ring-1 ring-black/20`}
                >
                  <button
                  type="button"
                  onClick={onLogout}
                  className={`w-full text-left px-4 py-3 text-sm ${themeClasses.secondary} hover:${themeClasses.primary} transition-colors`}
                >
                  {i18n.header.logout}
                </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <motion.button
            type="button"
            onClick={onOpenRegister}
            onHoverStart={() => setAuthHover(true)}
            onHoverEnd={() => setAuthHover(false)}
            whileTap={{ scale: 0.98 }}
            className={`relative px-2.5 py-1.5 text-sm font-semibold ${themeClasses.primary} bg-transparent transition-colors`}
          >
            <span className="relative inline-flex items-center justify-center">
              <div className="relative inline-flex items-center">
                <motion.span
                  animate={{ x: authHover ? -8 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="inline-flex items-center gap-2"
                >
                  <span className="inline-flex items-center gap-1">
                    {typedText || i18n.header.login}
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      className="inline-block w-[6px] h-[1.1em] bg-current rounded-sm"
                    />
                  </span>
                  <motion.span
                    animate={{ opacity: authHover ? [1, 0.3, 1] : 0.6 }}
                    transition={{ duration: 0.7, repeat: authHover ? Infinity : 0 }}
                    className="opacity-70"
                  >
                    /
                  </motion.span>
                </motion.span>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: authHover ? 1 : 0,
                    maxWidth: authHover ? 140 : 0,
                    y: authHover ? 0 : 10,
                  }}
                  transition={{ duration: 0.25 }}
                  className="ml-2 inline-block overflow-hidden whitespace-nowrap"
                >
                  {i18n.header.register}
                </motion.span>
              </div>
            </span>
            <motion.span
              aria-hidden
              animate={{
                opacity: authHover ? 1 : 0.6,
                scale: authHover ? 1 : 0.95,
              }}
              transition={{ duration: 0.3 }}
              className="absolute -inset-2 rounded-full border border-cyan-300/60"
            />
          </motion.button>
        )}
      </div>

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
        {i18n.header.tagline}
      </motion.p>

      <div className="mt-6" />
    </motion.header>
  )
}

export default Header
