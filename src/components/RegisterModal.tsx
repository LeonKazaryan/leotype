import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import { setStoredAuth } from '../utils/auth'
import { useI18n } from '../hooks/useI18n'
import { authConfig } from '../config/auth'

type RegisterModalProps = {
  open: boolean
  onClose: () => void
  onAuthSuccess: (user: AuthResponse['user']) => void
  initialMode?: AuthMode
}

type FieldErrors = {
  username?: string
  password?: string
}

type AuthMode = 'register' | 'login'

type AuthResponse = {
  token: string
  user: {
    id: string
    username: string
  }
}

function RegisterModal({ open, onClose, onAuthSuccess, initialMode }: RegisterModalProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  const [mode, setMode] = useState<AuthMode>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const isValid = useMemo(() => {
    const nameOk = username.trim().length >= authConfig.usernameMin
    const passOk = password.length >= authConfig.passwordMin
    return nameOk && passOk
  }, [username, password])

  useEffect(() => {
    if (open) {
      setMode(initialMode ?? 'register')
      return
    }
    setMode('register')
    setUsername('')
    setPassword('')
    setErrors({})
    setServerError('')
    setSubmitting(false)
    setSuccessMessage('')
  }, [open, initialMode])

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {}
    if (username.trim().length < authConfig.usernameMin) {
      nextErrors.username = i18n.auth.validation.usernameMin(authConfig.usernameMin)
    }
    if (password.length < authConfig.passwordMin) {
      nextErrors.password = i18n.auth.validation.passwordMin(authConfig.passwordMin)
    }
    return nextErrors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')

    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const apiUrl = import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD ? '' : 'http://localhost:3001')

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'

    try {
      setSubmitting(true)
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const code = typeof data?.code === 'string' ? data.code : null
        if (code && code in i18n.auth.errorCodes) {
          const resolver = i18n.auth.errorCodes[code as keyof typeof i18n.auth.errorCodes]
          const message = typeof resolver === 'function'
            ? resolver(code === 'USERNAME_MIN' ? authConfig.usernameMin : authConfig.passwordMin)
            : resolver
          setServerError(message)
        } else {
          const message = data?.error || i18n.auth.errors.request
          setServerError(message)
        }
        return
      }

      const auth = data as AuthResponse
      setStoredAuth(auth.token, auth.user)
      onAuthSuccess(auth.user)

      setSuccessMessage(mode === 'register'
        ? i18n.auth.success.register
        : i18n.auth.success.login)
    } catch (error) {
      setServerError(i18n.auth.errors.serverConnection)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={`relative w-full max-w-md rounded-2xl p-6 ${themeClasses.card} border ${themeClasses.border} shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-bold ${themeClasses.primary}`}>
                  {mode === 'register' ? i18n.auth.title.register : i18n.auth.title.login}
                </h2>
                <p className={`text-sm ${themeClasses.secondary} opacity-80 mt-1`}>
                  {i18n.auth.tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={i18n.common.close}
                className={`text-lg ${themeClasses.secondary} hover:${themeClasses.primary} transition-colors`}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 flex gap-2">
              {(['register', 'login'] as AuthMode[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    mode === tab
                      ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                      : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                  }`}
                >
                  {tab === 'register' ? i18n.auth.tabs.register : i18n.auth.tabs.login}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                  {i18n.auth.usernameLabel}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={i18n.auth.usernamePlaceholder}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                {errors.username && (
                  <p className="text-xs text-red-400">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                  {i18n.auth.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {serverError && (
                <div className="text-xs text-red-400 text-center">{serverError}</div>
              )}
              {successMessage && (
                <div className={`text-xs text-center ${themeClasses.secondary} opacity-90`}>
                  {successMessage}
                </div>
              )}

              <div className="pt-2">
                <motion.button
                  whileHover={isSubmitting ? {} : { scale: 1.02 }}
                  whileTap={isSubmitting ? {} : { scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-semibold ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors ${
                    isSubmitting || !isValid ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting
                    ? i18n.auth.submit.submitting
                    : mode === 'register'
                      ? i18n.auth.submit.register
                      : i18n.auth.submit.login}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default RegisterModal
