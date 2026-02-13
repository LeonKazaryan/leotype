import jwt from 'jsonwebtoken'
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

const getJwtSecret = () => {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET is not configured')
  }
  return value
}

export const verifySocketToken = (token: string) => {
  const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload
  if (typeof payload.sub !== 'string') {
    throw new Error('token_invalid')
  }
  return {
    userId: payload.sub,
    username: typeof payload.username === 'string' ? payload.username : undefined,
  }
}
