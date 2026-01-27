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
  const generateNewText = useTypingStore((state) => state.generateNewText)
  const goToSettings = useTypingStore((state) => state.goToSettings)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [caretPosition, setCaretPosition] = useState(0)
  const themeClasses = getThemeClasses(settings.theme)
  
  useEffect(() => {
    if (!testState.isActive && !testState.isFinished) {
      inputRef.current?.focus()
    }
  }, [testState.isActive, testState.isFinished])
  
  const isPrintableKey = (key: string): boolean => {
    return key.length === 1
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (testState.isFinished || testState.isGeneratingAI) {
      e.preventDefault()
      return
    }
    
    if (e.key === 'Escape') {
      finishTest()
    }
  }
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    
    if (!testState.isActive && value.length > 0) {
      const lastChar = value[value.length - 1]
      if (isPrintableKey(lastChar)) {
        startTest()
      }
    }
    
    setCaretPosition(value.length)
    updateInput(value)
  }

  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (testState.isFinished || testState.isGeneratingAI) return
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Tab' || e.key === 'Enter') return
      if (!isPrintableKey(e.key)) return

      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if (!inputRef.current) return
      if (document.activeElement === inputRef.current) return

      inputRef.current.focus()
      e.preventDefault()
      const nextValue = testState.userInput + e.key
      if (!testState.isActive) {
        startTest()
      }
      setCaretPosition(nextValue.length)
      updateInput(nextValue)
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [
    testState.isFinished,
    testState.isGeneratingAI,
    testState.isActive,
    testState.userInput,
    startTest,
    updateInput,
  ])
  
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
          disabled={testState.isGeneratingAI}
          className="absolute inset-0 opacity-0 cursor-none disabled:cursor-not-allowed"
          autoFocus={!testState.isGeneratingAI}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      
      <AnimatePresence>
        {testState.isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-2xl z-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className={`w-12 h-12 border-4 border-t-4 rounded-full ${themeClasses.accent} border-opacity-50 mb-4`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xl font-semibold ${themeClasses.primary} mb-2`}
            >
              AI Generation in Process
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-sm ${themeClasses.secondary} opacity-70`}
            >
              Пожалуйста, подождите...
            </motion.p>
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
        {testState.isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToSettings}
              className={`px-6 py-3 rounded-lg font-medium ${themeClasses.secondary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors`}
            >
              ← Назад к настройкам
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateNewText}
              disabled={testState.isGeneratingAI}
              className={`px-6 py-3 rounded-lg font-medium ${themeClasses.primary} border-2 ${themeClasses.border} hover:bg-opacity-10 transition-colors ${
                testState.isGeneratingAI ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {testState.isGeneratingAI ? '⏳ Генерация...' : '🔄 Новая игра'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TypingTest
