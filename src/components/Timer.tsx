import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

function Timer() {
  const testState = useTypingStore((state) => state.testState)
  const settings = useTypingStore((state) => state.settings)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const themeClasses = getThemeClasses(settings.theme)
  
  useEffect(() => {
    if (!testState.isActive || testState.isFinished) {
      if (testState.startTime && testState.endTime) {
        setTimeElapsed((testState.endTime - testState.startTime) / 1000)
      } else {
        setTimeElapsed(0)
      }
      return
    }
    
    const interval = setInterval(() => {
      if (testState.startTime) {
        const elapsed = (Date.now() - testState.startTime) / 1000
        setTimeElapsed(elapsed)
        
        if (settings.mode === 'time' && elapsed >= settings.time) {
          clearInterval(interval)
        }
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [testState.isActive, testState.isFinished, testState.startTime, testState.endTime, settings.mode, settings.time])
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }
  
  const text = useTypingStore((state) => state.text)
  
  const getProgress = (): number => {
    if (settings.mode === 'time') {
      return testState.startTime ? (timeElapsed / settings.time) * 100 : 0
    }
    if (settings.mode === 'words') {
      const wordsTyped = testState.userInput.trim().split(/\s+/).filter(Boolean).length
      return (wordsTyped / settings.words) * 100
    }
    return (testState.userInput.length / text.length) * 100
  }
  
  const progress = getProgress()
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <motion.div
          className={`text-3xl font-bold ${themeClasses.primary}`}
          key={timeElapsed}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(timeElapsed)}
        </motion.div>
        
        {settings.mode === 'time' && (
          <div className={`text-lg ${themeClasses.secondary}`}>
            / {settings.time}с
          </div>
        )}
      </div>
      
      <div className={`h-2 rounded-full overflow-hidden ${themeClasses.bg} border ${themeClasses.border}`}>
        <motion.div
          className={`h-full ${themeClasses.accent} bg-current`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default Timer
