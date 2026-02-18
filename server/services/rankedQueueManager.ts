import { rankedConfig } from '../config/ranked.js'
import type { RankedQueueEntry } from '../types/ranked.js'

const rangeForEntry = (entry: RankedQueueEntry, now: number) => {
  const elapsed = Math.max(0, now - entry.joinedAt)
  const steps = Math.floor(elapsed / rankedConfig.matchmaking.expandIntervalMs)
  const range = rankedConfig.matchmaking.initialRange + steps * rankedConfig.matchmaking.expandPerStep
  return Math.min(range, rankedConfig.matchmaking.maxRange)
}

export class RankedQueueManager {
  private queue: RankedQueueEntry[] = []

  getActiveUserIds() {
    return this.queue.map((item) => item.userId)
  }

  enqueue(entry: RankedQueueEntry) {
    const exists = this.queue.find((item) => item.userId === entry.userId)
    if (exists) return false
    this.queue.push(entry)
    return true
  }

  remove(userId: string) {
    this.queue = this.queue.filter((item) => item.userId !== userId)
  }

  pop(userId: string) {
    const index = this.queue.findIndex((item) => item.userId === userId)
    if (index === -1) return null
    const [entry] = this.queue.splice(index, 1)
    return entry
  }

  tryFindPair(now: number): { a: RankedQueueEntry; b: RankedQueueEntry } | null {
    for (let i = 0; i < this.queue.length; i += 1) {
      const a = this.queue[i]
      const rangeA = rangeForEntry(a, now)
      for (let j = i + 1; j < this.queue.length; j += 1) {
        const b = this.queue[j]
        const rangeB = rangeForEntry(b, now)
        const diff = Math.abs(a.rating - b.rating)
        if (diff <= rangeA && diff <= rangeB) {
          this.queue.splice(j, 1)
          this.queue.splice(i, 1)
          return { a, b }
        }
      }
    }
    return null
  }

  shouldSpawnBot(entry: RankedQueueEntry, now: number) {
    return now - entry.joinedAt >= rankedConfig.matchmaking.botAtMs
  }

  getStatusFor(userId: string, now: number) {
    const entry = this.queue.find((item) => item.userId === userId)
    if (!entry) return null
    return {
      range: rangeForEntry(entry, now),
      elapsedMs: now - entry.joinedAt,
    }
  }
}
