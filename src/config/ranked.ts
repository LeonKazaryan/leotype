export const rankedConfig = {
  rating: {
    start: 1000,
    kFactor: 32,
  },
  matchmaking: {
    initialRange: 80,
    expandPerStep: 30,
    expandIntervalMs: 2000,
    maxRange: 250,
    botAtMs: 9000,
  },
  match: {
    syncHoldMs: 700,
    countdownSeconds: 3,
    countdownTickMs: 1000,
  },
  ui: {
    statusTextIntervalMs: 1500,
  },
  bots: {
    names: ['Nova', 'Rex', 'Vega', 'Kiro'],
    profiles: [
      { wpm: 55, accuracy: 96 },
      { wpm: 72, accuracy: 94 },
      { wpm: 88, accuracy: 92 },
    ],
  },
}

export type RankedBotProfile = (typeof rankedConfig.bots.profiles)[number]
