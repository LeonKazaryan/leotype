import { useState } from 'react'
import { motion } from 'framer-motion'
import type { ThemeClasses } from '../../utils/themes'
import type { Theme, LanguageCode } from '../../types'
import { iconSize, iconStroke, menuIcons } from '../../config/menu'

interface HeaderSettingsMenuProps {
  themeClasses: ThemeClasses
  theme: Theme
  language: LanguageCode
  themes: Theme[]
  languages: LanguageCode[]
  labels: {
    theme: string
    language: string
    themeOptions: Record<Theme, string>
    languageOptions: Record<LanguageCode, string>
  }
  onThemeChange: (theme: Theme) => void
  onLanguageChange: (language: LanguageCode) => void
}

function HeaderSettingsMenu({
  themeClasses,
  theme,
  language,
  themes,
  languages,
  labels,
  onThemeChange,
  onLanguageChange,
}: HeaderSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const SettingsIcon = menuIcons.settings

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.96 }}
        className={`flex h-9 w-9 items-center justify-center rounded-full border ${themeClasses.border} ${themeClasses.primary} bg-transparent transition-colors`}
      >
        <SettingsIcon size={iconSize} strokeWidth={iconStroke} />
      </motion.button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 min-w-[220px]">
          <div className={`rounded-2xl ${themeClasses.card} shadow-2xl p-4`}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className={`text-[10px] uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>
                  {labels.theme}
                </p>
                <div className="flex flex-wrap gap-2">
                  {themes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onThemeChange(item)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors capitalize ${
                        theme === item
                          ? `${themeClasses.accent} ring-1 ring-current shadow-[0_0_10px_currentColor]`
                          : `${themeClasses.secondary} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {labels.themeOptions[item]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[10px] uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>
                  {labels.language}
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onLanguageChange(item)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        language === item
                          ? `${themeClasses.accent} ring-1 ring-current shadow-[0_0_10px_currentColor]`
                          : `${themeClasses.secondary} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {labels.languageOptions[item]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderSettingsMenu
