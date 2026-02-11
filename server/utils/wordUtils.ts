import { languageConfig } from '../config/language.js'
import { syllableVowels, wordDifficultyConfig } from '../config/wordDifficulty.js'
import type { AppLanguage } from '../config/language.js'
import type { DictionaryDifficulty } from '../config/dictionary.js'

export function extractNormalizedWords(text: string): string[] {
    const matches = text.match(/[A-Za-zА-Яа-яЁё]+/g)
    if (!matches) {
        return []
    }

    return matches.map((word) => word.toLowerCase())
}

export function uniqueWords(words: string[]): string[] {
    return Array.from(new Set(words))
}

export function sampleArray<T>(items: T[], count: number): T[] {
    if (count <= 0 || items.length === 0) {
        return []
    }

    const copy = items.slice()
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = copy[i]
        copy[i] = copy[j]
        copy[j] = temp
    }

    return copy.slice(0, Math.min(count, copy.length))
}

const resolveVowels = (language: AppLanguage) => {
    return syllableVowels[language] || syllableVowels[languageConfig.defaultLanguage]
}

export function countSyllables(word: string, language: AppLanguage): number {
    const vowels = resolveVowels(language)
    if (vowels.length === 0) {
        return 0
    }

    const vowelSet = new Set(vowels)
    let count = 0
    let previousWasVowel = false

    for (const char of word.toLowerCase()) {
        const isVowel = vowelSet.has(char)
        if (isVowel && !previousWasVowel) {
            count += 1
        }
        previousWasVowel = isVowel
    }

    return count
}

export function filterWordsByDifficulty(
    words: string[],
    difficulty: DictionaryDifficulty,
    language: AppLanguage
): string[] {
    const range = wordDifficultyConfig[difficulty] || wordDifficultyConfig.medium
    const max = range.max ?? Number.POSITIVE_INFINITY

    return words.filter((word) => {
        const syllables = countSyllables(word, language)
        return syllables >= range.min && syllables <= max
    })
}
