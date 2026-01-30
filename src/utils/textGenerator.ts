import { textGeneratorConfig } from '../config/textGenerator'
import { defaultLanguage } from '../config/language'
import type { LanguageCode, TestMode } from '../types'

const resolveLanguageConfig = (language: LanguageCode) => {
  return textGeneratorConfig[language] || textGeneratorConfig[defaultLanguage]
}

function generateRandomWord(language: LanguageCode): string {
  const { syllables, endings } = resolveLanguageConfig(language)
  const syllableCount = Math.floor(Math.random() * 3) + 2
  let word = ''

  for (let i = 0; i < syllableCount; i += 1) {
    word += syllables[Math.floor(Math.random() * syllables.length)]
  }

  if (Math.random() > 0.3) {
    word += endings[Math.floor(Math.random() * endings.length)]
  }

  return word
}

export function generateWords(count: number, language: LanguageCode = defaultLanguage): string {
  const result: string[] = []
  for (let i = 0; i < count; i += 1) {
    result.push(generateRandomWord(language))
  }
  return result.join(' ')
}

export function getRandomQuote(language: LanguageCode = defaultLanguage): string {
  const { quotes } = resolveLanguageConfig(language)
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export function generateText(mode: TestMode, count: number, language: LanguageCode = defaultLanguage): string {
  if (mode === 'quote') {
    return getRandomQuote(language)
  }
  return generateWords(count, language)
}
