import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { prisma } from './db/prisma.js'
import { dictionaryRouter } from './routes/dictionaryRoutes.js'
import { dictionaryService } from './services/dictionaryService.js'
import { languageConfig } from './config/language.js'
import { buildAIPrompt } from './config/aiPrompts.js'
import { authErrorCodes } from './config/errorCodes.js'
import { authConfig } from './config/auth.js'
import { registerPvpSocket } from './services/pvpSocketServer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: join(__dirname, '../.env') })
} else {
    dotenv.config()
}

const app = express()
const httpServer = createServer(app)
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

function getUserIdFromRequest(req: express.Request): { userId: string | null; error?: string } {
    const authHeader = req.header('authorization')
    if (!authHeader) return { userId: null, error: 'missing_authorization' }

    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (!match) return { userId: null, error: 'invalid_authorization_format' }

    try {
        const payload = jwt.verify(match[1], getJwtSecret()) as jwt.JwtPayload
        return { userId: typeof payload.sub === 'string' ? payload.sub : null }
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { userId: null, error: 'token_expired' }
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return { userId: null, error: `token_invalid:${error.message}` }
        }
        return { userId: null, error: 'token_invalid' }
    }
}

app.post('/api/auth/register', async (req, res) => {
    try {
        const rawUsername = typeof req.body?.username === 'string' ? req.body.username : ''
        const rawPassword = typeof req.body?.password === 'string' ? req.body.password : ''
        const username = rawUsername.trim()

        if (username.length < authConfig.usernameMin) {
            return res.status(400).json({
                error: `Username must be at least ${authConfig.usernameMin} characters`,
                code: authErrorCodes.USERNAME_MIN,
            })
        }

        if (rawPassword.length < authConfig.passwordMin) {
            return res.status(400).json({
                error: `Password must be at least ${authConfig.passwordMin} characters`,
                code: authErrorCodes.PASSWORD_MIN,
            })
        }

        const existing = await prisma.user.findUnique({ where: { username } })
        if (existing) {
            return res.status(409).json({ error: 'Username already taken', code: authErrorCodes.USERNAME_TAKEN })
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
        return res.status(500).json({ error: 'Server error', code: authErrorCodes.SERVER_ERROR })
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const rawUsername = typeof req.body?.username === 'string' ? req.body.username : ''
        const rawPassword = typeof req.body?.password === 'string' ? req.body.password : ''
        const username = rawUsername.trim()

        if (!username || !rawPassword) {
            return res.status(400).json({ error: 'Username and password are required', code: authErrorCodes.REQUIRED_FIELDS })
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
            return res.status(401).json({ error: 'Invalid username or password', code: authErrorCodes.INVALID_CREDENTIALS })
        }

        const passwordOk = await bcrypt.compare(rawPassword, user.passwordHash)
        if (!passwordOk) {
            return res.status(401).json({ error: 'Invalid username or password', code: authErrorCodes.INVALID_CREDENTIALS })
        }

        const token = jwt.sign({ sub: user.id, username: user.username }, getJwtSecret(), {
            expiresIn: TOKEN_EXPIRES_IN,
        })

        return res.status(200).json({ token, user: { id: user.id, username: user.username } })
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Server error', code: authErrorCodes.SERVER_ERROR })
    }
})

app.post('/api/user/stats', async (req, res) => {
    try {
        const auth = getUserIdFromRequest(req)
        if (!auth.userId) {
            return res.status(401).json({ error: 'Unauthorized', code: auth.error || 'unauthorized' })
        }

        const rawCharacters = Number(req.body?.characters)
        const rawWords = Number(req.body?.words)

        if (!Number.isFinite(rawCharacters) || !Number.isFinite(rawWords)) {
            return res.status(400).json({ error: 'Invalid stats payload' })
        }

        const characters = Math.max(0, Math.floor(rawCharacters))
        const words = Math.max(0, Math.floor(rawWords))

        if (characters === 0 && words === 0) {
            return res.status(200).json({ ok: true })
        }

        await prisma.user.update({
            where: { id: auth.userId },
            data: {
                charactersWritten: { increment: characters },
                wordsWritten: { increment: words },
            },
        })

        return res.status(200).json({ ok: true })
    } catch (error) {
        console.error('Update stats error:', error)
        return res.status(500).json({ error: 'Server error' })
    }
})

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 3000
const requestQueue: Array<{
    resolve: (value: string) => void
    reject: (error: Error) => void
    params: { mode: string; count: number; topic: string; difficulty: string; language: string }
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
    language: string
}): Promise<string> {
    const { mode, count, topic, difficulty, language } = params
    const apiKey = process.env.XAI_API_KEY

    if (!apiKey) {
        throw new Error('XAI API key not configured on server')
    }

    const resolvedLanguage = languageConfig.normalizeLanguage(language)
    const normalizedMode = (mode === 'quote' || mode === 'words' || mode === 'time' ? mode : 'time') as
        'time' | 'words' | 'quote'
    const normalizedDifficulty = (
        difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard'
            ? difficulty
            : 'medium'
    ) as 'easy' | 'medium' | 'hard'

    const { prompt, system } = buildAIPrompt({
        mode: normalizedMode,
        count,
        topic,
        difficulty: normalizedDifficulty,
        language: resolvedLanguage,
    })

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
                    content: system,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: normalizedMode === 'quote' ? 50 : count * 10,
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
            const topicLabel = request.params.topic.trim() || 'no topic'
            const languageLabel = languageConfig.normalizeLanguage(request.params.language)
            console.log(`📝 Processing request: ${topicLabel} (${request.params.difficulty}, ${languageLabel})`)
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
        const { mode, count, topic, difficulty, language } = req.body

        if (!mode || typeof count !== 'number' || typeof topic !== 'string' || !difficulty) {
            return res.status(400).json({ error: 'Invalid request parameters' })
        }
        if (mode === 'quote' && topic.trim().length === 0) {
            return res.status(400).json({ error: 'Topic is required for quote mode' })
        }
        if (typeof language === 'string' && !languageConfig.isSupportedLanguage(language)) {
            return res.status(400).json({ error: 'Invalid language' })
        }
        const resolvedLanguage = typeof language === 'string'
            ? language
            : languageConfig.defaultLanguage

        const result = await new Promise<string>((resolve, reject) => {
            requestQueue.push({ resolve, reject, params: { mode, count, topic, difficulty, language: resolvedLanguage } })
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

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
})

registerPvpSocket(io)

httpServer.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📋 Queue system ready`)

    const apiKeyValid = await checkAPIKey()
    if (!apiKeyValid) {
        console.log('⚠️  Server started but API key check failed. AI generation may not work.')
    }
})
