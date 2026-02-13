import { AnimatePresence, motion } from 'framer-motion'
import { usePvpStore } from '../../store/usePvpStore'
import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import { pvpConfig } from '../../config/pvp'
import PvpLobbyJoinTab from './PvpLobbyJoinTab'
import PvpLobbyCreateTab from './PvpLobbyCreateTab'
import PvpRoomView from './PvpRoomView'

interface PvpLobbyDrawerProps {
  open: boolean
  onClose: () => void
}

function PvpLobbyDrawer({ open, onClose }: PvpLobbyDrawerProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  const phase = usePvpStore((state) => state.phase)
  const lobbyTab = usePvpStore((state) => state.lobbyTab)
  const setLobbyTab = usePvpStore((state) => state.setLobbyTab)
  const joinCode = usePvpStore((state) => state.joinCode)
  const setJoinCode = usePvpStore((state) => state.setJoinCode)
  const joinRoom = usePvpStore((state) => state.joinRoom)
  const createForm = usePvpStore((state) => state.createForm)
  const setCreateForm = usePvpStore((state) => state.setCreateForm)
  const createRoom = usePvpStore((state) => state.createRoom)
  const publicRooms = usePvpStore((state) => state.publicRooms)
  const isLoadingRooms = usePvpStore((state) => state.isLoadingRooms)
  const roomsError = usePvpStore((state) => state.roomsError)

  const showRoom = phase === 'room'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className={`relative w-full max-w-xl ${pvpConfig.ui.lobbyDrawerHeightClass} rounded-3xl border ${themeClasses.border} ${themeClasses.card} shadow-2xl overflow-hidden pvp-grain`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className={`text-xl font-semibold ${themeClasses.primary}`}>
                  {showRoom ? i18n.pvp.room.title : i18n.pvp.lobby.title}
                </h2>
                <p className={`text-xs ${themeClasses.secondary}`}>
                  {showRoom ? i18n.pvp.room.subtitle : i18n.pvp.lobby.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={i18n.common.close}
                className={`text-lg ${themeClasses.secondary} hover:${themeClasses.primary} transition-colors`}
              >
                ✕
              </button>
            </div>

            {!showRoom && (
              <div className="px-6 pt-4">
                <div className="flex gap-2">
                  {(['join', 'create'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setLobbyTab(tab)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                        lobbyTab === tab
                          ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                          : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                      }`}
                    >
                      {tab === 'join' ? i18n.pvp.lobby.tabs.join : i18n.pvp.lobby.tabs.create}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-5 overflow-y-auto h-full">
              {showRoom ? (
                <PvpRoomView />
              ) : lobbyTab === 'join' ? (
                <PvpLobbyJoinTab
                  joinCode={joinCode}
                  onJoinCodeChange={setJoinCode}
                  onJoin={joinRoom}
                  rooms={publicRooms}
                  isLoading={isLoadingRooms}
                  errorCode={roomsError}
                />
              ) : (
                <PvpLobbyCreateTab
                  maxPlayers={createForm.maxPlayers}
                  privacy={createForm.privacy}
                  roomName={createForm.roomName}
                  onFieldChange={setCreateForm}
                  onCreate={createRoom}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PvpLobbyDrawer
