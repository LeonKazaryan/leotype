import { aiConfig } from '../config/ai.js'
import { buildAIPrompt } from '../config/aiPrompts.js'
import { dictionaryService } from './dictionaryService.js'
import { languageConfig } from '../config/language.js'
import type { DictionaryDifficulty } from '../config/dictionary.js'

let lastRequestTime = 0
const requestQueue: Array<{
  resolve: (value: string) => void
  reject: (error: Error) => void
  params: { mode: string; count: number; topic: string; difficulty: string; language: string }
}> = []
let isProcessingQueue = false

const getApiKey = () => {
  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) {
    throw new Error('XAI API key not configured on server')
  }
  return apiKey
}

export async function checkXaiApiKey(): Promise<boolean> {
  const apiKey = process.env.XAI_API_KEY

  if (!apiKey) {
    console.error('❌ XAI_API_KEY not found in .env file')
    return false
  }

  if (!apiKey.startsWith('xai-')) {
    console.error('❌ Invalid API key format. Should start with "xai-"')
    return false
  }

  try {
    const response = await fetch(`${aiConfig.provider.apiBaseUrl}${aiConfig.provider.modelsEndpoint}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.status === 401) {
      console.error('❌ Invalid API key. Please check your XAI_API_KEY in .env')
      return false
    }

    if (response.ok) {
      console.log('✅ XAI API key is valid')
      return true
    }

    console.warn(`⚠️ API key check returned status ${response.status}`)
    return true
  } catch (error) {
    console.error('❌ Error checking API key:', error)
    return false
  }
}

async function makeXAIRequest(params: {
  mode: string
  count: number
  topic: string
  difficulty: string
  language: string
}): Promise<string> {
  const { mode, count, topic, difficulty, language } = params
  const apiKey = getApiKey()

  const resolvedLanguage = languageConfig.normalizeLanguage(language)
  const normalizedMode = (mode === 'quote' || mode === 'words' || mode === 'time' ? mode : 'time') as
    'time' | 'words' | 'quote'
  const normalizedDifficulty = (
    difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard'
      ? difficulty
      : 'medium'
  ) as DictionaryDifficulty

  const { prompt, system } = buildAIPrompt({
    mode: normalizedMode,
    count,
    topic,
    difficulty: normalizedDifficulty,
    language: resolvedLanguage,
  })

  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < aiConfig.request.minIntervalMs) {
    const waitTime = aiConfig.request.minIntervalMs - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }

  const response = await fetch(`${aiConfig.provider.apiBaseUrl}${aiConfig.provider.chatEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      max_tokens: normalizedMode === 'quote'
        ? aiConfig.maxTokens.quote
        : count * aiConfig.maxTokens.perWord,
      temperature: aiConfig.temperature,
      stream: false,
    }),
  })

  lastRequestTime = Date.now()

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: {
        message?: string
        code?: string
      }
    }

    const errorCode = errorData.error?.code || ''
    const errorMessage = errorData.error?.message || ''

    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your XAI_API_KEY in .env file.')
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 20000

      if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing') || errorCode === 'insufficient_quota') {
        throw new Error(`API quota exceeded: ${errorMessage || errorCode}. Please check your XAI account billing.`)
      }

      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds and try again.`)
    }

    if (errorCode === 'insufficient_quota' || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('billing')) {
      throw new Error(`API quota/billing issue: ${errorMessage || errorCode}. Please check your XAI account.`)
    }

    if (response.status >= 500) {
      throw new Error(`XAI service error (${response.status}): ${errorMessage || response.statusText}`)
    }

    throw new Error(`XAI API error (${response.status}): ${errorMessage || response.statusText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  const generatedText = data.choices?.[0]?.message?.content?.trim()

  if (!generatedText) {
    throw new Error('No text generated')
  }

  try {
    await dictionaryService.ingestGeneratedText({ text: generatedText, difficulty, mode, language: resolvedLanguage })
  } catch (error) {
    console.error('❌ Failed to ingest dictionary words:', error)
  }

  return generatedText
}

async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return
  }

  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const request = requestQueue.shift()
    if (!request) continue

    try {
      const result = await makeXAIRequest(request.params)
      request.resolve(result)
    } catch (error) {
      request.reject(error instanceof Error ? error : new Error('Unknown error occurred'))
    }
  }

  isProcessingQueue = false
}

export async function generateAiText(params: { mode: string; count: number; topic: string; difficulty: string; language: string }) {
  return await new Promise<string>((resolve, reject) => {
    requestQueue.push({ resolve, reject, params })
    processQueue()
  })
}
