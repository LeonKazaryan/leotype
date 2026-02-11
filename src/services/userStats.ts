import { apiBaseUrl, apiRoutes } from '../config/api'
import { getStoredToken } from '../utils/auth'

export async function sendUserStats(payload: { characters: number; words: number }): Promise<void> {
  const token = getStoredToken()
  if (!token) return

  const response = await fetch(`${apiBaseUrl}${apiRoutes.userStats}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }
}
