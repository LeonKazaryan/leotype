const fallbackLanguages = ['ru', 'en'] as const

export type AppLanguage = typeof fallbackLanguages[number]

const parseLanguageList = (raw?: string): AppLanguage[] => {
    if (!raw) return []
    const tokens = raw
        .split(',')
        .map((token) => token.trim().toLowerCase())
        .filter(Boolean)

    const unique = Array.from(new Set(tokens))
    return unique.filter((lang): lang is AppLanguage => lang === 'ru' || lang === 'en')
}

const configuredLanguages = parseLanguageList(process.env.DICTIONARY_LANGUAGES)
const supportedLanguages = configuredLanguages.length > 0 ? configuredLanguages : [...fallbackLanguages]

const normalizeLanguage = (raw?: string | null, allowed: AppLanguage[] = supportedLanguages): AppLanguage => {
    const normalized = raw?.toLowerCase()
    if ((normalized === 'ru' || normalized === 'en') && allowed.includes(normalized)) {
        return normalized
    }
    return allowed[0] || fallbackLanguages[0]
}

const defaultLanguage = normalizeLanguage(process.env.DICTIONARY_DEFAULT_LANGUAGE, supportedLanguages)

const isSupportedLanguage = (value?: string | null, allowed: AppLanguage[] = supportedLanguages): value is AppLanguage => {
    return !!value && allowed.includes(value as AppLanguage)
}

export const languageConfig = {
    supportedLanguages,
    defaultLanguage,
    normalizeLanguage,
    isSupportedLanguage,
}
