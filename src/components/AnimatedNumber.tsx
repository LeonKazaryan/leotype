import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
  decimals?: number
}

function AnimatedNumber({ value, className = '', decimals = 0 }: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 30 })
  const display = useTransform(spring, (current) =>
    current.toFixed(decimals)
  )
  
  useEffect(() => {
    spring.set(value)
  }, [spring, value])
  
  return <motion.span className={className}>{display}</motion.span>
}

export default AnimatedNumber
