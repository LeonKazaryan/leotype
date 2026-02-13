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
import { languageConfig } from './config/language.js'
import { authErrorCodes } from './config/errorCodes.js'
import { authConfig } from './config/auth.js'
import { registerPvpSocket } from './services/pvpSocketServer.js'
import { checkXaiApiKey, generateAiText } from './services/aiTextService.js'

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

        const result = await generateAiText({ mode, count, topic, difficulty, language: resolvedLanguage })

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
        hasApiKey: !!process.env.XAI_API_KEY,
    })
})

app.get('/api/health/ai', async (req: express.Request, res: express.Response) => {
    const isValid = await checkXaiApiKey()
    res.json({
        status: isValid ? 'ok' : 'invalid',
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

    const apiKeyValid = await checkXaiApiKey()
    if (!apiKeyValid) {
        console.log('⚠️  Server started but API key check failed. AI generation may not work.')
    }
})
