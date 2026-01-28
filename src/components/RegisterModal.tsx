import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

type RegisterModalProps = {
  open: boolean
  onClose: () => void
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

const USERNAME_MIN = 3
const PASSWORD_MIN = 6

function RegisterModal({ open, onClose }: RegisterModalProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)

  const [mode, setMode] = useState<AuthMode>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const isValid = useMemo(() => {
    const nameOk = username.trim().length >= USERNAME_MIN
    const passOk = password.length >= PASSWORD_MIN
    return nameOk && passOk
  }, [username, password])

  useEffect(() => {
    if (!open) {
      setMode('register')
      setUsername('')
      setPassword('')
      setErrors({})
      setServerError('')
      setSubmitting(false)
      setSuccessMessage('')
    }
  }, [open])

  function validate(): FieldErrors {
    const nextErrors: FieldErrors = {}
    if (username.trim().length < USERNAME_MIN) {
      nextErrors.username = `Минимум ${USERNAME_MIN} символа`
    }
    if (password.length < PASSWORD_MIN) {
      nextErrors.password = `Минимум ${PASSWORD_MIN} символов`
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
        const message = data?.error || 'Ошибка запроса'
        setServerError(message)
        return
      }

      const auth = data as AuthResponse
      localStorage.setItem('leotype_token', auth.token)
      localStorage.setItem('leotype_user', JSON.stringify(auth.user))

      setSuccessMessage(mode === 'register'
        ? 'Аккаунт создан. Ты в системе.'
        : 'Вход выполнен. Добро пожаловать.')
    } catch (error) {
      setServerError('Не удалось подключиться к серверу')
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
                  {mode === 'register' ? 'Регистрация' : 'Вход'}
                </h2>
                <p className={`text-sm ${themeClasses.secondary} opacity-80 mt-1`}>
                  Минималистично. Быстро. По делу.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
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
                  {tab === 'register' ? 'Регистрация' : 'Вход'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                  Username (уникальный)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="например: leon"
                  className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:border-opacity-100 focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
                />
                {errors.username && (
                  <p className="text-xs text-red-400">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>
                  Пароль
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
                    ? '⏳ Обработка...'
                    : mode === 'register'
                      ? 'Создать аккаунт'
                      : 'Войти'}
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
