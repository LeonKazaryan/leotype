import { useEffect } from 'react'
import { useTypingStore } from '../store/useTypingStore'
import TypingTest from './TypingTest'
import Settings from './Settings'
import Stats from './Stats'
import Header from './Header'
import Keyboard from './Keyboard'
import Confetti from './Confetti'
import BackgroundEffects from './BackgroundEffects'
import { getThemeClasses } from '../utils/themes'

function App() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  
  useEffect(() => {
    document.body.className = themeClasses.body
  }, [themeClasses])
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} relative`}>
      <BackgroundEffects />
      <Confetti />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Header />
        <div className="mt-8 space-y-6">
          <Settings />
          <TypingTest />
          <Keyboard />
          <Stats />
        </div>
      </div>
    </div>
  )
}

export default App
