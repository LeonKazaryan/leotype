import { apiBaseUrl } from './api'

export const pvpRealtimeConfig = {
  url: import.meta.env.VITE_SOCKET_URL || apiBaseUrl,
  transports: ['websocket'] as const,
  reconnect: {
    attempts: 5,
    delayMs: 600,
  },
}
