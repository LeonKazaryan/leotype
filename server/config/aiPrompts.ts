import type { AppLanguage } from './language.js'

export type AIPromptMode = 'time' | 'words' | 'quote'
export type AIDifficulty = 'easy' | 'medium' | 'hard'

const difficultyDescriptions: Record<AppLanguage, Record<AIDifficulty, string>> = {
    ru: {
        easy: ': 3–6 букв, очень бытовые слова, без редких буквосочетаний, без приставок типа “пред-, меж-, сверх-”.',
        medium: '6–10 букв, обычные слова, допускаются приставки/суффиксы, но без терминов',
        hard: '10–16 букв, допускаются термины/книжные слова, но без дефиса и пробелов.',
    },
    en: {
        easy: '3–6 letters, 1 syllable preferred (can be 2), no hyphens, no proper nouns, no rare words, no abbreviations.',
        medium: '6–9 letters, 2–3 syllables, common words only, no proper nouns.',
        hard: '9–14 letters, 4+ syllables, can include academic/technical but still single word, no spaces/hyphens.',
    },
}

const systemPrompts: Record<AppLanguage, string> = {
    ru: 'Ты помощник для генерации текста для тренировки печати. Отвечай только запрошенным текстом, без дополнительных объяснений.',
    en: 'You generate text for typing practice. Reply with only the requested text and nothing else.',
}

const promptTemplates: Record<AppLanguage, {
    quote: { withTopic: string; withoutTopic: string }
    words: { withTopic: string; withoutTopic: string }
    text: { withTopic: string; withoutTopic: string }
}> = {
    ru: {
        quote: {
            withTopic: 'Сгенерируй одну короткую мотивирующую цитату на тему "{topic}" на русском языке. Сложность: {difficulty}. Только цитату, без кавычек и дополнительных слов.',
            withoutTopic: 'Сгенерируй одну короткую мотивирующую цитату на русском языке. Сложность: {difficulty}. Только цитату, без кавычек и дополнительных слов.',
        },
        words: {
            withTopic: 'Сгенерируй список из {count} случайных русских слов на тему "{topic}". Сложность: {difficulty}. Слова должны быть разделены пробелами, без нумерации и дополнительных символов.',
            withoutTopic: 'Сгенерируй список из {count} случайных русских слов на русском языке. Сложность: {difficulty}. Слова должны быть разделены пробелами, без нумерации и дополнительных символов.',
        },
        text: {
            withTopic: 'Сгенерируй связный текст из примерно {count} слов на русском языке на тему "{topic}". Сложность: {difficulty}. Только текст, без заголовков и дополнительных слов.',
            withoutTopic: 'Сгенерируй связный текст из примерно {count} слов на русском языке. Сложность: {difficulty}. Только текст, без заголовков и дополнительных слов.',
        },
    },
    en: {
        quote: {
            withTopic: 'Generate one short motivational quote about "{topic}" in English. Difficulty: {difficulty}. Provide only the quote, without quotation marks or extra words.',
            withoutTopic: 'Generate one short motivational quote in English. Difficulty: {difficulty}. Provide only the quote, without quotation marks or extra words.',
        },
        words: {
            withTopic: 'Generate a list of {count} random English words about "{topic}". Difficulty: {difficulty}. Separate words with spaces, no numbering or extra symbols.',
            withoutTopic: 'Generate a list of {count} random English words. Difficulty: {difficulty}. Separate words with spaces, no numbering or extra symbols.',
        },
        text: {
            withTopic: 'Generate a coherent text of about {count} words in English about "{topic}". Difficulty: {difficulty}. Only the text, no headings or extra words.',
            withoutTopic: 'Generate a coherent text of about {count} words in English. Difficulty: {difficulty}. Only the text, no headings or extra words.',
        },
    },
}

const interpolate = (template: string, values: Record<string, string | number>) => {
    return template
        .replace('{topic}', String(values.topic ?? ''))
        .replace('{count}', String(values.count ?? ''))
        .replace('{difficulty}', String(values.difficulty ?? ''))
}

export const buildAIPrompt = (params: {
    mode: AIPromptMode
    count: number
    topic: string
    difficulty: AIDifficulty
    language: AppLanguage
}): { prompt: string; system: string } => {
    const { mode, count, topic, difficulty, language } = params
    const templates = promptTemplates[language] || promptTemplates.ru
    const difficultyText = difficultyDescriptions[language]?.[difficulty] || difficultyDescriptions[language]?.medium || ''
    const trimmedTopic = topic.trim()
    const hasTopic = trimmedTopic.length > 0

    const templateGroup = mode === 'quote' ? templates.quote : mode === 'words' ? templates.words : templates.text
    const template = hasTopic ? templateGroup.withTopic : templateGroup.withoutTopic

    return {
        prompt: interpolate(template, { topic: trimmedTopic, count, difficulty: difficultyText }),
        system: systemPrompts[language] || systemPrompts.ru,
    }
}
