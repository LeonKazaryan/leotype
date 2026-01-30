import type { Request, Response } from 'express'
import { dictionaryConfig, DictionaryDifficulty } from '../config/dictionary.js'
import { languageConfig } from '../config/language.js'
import type { AppLanguage } from '../config/language.js'
import { dictionaryService } from '../services/dictionaryService.js'

const parseCount = (value: unknown): number | null => {
    if (typeof value !== 'string') {
        return null
    }

    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null
    }

    return parsed
}

const parseDifficulty = (value: unknown): DictionaryDifficulty | null => {
    if (typeof value !== 'string') {
        return null
    }

    if (!dictionaryConfig.allowedDifficulties.includes(value as DictionaryDifficulty)) {
        return null
    }

    return value as DictionaryDifficulty
}

const parseLanguage = (value: unknown): AppLanguage | null => {
    if (typeof value !== 'string') {
        return null
    }

    if (!languageConfig.isSupportedLanguage(value, dictionaryConfig.supportedLanguages)) {
        return null
    }

    return value as AppLanguage
}

export const getDictionaryWords = async (req: Request, res: Response) => {
    try {
        const difficulty = parseDifficulty(req.query.difficulty)
        const count = parseCount(req.query.count)
        const language = parseLanguage(req.query.language)

        if (typeof req.query.language === 'string' && !language) {
            return res.status(400).json({ error: 'Invalid language' })
        }

        if (!difficulty || !count) {
            return res.status(400).json({ error: 'Invalid difficulty or count' })
        }

        const result = await dictionaryService.getRandomWords({
            difficulty,
            count,
            language: language ?? dictionaryConfig.defaultLanguage,
        })

        return res.status(200).json({
            words: result.words,
            totalAvailable: result.totalAvailable,
        })
    } catch (error) {
        console.error('Dictionary words error:', error)
        return res.status(500).json({ error: 'Ошибка сервера' })
    }
}
