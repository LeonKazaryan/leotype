import { apiBaseUrl, apiRoutes } from '../config/api'
import { defaultLanguage } from '../config/language'
import type { LanguageCode } from '../types'

async function generateTextWithAI(
    mode: 'time' | 'words' | 'quote',
    count: number,
    topic: string = '',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    language: LanguageCode = defaultLanguage
): Promise<string> {
    try {
        if (import.meta.env.DEV) {
            console.log('Generating AI text with params:', { mode, count, topic, difficulty, language })
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)

        const response = await fetch(`${apiBaseUrl}${apiRoutes.generateText}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode,
                count,
                topic: topic.trim(),
                difficulty,
                language,
            }),
            signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId))

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`

            if (response.status === 401) {
                throw new Error('Invalid API key. Please check server configuration.')
            }

            if (response.status === 429) {
                throw new Error(errorMessage)
            }

            if (response.status === 500) {
                throw new Error(errorMessage || 'Server error. Please try again later.')
            }

            throw new Error(errorMessage)
        }

        const data = await response.json()
        const generatedText = data.text?.trim()

        if (!generatedText) {
            throw new Error('No text generated')
        }

        if (import.meta.env.DEV) {
            console.log('✅ Generated text:', generatedText)
        }

        return generatedText
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.')
            }

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Cannot connect to server. Make sure the backend is running on port 3001.')
            }

            if (import.meta.env.DEV) {
                console.error('AI generation error:', error.message)
            }
            throw error
        }

        throw new Error('Unknown error occurred')
    }
}

export { generateTextWithAI }
