import { prisma } from '../db/prisma.js'
import { dictionaryConfig, DictionaryDifficulty } from '../config/dictionary.js'
import { languageConfig } from '../config/language.js'
import type { AppLanguage } from '../config/language.js'
import { dictionaryRepository } from '../repositories/dictionaryRepository.js'
import { extractNormalizedWords, sampleArray, uniqueWords } from '../utils/wordUtils.js'

const canIngestMode = (mode: string): mode is typeof dictionaryConfig.ingestModes[number] => {
    return dictionaryConfig.ingestModes.includes(mode as typeof dictionaryConfig.ingestModes[number])
}

const isAllowedDifficulty = (difficulty: string): difficulty is DictionaryDifficulty => {
    return dictionaryConfig.allowedDifficulties.includes(difficulty as DictionaryDifficulty)
}

export const dictionaryService = {
    async getRandomWords(params: { difficulty: DictionaryDifficulty; count: number; language?: AppLanguage }) {
        const { difficulty, count, language } = params
        if (count <= 0) {
            return { words: [], totalAvailable: 0 }
        }

        const resolvedLanguage = languageConfig.normalizeLanguage(language)
        const entries = await dictionaryRepository.findByDifficulty(
            prisma,
            difficulty,
            resolvedLanguage,
            dictionaryConfig.source
        )

        const words = entries.map((entry) => entry.word)
        const sampled = sampleArray(words, count)

        return {
            words: sampled,
            totalAvailable: words.length,
        }
    },

    async ingestGeneratedText(params: { text: string; difficulty: string; mode: string; language?: AppLanguage }) {
        const { text, difficulty, mode, language } = params

        if (!canIngestMode(mode)) {
            return
        }

        if (!isAllowedDifficulty(difficulty)) {
            return
        }

        const normalizedWords = uniqueWords(extractNormalizedWords(text))
        if (normalizedWords.length === 0) {
            return
        }

        const sampleLimit = Math.min(dictionaryConfig.wordsPerGame, dictionaryConfig.maxPerDifficulty)

        const resolvedLanguage = languageConfig.normalizeLanguage(language)

        await prisma.$transaction(async (tx) => {
            const existingEntries = await dictionaryRepository.findByDifficulty(
                tx,
                difficulty,
                resolvedLanguage,
                dictionaryConfig.source
            )

            const existingWordSet = new Set(existingEntries.map((entry) => entry.word.toLowerCase()))
            const candidates = normalizedWords.filter((word) => !existingWordSet.has(word))

            if (candidates.length === 0) {
                return
            }

            const wordsToInsert = sampleArray(candidates, sampleLimit)
            if (wordsToInsert.length === 0) {
                return
            }

            const currentCount = existingEntries.length
            const availableSlots = dictionaryConfig.maxPerDifficulty - currentCount

            if (availableSlots > 0) {
                const insertable = wordsToInsert.slice(0, Math.min(availableSlots, wordsToInsert.length))
                if (insertable.length === 0) {
                    return
                }

                await dictionaryRepository.createMany(
                    tx,
                    insertable,
                    difficulty,
                    resolvedLanguage,
                    dictionaryConfig.source
                )
                return
            }

            const idsToDelete = sampleArray(
                existingEntries.map((entry) => entry.id),
                wordsToInsert.length
            )

            if (idsToDelete.length === 0) {
                return
            }

            await dictionaryRepository.deleteByIds(tx, idsToDelete)
            await dictionaryRepository.createMany(
                tx,
                wordsToInsert.slice(0, idsToDelete.length),
                difficulty,
                resolvedLanguage,
                dictionaryConfig.source
            )
        })
    },
}
