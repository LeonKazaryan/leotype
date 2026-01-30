import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: join(__dirname, '../../.env') })
} else {
    dotenv.config()
}

const requiredString = (name: string): string => {
    const value = process.env[name]
    if (!value) {
        throw new Error(`${name} is required`)
    }
    return value
}

const requiredNumber = (name: string): number => {
    const rawValue = requiredString(name)
    const parsed = Number.parseInt(rawValue, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`${name} must be a positive number`)
    }
    return parsed
}

const allowedDifficulties = ['easy', 'medium', 'hard'] as const
const ingestModes = ['words', 'time'] as const

export type DictionaryDifficulty = typeof allowedDifficulties[number]
export type DictionaryIngestMode = typeof ingestModes[number]

export const dictionaryConfig = {
    maxPerDifficulty: requiredNumber('DICTIONARY_MAX_PER_DIFFICULTY'),
    wordsPerGame: requiredNumber('DICTIONARY_WORDS_PER_GAME'),
    language: requiredString('DICTIONARY_LANGUAGE'),
    source: requiredString('DICTIONARY_SOURCE'),
    allowedDifficulties,
    ingestModes,
}
