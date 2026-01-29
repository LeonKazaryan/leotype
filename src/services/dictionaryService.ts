import { apiBaseUrl, apiRoutes } from '../config/api'
import type { AIDifficulty } from '../types'

interface DictionaryWordsResponse {
    words: string[]
    totalAvailable: number
}

export async function fetchDictionaryWords(params: {
    difficulty: AIDifficulty
    count: number
}): Promise<DictionaryWordsResponse> {
    const query = new URLSearchParams({
        difficulty: params.difficulty,
        count: params.count.toString(),
    })

    const response = await fetch(`${apiBaseUrl}${apiRoutes.dictionaryWords}?${query.toString()}`)

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
    }

    const data = await response.json()

    return {
        words: Array.isArray(data.words) ? data.words : [],
        totalAvailable: typeof data.totalAvailable === 'number' ? data.totalAvailable : 0,
    }
}
