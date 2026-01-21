import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import TextDisplay from './TextDisplay'
import Timer from './Timer'

function TypingTest() {
  const text = useTypingStore((state) => state.text)
  const testState = useTypingStore((state) => state.testState)
  const settings = useTypingStore((state) => state.settings)
  const startTest = useTypingStore((state) => state.startTest)
  const updateInput = useTypingStore((state) => state.updateInput)
  const finishTest = useTypingStore((state) => state.finishTest)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [caretPosition, setCaretPosition] = useState(0)
  const themeClasses = getThemeClasses(settings.theme)
  
  useEffect(() => {
    if (!testState.isActive && !testState.isFinished) {
      inputRef.current?.focus()
    }
  }, [testState.isActive, testState.isFinished])
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (testState.isFinished) {
      e.preventDefault()
      return
    }
    
    if (!testState.isActive && e.key !== 'Tab' && e.key !== 'Escape') {
      startTest()
    }
    
    if (e.key === 'Escape') {
      finishTest()
    }
  }
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCaretPosition(value.length)
    updateInput(value)
  }
  
  const getCharStatus = (index: number): 'correct' | 'incorrect' | 'pending' | 'current' => {
    if (index < testState.userInput.length) {
      return text[index] === testState.userInput[index] ? 'correct' : 'incorrect'
    }
    if (index === testState.userInput.length) {
      return 'current'
    }
    return 'pending'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className={`rounded-2xl p-8 ${themeClasses.card} border-2 ${themeClasses.border} shadow-2xl`}
    >
      <div className="mb-6">
        <Timer />
      </div>
      
      <div className="relative mb-8">
        <TextDisplay text={text} getCharStatus={getCharStatus} caretPosition={caretPosition} />
        
        <textarea
          ref={inputRef}
          value={testState.userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 cursor-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      
      <AnimatePresence>
        {testState.isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center ${themeClasses.primary} text-lg flex items-center justify-center gap-2`}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⏳
            </motion.span>
            Генерация текста через AI...
          </motion.div>
        )}
        {!testState.isActive && !testState.isFinished && !testState.isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center ${themeClasses.secondary} text-lg`}
          >
            Начните печатать, чтобы начать тест
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TypingTest
