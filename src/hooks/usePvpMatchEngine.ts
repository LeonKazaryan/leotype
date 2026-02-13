import { useEffect, useRef } from 'react'
import { pvpConfig } from '../config/pvp'
import { usePvpStore } from '../store/usePvpStore'

export const usePvpMatchEngine = () => {
  const match = usePvpStore((state) => state.match)
  const clockOffsetMs = usePvpStore((state) => state.clockOffsetMs)
  const setCountdown = usePvpStore((state) => state.setCountdown)

  const countdownRef = useRef<number | null>(null)

  useEffect(() => {
    if (match.stage !== 'countdown' || !match.startedAt) {
      setCountdown(pvpConfig.network.countdownSeconds)
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current)
        countdownRef.current = null
      }
      return
    }

    const updateCountdown = () => {
      const now = Date.now() + clockOffsetMs
      const remainingMs = Math.max(match.startedAt - now, 0)
      const remainingSec = Math.ceil(remainingMs / pvpConfig.network.countdownTickMs)
      setCountdown(remainingSec)
    }

    updateCountdown()
    countdownRef.current = window.setInterval(updateCountdown, pvpConfig.network.countdownTickMs)

    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [match.stage, match.startedAt, clockOffsetMs, setCountdown])
}
