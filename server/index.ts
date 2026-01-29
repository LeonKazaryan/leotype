import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db/prisma.js'
import { dictionaryRouter } from './routes/dictionaryRoutes.js'
import { dictionaryService } from './services/dictionaryService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: join(__dirname, '../.env') })
} else {
    dotenv.config()
}

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173', 'http://localhost:3000']

console.log('🌐 Allowed origins:', allowedOrigins)
console.log('🌐 NODE_ENV:', process.env.NODE_ENV)

app.use(
    cors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin) {
                console.log('⚠️  Request without origin, allowing')
                return callback(null, true)
            }

            console.log('🔍 Checking origin:', origin)
            console.log('🔍 Allowed origins:', allowedOrigins)

            if (allowedOrigins.includes(origin)) {
                console.log('✅ Origin allowed:', origin)
                return callback(null, true)
            }

            if (process.env.NODE_ENV === 'production') {
                console.log('❌ Origin not allowed in production:', origin)
                return callback(new Error(`Not allowed by CORS: ${origin}`))
            }

            console.log('⚠️  Origin not in list but allowing (dev mode):', origin)
            return callback(null, true)
        },
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
)
app.use(express.json())
app.use('/api/dictionary', dictionaryRouter)

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRES_IN = '7d'

function getJwtSecret() {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured')
    }
    return JWT_SECRET
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const rawUsername = typeof req.body?.username === 'string' ? req.body.username : ''
        const rawPassword = typeof req.body?.password === 'string' ? req.body.password : ''
        const username = rawUsername.trim()

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username должен быть минимум 3 символа' })
        }

        if (rawPassword.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' })
        }

        const existing = await prisma.user.findUnique({ where: { username } })
        if (existing) {
            return res.status(409).json({ error: 'Этот username уже занят' })
        }

        const passwordHash = await bcrypt.hash(rawPassword, 10)
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
            },
            select: {
                id: true,
                username: true,
            },
        })

        const token = jwt.sign({ sub: user.id, username: user.username }, getJwtSecret(), {
            expiresIn: TOKEN_EXPIRES_IN,
        })

        return res.status(201).json({ token, user })
    } catch (error) {
        console.error('Register error:', error)
        return res.status(500).json({ error: 'Ошибка сервера' })
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const rawUsername = typeof req.body?.username === 'string' ? req.body.username : ''
        const rawPassword = typeof req.body?.password === 'string' ? req.body.password : ''
        const username = rawUsername.trim()

        if (!username || !rawPassword) {
            return res.status(400).json({ error: 'Username и пароль обязательны' })
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                passwordHash: true,
            },
        })

        if (!user) {
            return res.status(401).json({ error: 'Неверный username или пароль' })
        }

        const passwordOk = await bcrypt.compare(rawPassword, user.passwordHash)
        if (!passwordOk) {
            return res.status(401).json({ error: 'Неверный username или пароль' })
        }

        const token = jwt.sign({ sub: user.id, username: user.username }, getJwtSecret(), {
            expiresIn: TOKEN_EXPIRES_IN,
        })

        return res.status(200).json({ token, user: { id: user.id, username: user.username } })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Ошибка сервера' })
    }
})

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 3000
const requestQueue: Array<{
    resolve: (value: string) => void
    reject: (error: Error) => void
    params: { mode: string; count: number; topic: string; difficulty: string }
}> = []
let isProcessingQueue = false

async function checkAPIKey(): Promise<boolean> {
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
        const response = await fetch('https://api.x.ai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
}): Promise<string> {
    const { mode, count, topic, difficulty } = params
    const apiKey = process.env.XAI_API_KEY

    if (!apiKey) {
        throw new Error('XAI API key not configured on server')
    }

    const difficultyMap: Record<string, string> = {
        easy: 'простые и короткие слова, базовый уровень',
        medium: 'средней сложности слова и фразы',
        hard: 'сложные технические термины и длинные предложения',
    }

    const difficultyDesc = difficultyMap[difficulty] || difficultyMap.medium
    const trimmedTopic = topic.trim()
    const hasTopic = trimmedTopic.length > 0

    let prompt = ''

    if (mode === 'quote') {
        prompt = hasTopic
            ? `Сгенерируй одну короткую мотивирующую цитату на тему "${trimmedTopic}" на русском языке. Сложность: ${difficultyDesc}. Только цитату, без кавычек и дополнительных слов.`
            : `Сгенерируй одну короткую мотивирующую цитату на русском языке. Сложность: ${difficultyDesc}. Только цитату, без кавычек и дополнительных слов.`
    } else if (mode === 'words') {
        prompt = hasTopic
            ? `Сгенерируй список из ${count} случайных русских слов на тему "${trimmedTopic}". Сложность: ${difficultyDesc}. Слова должны быть разделены пробелами, без нумерации и дополнительных символов.`
            : `Сгенерируй список из ${count} случайных русских слов на русском языке. Сложность: ${difficultyDesc}. Слова должны быть разделены пробелами, без нумерации и дополнительных символов.`
    } else {
        prompt = hasTopic
            ? `Сгенерируй связный текст из примерно ${count} слов на русском языке на тему "${trimmedTopic}". Сложность: ${difficultyDesc}. Только текст, без заголовков и дополнительных слов.`
            : `Сгенерируй связный текст из примерно ${count} слов на русском языке. Сложность: ${difficultyDesc}. Только текст, без заголовков и дополнительных слов.`
    }

    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestTime

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest
        console.log(`⏳ Waiting ${Math.ceil(waitTime / 1000)}s before request...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    console.log(`📤 Sending request to XAI (Grok)...`)
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'grok-3',
            messages: [
                {
                    role: 'system',
                    content: 'Ты помощник для генерации текста для тренировки печати. Отвечай только запрошенным текстом, без дополнительных объяснений.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: mode === 'quote' ? 50 : count * 10,
            temperature: 0.8,
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

        console.error(`❌ XAI API error: ${response.status} ${response.statusText}`)
        console.error(`Error details:`, JSON.stringify(errorData, null, 2))

        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your XAI_API_KEY in .env file.')
        }

        if (response.status === 429) {
            const errorMessage = errorData.error?.message || ''
            const errorCode = errorData.error?.code || ''
            const retryAfter = response.headers.get('Retry-After')

            console.log(`Rate limit details: code=${errorCode}, message=${errorMessage}, retryAfter=${retryAfter}`)

            // Проверка на quota/billing ошибки
            if (errorMessage.toLowerCase().includes('quota') ||
                errorMessage.toLowerCase().includes('billing') ||
                errorMessage.toLowerCase().includes('insufficient_quota') ||
                errorCode === 'insufficient_quota') {
                throw new Error(`API quota exceeded: ${errorMessage || errorCode}. Please check your XAI account billing.`)
            }

            let waitTime = 20000
            if (retryAfter) {
                waitTime = parseInt(retryAfter) * 1000
            }

            throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds and try again.`)
        }

        // Проверка на другие ошибки связанные с billing (может прийти с другим статусом)
        const errorCode = errorData.error?.code || ''
        const errorMessage = errorData.error?.message || ''

        if (errorCode === 'insufficient_quota' ||
            errorMessage.toLowerCase().includes('quota') ||
            errorMessage.toLowerCase().includes('billing')) {
            throw new Error(`API quota/billing issue: ${errorMessage || errorCode}. Please check your XAI account.`)
        }

        if (response.status === 404) {
            if (errorMessage.includes('deprecated') || errorMessage.includes('model')) {
                throw new Error(`Model error: ${errorMessage}`)
            }
            throw new Error(`XAI API error (404): ${errorMessage || response.statusText}`)
        }

        if (response.status === 500 || response.status === 502 || response.status === 503) {
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
        console.error('❌ No text in response:', data)
        throw new Error('No text generated')
    }

    console.log(`✅ Successfully generated ${generatedText.length} characters`)
    try {
        await dictionaryService.ingestGeneratedText({ text: generatedText, difficulty, mode })
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
            const topicLabel = request.params.topic.trim() || 'без темы'
            console.log(`📝 Processing request: ${topicLabel} (${request.params.difficulty})`)
            const result = await makeXAIRequest(request.params)
            request.resolve(result)
        } catch (error) {
            if (error instanceof Error) {
                console.error(`❌ Request failed: ${error.message}`)
                request.reject(error)
            } else {
                request.reject(new Error('Unknown error occurred'))
            }
        }
    }

    isProcessingQueue = false
}

app.post('/api/generate-text', async (req: express.Request, res: express.Response) => {
    try {
        const { mode, count, topic, difficulty } = req.body

        if (!mode || typeof count !== 'number' || typeof topic !== 'string' || !difficulty) {
            return res.status(400).json({ error: 'Invalid request parameters' })
        }

        const result = await new Promise<string>((resolve, reject) => {
            requestQueue.push({ resolve, reject, params: { mode, count, topic, difficulty } })
            processQueue()
        })

        res.json({ text: result })
    } catch (error) {
        if (error instanceof Error) {
            let statusCode = 500
            if (error.message.includes('Rate limit')) {
                statusCode = 429
            } else if (error.message.includes('Invalid API') || error.message.includes('API key')) {
                statusCode = 401
            } else if (error.message.includes('quota') || error.message.includes('billing')) {
                statusCode = 402 // Payment Required
            }

            console.error(`❌ Error: ${error.message}`)
            res.status(statusCode).json({ error: error.message })
        } else {
            res.status(500).json({ error: 'Unknown error occurred' })
        }
    }
})

app.get('/', (req: express.Request, res: express.Response) => {
    res.json({
        message: 'Leotype API Server',
        status: 'running',
        endpoints: {
            health: '/api/health',
            generate: 'POST /api/generate-text'
        }
    })
})

app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.json({
        status: 'ok',
        isProcessing: isProcessingQueue,
        queueLength: requestQueue.length,
        lastRequestTime: lastRequestTime ? new Date(lastRequestTime).toISOString() : null,
        hasApiKey: !!process.env.XAI_API_KEY
    })
})

app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📋 Queue system ready`)

    const apiKeyValid = await checkAPIKey()
    if (!apiKeyValid) {
        console.log('⚠️  Server started but API key check failed. AI generation may not work.')
    }
})
