import type { AIDifficulty, LanguageCode } from '../types'
import { fetchDictionaryWords } from '../services/dictionaryService'
export async function generateTextFromDictionary(
    count: number,
    difficulty: AIDifficulty,
    language: LanguageCode
): Promise<string> {
    const result = await fetchDictionaryWords({ difficulty, count, language })
    const words = Array.isArray(result.words) ? result.words : []

    if (words.length < count) {
        throw new Error('DICTIONARY_INSUFFICIENT')
    }

    return words.slice(0, count).join(' ')
}
