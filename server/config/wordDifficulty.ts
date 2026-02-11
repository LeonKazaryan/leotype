import type { AppLanguage } from './language.js'
import type { DictionaryDifficulty } from './dictionary.js'

type SyllableRange = {
    min: number
    max: number | null
}

export const wordDifficultyConfig: Record<DictionaryDifficulty, SyllableRange> = {
    easy: { min: 1, max: 3 },
    medium: { min: 2, max: 5 },
    hard: { min: 4, max: null },
}

export const syllableVowels: Record<AppLanguage, string[]> = {
    ru: ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'],
    en: ['a', 'e', 'i', 'o', 'u', 'y'],
}
