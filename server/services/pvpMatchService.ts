import { dictionaryService } from './dictionaryService.js'
import { pvpConfig } from '../config/pvp.js'
import { languageConfig } from '../config/language.js'
import { generateAiText } from './aiTextService.js'
import type { PvpDifficulty } from '../types/pvp.js'
import type { DictionaryDifficulty } from '../config/dictionary.js'
import type { AppLanguage } from '../config/language.js'

export const generateMatchText = async (params: { wordCount: number; difficulty: PvpDifficulty; language?: AppLanguage; topic?: string }) => {
  const difficulty = pvpConfig.settings.difficultyMap[params.difficulty] as DictionaryDifficulty
  const resolvedLanguage = languageConfig.normalizeLanguage(params.language)
  const topic = typeof params.topic === 'string' ? params.topic.trim() : ''

  if (topic.length > 0) {
    return generateAiText({
      mode: 'words',
      count: params.wordCount,
      topic,
      difficulty,
      language: resolvedLanguage,
    })
  }

  const result = await dictionaryService.getRandomWords({
    difficulty,
    count: params.wordCount,
    language: resolvedLanguage,
  })

  if (result.words.length < params.wordCount) {
    throw new Error('DICTIONARY_INSUFFICIENT')
  }

  return result.words.slice(0, params.wordCount).join(' ')
}
