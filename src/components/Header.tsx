import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import { useI18n } from '../hooks/useI18n'
import { settingsOptions } from '../config/settings'
import { supportedLanguages } from '../config/language'
import HeaderSettingsMenu from './header/HeaderSettingsMenu'
import { useRankedStore } from '../store/useRankedStore'
import { rankedConfig } from '../config/ranked'

type HeaderProps = {
  onOpenRegister: () => void
  user: {
    username: string
  } | null
  onLogout: () => void
  onOpenProfile: () => void
}

function Header({ onOpenRegister, user, onLogout, onOpenProfile }: HeaderProps) {
  const settings = useTypingStore((state) => state.settings)
  const setTheme = useTypingStore((state) => state.setTheme)
  const setLanguage = useTypingStore((state) => state.setLanguage)
  const themeClasses = getThemeClasses(settings.theme)
  const i18n = useI18n()
  const [authHover, setAuthHover] = useState(false)
  const [typedText, setTypedText] = useState('')
  const rankedProfile = useRankedStore((state) => state.profile)
  const profileStatus = useRankedStore((state) => state.profileStatus)

  const ratingValue = useMemo(() => rankedProfile?.rating ?? rankedConfig.rating.start, [rankedProfile])

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
      <div className="fixed right-6 top-6 z-50 flex items-center gap-3">
        {user ? (
          <>
            <motion.button
              type="button"
              whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(14,165,233,0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenProfile}
              className={`relative px-3 py-1.5 rounded-full text-sm font-semibold border ${themeClasses.border} ${themeClasses.card} ${themeClasses.primary} overflow-hidden`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <motion.span
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5"
                  >
                    {i18n.rankedProfile.userChip}
                  </motion.span>
                  {user.username}
                </span>
              </span>
            </motion.button>

            <motion.button
              type="button"
              layoutId="profile-rating"
              whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(14,165,233,0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenProfile}
              className={`relative px-3 py-1.5 rounded-full text-sm font-semibold border ${themeClasses.border} ${themeClasses.card} text-primary-300 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/15 pointer-events-none" />
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide opacity-80">
                  {i18n.rankedProfile.rating}
                </span>
                <span className="text-base font-bold">
                  {profileStatus === 'loading' ? '…' : ratingValue}
                </span>
              </span>
            </motion.button>

            <button
              type="button"
              onClick={onLogout}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${themeClasses.border} ${themeClasses.secondary} hover:${themeClasses.primary}`}
            >
              {i18n.header.logout}
            </button>
          </>
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
        <HeaderSettingsMenu
          themeClasses={themeClasses}
          theme={settings.theme}
          language={settings.language}
          themes={settingsOptions.themes}
          languages={supportedLanguages}
          labels={{
            theme: i18n.theme.label,
            language: i18n.language.label,
            themeOptions: i18n.theme.options,
            languageOptions: i18n.language.options,
          }}
          onThemeChange={setTheme}
          onLanguageChange={setLanguage}
        />
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
        className={`text-xl ${themeClasses.secondary} opacity-70`}
      >
        {i18n.header.tagline}
      </motion.p>

      <div className="mt-6" />
    </motion.header>
  )
}

export default Header
