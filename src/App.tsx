import { useEffect, useState } from 'react'
import { useTypingStore } from './store/useTypingStore'
import TypingTest from './components/TypingTest'
import Settings from './components/Settings'
import Stats from './components/Stats'
import Header from './components/Header'
import Keyboard from './components/Keyboard'
import Confetti from './components/Confetti'
import BackgroundEffects from './components/BackgroundEffects'
import RegisterModal from './components/RegisterModal'
import { AuthUser, clearStoredAuth, getStoredUser } from './utils/auth'
import { getThemeClasses } from './utils/themes'

function App() {
  const theme = useTypingStore((state) => state.settings.theme)
  const showGame = useTypingStore((state) => state.showGame)
  const themeClasses = getThemeClasses(theme)
  const [isRegisterOpen, setRegisterOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  
  useEffect(() => {
    document.body.className = themeClasses.body
  }, [themeClasses])

  useEffect(() => {
    setCurrentUser(getStoredUser())
  }, [])
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} relative`}>
      <BackgroundEffects />
      <Confetti />
      <RegisterModal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user)
          setRegisterOpen(false)
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Header
          onOpenRegister={() => setRegisterOpen(true)}
          user={currentUser}
          onLogout={() => {
            clearStoredAuth()
            setCurrentUser(null)
          }}
        />
        <div className="mt-8 space-y-6">
          {!showGame ? (
            <Settings />
          ) : (
            <>
              <TypingTest />
              <Keyboard />
              <Stats />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
