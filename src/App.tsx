import { useEffect, useState } from 'react'
import { useTypingStore } from './store/useTypingStore'
import TypingTest from './components/TypingTest'
import Settings from './components/Settings'
import Stats from './components/Stats'
import Header from './components/Header'
import Confetti from './components/Confetti'
import BackgroundEffects from './components/BackgroundEffects'
import RegisterModal from './components/RegisterModal'
import DictionaryUnavailableModal from './components/DictionaryUnavailableModal'
import MemoryGame from './components/memory/MemoryGame'
import PvpAuthModal from './components/pvp/PvpAuthModal'
import PvpOverlay from './components/pvp/PvpOverlay'
import RankedOverlay from './components/ranked/RankedOverlay'
import RankedProfileModal from './components/ranked/RankedProfileModal'
import { AuthUser, clearStoredAuth, getStoredUser } from './utils/auth'
import { getThemeClasses } from './utils/themes'
import { usePvpStore } from './store/usePvpStore'
import { useRankedStore } from './store/useRankedStore'

function App() {
  const theme = useTypingStore((state) => state.settings.theme)
  const mode = useTypingStore((state) => state.settings.mode)
  const showGame = useTypingStore((state) => state.showGame)
  const dictionaryUnavailable = useTypingStore((state) => state.dictionaryUnavailable)
  const setDictionaryUnavailable = useTypingStore((state) => state.setDictionaryUnavailable)
  const goToSettings = useTypingStore((state) => state.goToSettings)
  const themeClasses = getThemeClasses(theme)
  const [isRegisterOpen, setRegisterOpen] = useState(false)
  const [registerInitialMode, setRegisterInitialMode] = useState<'register' | 'login' | undefined>(undefined)
  const [isPvpAuthOpen, setPvpAuthOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const openPvpLobby = usePvpStore((state) => state.openLobby)
  const closePvpLobby = usePvpStore((state) => state.closeLobby)
  const disconnectPvpSocket = usePvpStore((state) => state.disconnectSocket)
  const openRankedOverlay = useRankedStore((state) => state.openOverlay)
  const loadRankedProfile = useRankedStore((state) => state.loadProfile)
  const joinRankedQueue = useRankedStore((state) => state.joinQueue)
  const rankedProfile = useRankedStore((state) => state.profile)
  const profileStatus = useRankedStore((state) => state.profileStatus)
  const profileError = useRankedStore((state) => state.profileError)
  const profileDelta = useRankedStore((state) => state.profileDelta)
  const lastResultDelta = useRankedStore((state) => state.lastResultDelta)

  useEffect(() => {
    document.body.className = themeClasses.body
  }, [themeClasses])

  useEffect(() => {
    setCurrentUser(getStoredUser())
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadRankedProfile()
    }
  }, [currentUser, loadRankedProfile])
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg} relative`}>
      <BackgroundEffects />
      <Confetti />
      <RegisterModal
        open={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        initialMode={registerInitialMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user)
          setRegisterOpen(false)
        }}
      />
      <PvpAuthModal
        open={isPvpAuthOpen}
        onClose={() => setPvpAuthOpen(false)}
        onLogin={() => {
          setPvpAuthOpen(false)
          setRegisterInitialMode('login')
          setRegisterOpen(true)
        }}
        onSignup={() => {
          setPvpAuthOpen(false)
          setRegisterInitialMode('register')
          setRegisterOpen(true)
        }}
      />
      <DictionaryUnavailableModal
        open={dictionaryUnavailable}
        onClose={() => {
          setDictionaryUnavailable(false)
          goToSettings()
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Header
          onOpenRegister={() => {
            setRegisterInitialMode(undefined)
            setRegisterOpen(true)
          }}
          user={currentUser}
          onLogout={() => {
            clearStoredAuth()
            setCurrentUser(null)
            goToSettings()
            closePvpLobby()
            disconnectPvpSocket()
            setProfileOpen(false)
            useRankedStore.setState({
              profile: null,
              profileStatus: 'idle',
              profileError: null,
              profileDelta: undefined,
              lastResultDelta: undefined,
            })
          }}
          onOpenProfile={() => {
            if (!currentUser) return
            loadRankedProfile()
            setProfileOpen(true)
          }}
        />
        <div className="mt-8 space-y-6">
          {!showGame ? (
            <Settings
              isAuthenticated={!!currentUser}
              onRequireAuth={() => {
                setRegisterInitialMode('login')
                setRegisterOpen(true)
              }}
              onOpenPvp={() => {
                if (!currentUser) return
                openPvpLobby(currentUser)
              }}
              onOpenRanked={() => {
                if (!currentUser) return
                openRankedOverlay(currentUser)
                joinRankedQueue({ language: useTypingStore.getState().settings.language })
              }}
              onRequirePvpAuth={() => {
                setPvpAuthOpen(true)
              }}
            />
          ) : (
            <>
              {mode === 'memory' ? (
                <MemoryGame />
              ) : (
                <>
                  <TypingTest />
                  <Stats />
                </>
              )}
            </>
          )}
        </div>
      </div>
      <PvpOverlay onCloseLobby={closePvpLobby} />
      <RankedOverlay />
      <RankedProfileModal
        open={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        onRetry={loadRankedProfile}
        onLogout={() => {
          clearStoredAuth()
          setCurrentUser(null)
          setProfileOpen(false)
          closePvpLobby()
          disconnectPvpSocket()
          goToSettings()
          useRankedStore.setState({
            profile: null,
            profileStatus: 'idle',
            profileError: null,
            profileDelta: undefined,
            lastResultDelta: undefined,
          })
        }}
        profile={rankedProfile}
        status={profileStatus}
        error={profileError}
        profileDelta={profileDelta}
        lastResultDelta={lastResultDelta}
        themeClasses={themeClasses}
        user={currentUser}
      />
    </div>
  )
}

export default App
