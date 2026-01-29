import type { AIDifficulty, TestMode } from '../types'
import { fetchDictionaryWords } from '../services/dictionaryService'
import { generateText } from './textGenerator'

export async function generateTextFromDictionary(
    mode: TestMode,
    count: number,
    difficulty: AIDifficulty
): Promise<string> {
    if (mode === 'quote') {
        return generateText(mode, count)
    }

    const result = await fetchDictionaryWords({ difficulty, count })
    const words = Array.isArray(result.words) ? result.words : []

    if (words.length < count) {
        throw new Error('DICTIONARY_INSUFFICIENT')
    }

    return words.slice(0, count).join(' ')
}
