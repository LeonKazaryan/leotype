import { motion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'

interface TextDisplayProps {
  text: string
  getCharStatus: (index: number) => 'correct' | 'incorrect' | 'pending' | 'current'
  caretPosition: number
}

function TextDisplay({ text, getCharStatus, caretPosition }: TextDisplayProps) {
  const settings = useTypingStore((state) => state.settings)
  const themeClasses = getThemeClasses(settings.theme)
  const containerRef = useRef<HTMLDivElement>(null)
  const [caretMetrics, setCaretMetrics] = useState({ x: 0, y: 0, height: 0, visible: false })
  
  const updateCaretPosition = useCallback(() => {
    const container = containerRef.current
    if (!container || text.length === 0) {
      setCaretMetrics((prev) => ({ ...prev, visible: false }))
      return
    }
    
    const containerRect = container.getBoundingClientRect()
    const lastIndex = Math.max(text.length - 1, 0)
    const activeIndex = Math.min(caretPosition, text.length - 1)
    const activeEl = container.querySelector<HTMLElement>(`[data-char-index="${activeIndex}"]`)
    
    if (!activeEl) {
      setCaretMetrics((prev) => ({ ...prev, visible: false }))
      return
    }
    
    const activeRect = activeEl.getBoundingClientRect()
    const isAtEnd = caretPosition >= text.length
    const x = (isAtEnd ? activeRect.right : activeRect.left) - containerRect.left
    const y = activeRect.top - containerRect.top
    const height = activeRect.height
    
    setCaretMetrics({ x, y, height, visible: true })
  }, [caretPosition, text.length])

  useLayoutEffect(() => {
    updateCaretPosition()
  }, [updateCaretPosition, text])

  useEffect(() => {
    const handleResize = () => updateCaretPosition()
    window.addEventListener('resize', handleResize)
    const container = containerRef.current
    const resizeObserver = container ? new ResizeObserver(handleResize) : null
    if (container && resizeObserver) {
      resizeObserver.observe(container)
    }
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeObserver && container) {
        resizeObserver.disconnect()
      }
    }
  }, [updateCaretPosition])
  
  const getCharColor = (status: string) => {
    switch (status) {
      case 'correct':
        return themeClasses.primary
      case 'incorrect':
        return 'text-red-500'
      case 'current':
        return themeClasses.secondary
      default:
        return themeClasses.secondary
    }
  }

  const renderChar = (char: string, index: number) => {
    const status = getCharStatus(index)

    return (
      <motion.span
        key={index}
        data-char-index={index}
        initial={false}
        animate={{
          scale: status === 'incorrect' ? [1, 1.1, 1] : status === 'correct' ? [1, 1.05, 1] : 1,
          x: status === 'incorrect' ? [0, -3, 3, -3, 3, 0] : 0,
        }}
        transition={{
          duration: status === 'incorrect' ? 0.3 : 0.15,
          type: 'spring',
          stiffness: 300,
        }}
        className={`${getCharColor(status)} ${
          status === 'current' ? 'relative' : ''
        } ${status === 'correct' ? 'transition-all duration-200' : ''}`}
      >
        {char}
      </motion.span>
    )
  }
  
  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`text-2xl leading-relaxed font-mono ${themeClasses.secondary} select-none whitespace-normal`}
        style={{ wordBreak: 'normal', overflowWrap: 'normal' }}
      >
        <span className="inline">
          {text.split('').map((char, index) => renderChar(char, index))}
        </span>
      </div>
      {caretMetrics.visible && (
        <motion.span
          className={`absolute w-0.5 ${themeClasses.accent} bg-current`}
          style={{ top: 0, left: 0 }}
          animate={{
            x: caretMetrics.x,
            y: caretMetrics.y,
            height: caretMetrics.height,
            opacity: [1, 0, 1],
          }}
          transition={{
            x: { duration: 0.12, ease: 'easeOut' },
            y: { duration: 0.12, ease: 'easeOut' },
            height: { duration: 0.12, ease: 'easeOut' },
            opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      )}
    </div>
  )
}

export default TextDisplay
