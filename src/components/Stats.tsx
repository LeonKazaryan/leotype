import { motion, AnimatePresence } from 'framer-motion'
import { useTypingStore } from '../store/useTypingStore'
import { getThemeClasses } from '../utils/themes'
import AnimatedNumber from './AnimatedNumber'

function Stats() {
  const testState = useTypingStore((state) => state.testState)
  const settings = useTypingStore((state) => state.settings)
  const themeClasses = getThemeClasses(settings.theme)
  
  if (!testState.stats) {
    return null
  }
  
  const { stats } = testState
  
  const statItems = [
    {
      label: 'WPM',
      value: stats.wpm,
      suffix: '',
      color: themeClasses.primary,
      icon: '⚡',
    },
    {
      label: 'Точность',
      value: stats.accuracy,
      suffix: '%',
      color: stats.accuracy >= 95 ? 'text-green-400' : stats.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400',
      icon: '🎯',
    },
    {
      label: 'Время',
      value: stats.time,
      suffix: 'с',
      color: themeClasses.secondary,
      icon: '⏱️',
    },
    {
      label: 'Символов',
      value: stats.characters.correct + stats.characters.incorrect,
      suffix: '',
      color: themeClasses.secondary,
      icon: '⌨️',
    },
  ]
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: 0.6 }}
        className={`rounded-2xl p-6 ${themeClasses.card} border-2 ${themeClasses.border} shadow-xl`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${themeClasses.primary} text-center`}>
          Результаты
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`text-center p-4 rounded-xl border ${themeClasses.border} ${themeClasses.card} hover:scale-105 transition-transform`}
            >
              <motion.div
                className="text-3xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                {item.icon}
              </motion.div>
              <motion.div
                className={`text-3xl font-bold mb-1 ${item.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1, type: 'spring', stiffness: 200 }}
              >
                <AnimatedNumber value={item.value} decimals={item.suffix === '%' ? 2 : 1} />
                {item.suffix}
              </motion.div>
              <div className={`text-sm ${themeClasses.secondary}`}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-3 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
            <div className={`text-xl font-bold ${themeClasses.primary}`}>
              {stats.characters.correct}
            </div>
            <div className={`text-xs ${themeClasses.secondary}`}>Правильно</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
            <div className={`text-xl font-bold text-red-400`}>
              {stats.characters.incorrect}
            </div>
            <div className={`text-xs ${themeClasses.secondary}`}>Ошибки</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
            <div className={`text-xl font-bold text-yellow-400`}>
              {stats.characters.extra}
            </div>
            <div className={`text-xs ${themeClasses.secondary}`}>Лишние</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${themeClasses.card} border ${themeClasses.border}`}>
            <div className={`text-xl font-bold ${themeClasses.secondary}`}>
              {stats.characters.missed}
            </div>
            <div className={`text-xs ${themeClasses.secondary}`}>Пропущено</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Stats
