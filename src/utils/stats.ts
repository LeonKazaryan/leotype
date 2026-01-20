import { TestStats } from '../types'

export function calculateStats(
  text: string,
  userInput: string,
  timeSeconds: number
): TestStats {
  const textChars = text.split('')
  const inputChars = userInput.split('')
  
  let correct = 0
  let incorrect = 0
  let extra = 0
  let missed = 0
  
  const maxLength = Math.max(textChars.length, inputChars.length)
  
  for (let i = 0; i < maxLength; i++) {
    if (i >= textChars.length) {
      extra++
    } else if (i >= inputChars.length) {
      missed++
    } else if (textChars[i] === inputChars[i]) {
      correct++
    } else {
      incorrect++
    }
  }
  
  const totalChars = correct + incorrect + extra + missed
  const accuracy = totalChars > 0 ? (correct / totalChars) * 100 : 0
  
  const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length
  const wpm = timeSeconds > 0 ? (wordsTyped / timeSeconds) * 60 : 0
  
  return {
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy * 100) / 100,
    time: Math.round(timeSeconds * 100) / 100,
    characters: {
      correct,
      incorrect,
      extra,
      missed,
    },
  }
}
