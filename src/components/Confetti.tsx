import { motion } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'

const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function Confetti() {
  const testState = useTypingStore((state) => state.testState)
  
  if (!testState.isFinished || !testState.stats) {
    return null
  }
  
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 8,
  }))
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: 360,
            opacity: 0,
          }}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
