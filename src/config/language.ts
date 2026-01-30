import type { LanguageCode } from '../types'

const fallbackLanguages: LanguageCode[] = ['ru', 'en']

const parseLanguageList = (raw?: string): LanguageCode[] => {
  if (!raw) return []
  const tokens = raw
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  const unique = Array.from(new Set(tokens))
  return unique.filter((lang): lang is LanguageCode => lang === 'ru' || lang === 'en')
}

const configuredLanguages = parseLanguageList(import.meta.env.VITE_SUPPORTED_LANGUAGES)
export const supportedLanguages = configuredLanguages.length > 0 ? configuredLanguages : fallbackLanguages

export const normalizeLanguage = (raw?: string | null, allowed: LanguageCode[] = supportedLanguages): LanguageCode => {
  const normalized = raw?.toLowerCase()
  if (normalized === 'ru' || normalized === 'en') {
    if (allowed.includes(normalized)) {
      return normalized
    }
  }
  return allowed[0] || 'ru'
}

export const defaultLanguage = normalizeLanguage(import.meta.env.VITE_DEFAULT_LANGUAGE, supportedLanguages)
