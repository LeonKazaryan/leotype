export type AuthUser = {
  id: string
  username: string
}

const STORAGE_TOKEN_KEY = 'leotype_token'
const STORAGE_USER_KEY = 'leotype_user'

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function setStoredAuth(token: string, user: AuthUser) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
}

function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USER_KEY)
}

export { getStoredUser, getStoredToken, setStoredAuth, clearStoredAuth }
