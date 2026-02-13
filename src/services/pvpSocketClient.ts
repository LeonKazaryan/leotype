import { io, Socket } from 'socket.io-client'
import { pvpRealtimeConfig } from '../config/pvpRealtime'
import { pvpSocketEvents } from '../config/pvpSocket'
import { getStoredToken } from '../utils/auth'

export type PvpSocketStatus = 'disconnected' | 'connecting' | 'connected'

let socket: Socket | null = null

export const getPvpSocket = () => socket

export const connectPvpSocket = () => {
  if (socket?.connected) return socket

  const token = getStoredToken()
  if (!token) {
    return null
  }

  socket = io(pvpRealtimeConfig.url, {
    autoConnect: false,
    transports: [...pvpRealtimeConfig.transports],
    auth: { token },
    reconnectionAttempts: pvpRealtimeConfig.reconnect.attempts,
    reconnectionDelay: pvpRealtimeConfig.reconnect.delayMs,
  })

  socket.connect()
  return socket
}

export const disconnectPvpSocket = () => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export const emitPvp = <T>(event: string, payload?: T) => {
  if (!socket) return
  socket.emit(event, payload)
}

export const onPvp = (event: string, handler: (...args: unknown[]) => void) => {
  if (!socket) return
  socket.on(event, handler)
}

export const offPvp = (event: string, handler?: (...args: unknown[]) => void) => {
  if (!socket) return
  if (handler) {
    socket.off(event, handler)
  } else {
    socket.off(event)
  }
}

export const pvpSocketClient = {
  events: pvpSocketEvents,
}
