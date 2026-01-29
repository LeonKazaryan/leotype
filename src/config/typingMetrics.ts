export const typingMetricsConfig = {
  time: {
    msPerSecond: 1000,
    msPerMinute: 60000,
  },
  wpm: {
    charsPerWord: 5,
    minValue: 0,
  },
  sampling: {
    intervalMs: 500,
    windowMs: 4000,
    minWindowMs: 500,
    minPoints: 8,
    maxPoints: 26,
    smoothingWindow: 3,
  },
}
