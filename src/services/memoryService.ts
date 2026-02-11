import type { AIDifficulty, LanguageCode } from '../types'
import { generateTextWithAI } from '../utils/aiGenerator'
import { generateTextFromDictionary } from '../utils/dictionaryText'
import { splitTextToWords } from '../utils/memory'
import { aiModeMap } from '../config/aiModes'
import { memoryConfig } from '../config/memory'

interface MemoryWordsParams {
  count: number
  difficulty: AIDifficulty
  language: LanguageCode
  topic: string
}

const buildWordsFromText = (text: string, count: number) => {
  const words = splitTextToWords(text)
  if (words.length < count) {
    throw new Error(memoryConfig.errors.insufficientWords)
  }
  return words.slice(0, count)
}

const fetchDictionaryWords = async (params: MemoryWordsParams) => {
  const text = await generateTextFromDictionary(params.count, params.difficulty, params.language)
  return buildWordsFromText(text, params.count)
}

export const generateMemoryWords = async (params: MemoryWordsParams) => {
  const topic = params.topic.trim()
  if (!topic) {
    return fetchDictionaryWords(params)
  }

  try {
    const text = await generateTextWithAI(
      aiModeMap.memory,
      params.count,
      topic,
      params.difficulty,
      params.language
    )
    return buildWordsFromText(text, params.count)
  } catch (error) {
    if (import.meta.env.DEV && error instanceof Error) {
      console.error('Memory AI generation failed, falling back to dictionary:', error.message)
    }
    return fetchDictionaryWords(params)
  }
}
