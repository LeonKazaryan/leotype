import type { AIDifficulty, LanguageCode, TestMode } from '../types'
import { fetchDictionaryWords } from '../services/dictionaryService'
import { generateText } from './textGenerator'

export async function generateTextFromDictionary(
    mode: TestMode,
    count: number,
    difficulty: AIDifficulty,
    language: LanguageCode
): Promise<string> {
    if (mode === 'quote') {
        return generateText(mode, count, language)
    }

    const result = await fetchDictionaryWords({ difficulty, count, language })
    const words = Array.isArray(result.words) ? result.words : []

    if (words.length < count) {
        throw new Error('DICTIONARY_INSUFFICIENT')
    }

    return words.slice(0, count).join(' ')
}
