import type { AIDifficulty, TestMode } from '../types'
import { fetchDictionaryWords } from '../services/dictionaryService'
import { generateText } from './textGenerator'

const splitWords = (text: string): string[] => {
    return text.split(/\s+/).filter(Boolean)
}

export async function generateTextFromDictionary(
    mode: TestMode,
    count: number,
    difficulty: AIDifficulty
): Promise<string> {
    if (mode === 'quote') {
        return generateText(mode, count)
    }

    try {
        const result = await fetchDictionaryWords({ difficulty, count })
        const words = Array.isArray(result.words) ? result.words : []

        if (words.length >= count) {
            return words.slice(0, count).join(' ')
        }

        if (words.length > 0) {
            const fallbackText = generateText('words', count - words.length)
            const fallbackWords = splitWords(fallbackText)
            return [...words, ...fallbackWords].slice(0, count).join(' ')
        }

        return generateText(mode, count)
    } catch (error) {
        return generateText(mode, count)
    }
}
