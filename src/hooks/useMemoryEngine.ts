import { useEffect } from 'react'
import { memoryConfig } from '../config/memory'
import { useMemoryStore } from '../store/useMemoryStore'

export const useMemoryEngine = () => {
  const phase = useMemoryStore((state) => state.phase)
  const cards = useMemoryStore((state) => state.cards)
  const currentIndex = useMemoryStore((state) => state.currentIndex)
  const setRemainingMs = useMemoryStore((state) => state.setRemainingMs)
  const advanceCard = useMemoryStore((state) => state.advanceCard)
  const goToRecall = useMemoryStore((state) => state.goToRecall)

  useEffect(() => {
    if (phase !== 'memorize') return
    const card = cards[currentIndex]
    if (!card) return

    const startTime = Date.now()
    const endTime = startTime + card.durationMs

    setRemainingMs(card.durationMs)

    const interval = window.setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now())
      setRemainingMs(remaining)
    }, memoryConfig.timer.tickMs)

    const timeout = window.setTimeout(() => {
      advanceCard()
    }, card.durationMs)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [phase, cards, currentIndex, advanceCard, setRemainingMs])

  useEffect(() => {
    if (phase !== 'transition') return
    const timeout = window.setTimeout(() => {
      goToRecall()
    }, memoryConfig.transition.toRecallMs)

    return () => window.clearTimeout(timeout)
  }, [phase, goToRecall])
}
