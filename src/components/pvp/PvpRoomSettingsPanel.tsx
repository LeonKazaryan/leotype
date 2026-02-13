import { useEffect, useRef, useState } from 'react'
import { useTypingStore } from '../../store/useTypingStore'
import { usePvpStore } from '../../store/usePvpStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import { pvpConfig } from '../../config/pvp'

function PvpRoomSettingsPanel() {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()
  const activeRoom = usePvpStore((state) => state.activeRoom)
  const currentUser = usePvpStore((state) => state.currentUser)
  const updateRoomSettings = usePvpStore((state) => state.updateRoomSettings)

  const [pulseKey, setPulseKey] = useState(0)
  const [showPulse, setShowPulse] = useState(false)
  const hasMountedRef = useRef(false)
  const isHost = activeRoom && currentUser ? activeRoom.hostId === currentUser.id : false

  useEffect(() => {
    if (!activeRoom) return
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    setPulseKey((prev) => prev + 1)
    setShowPulse(true)
    const timer = window.setTimeout(() => setShowPulse(false), pvpConfig.ui.settingsPulseMs)
    return () => window.clearTimeout(timer)
  }, [activeRoom, activeRoom?.settings.wordCount, activeRoom?.settings.difficulty, activeRoom?.settings.theme])

  if (!activeRoom) return null

  const settings = activeRoom.settings

  return (
    <div className={`rounded-xl border ${themeClasses.border} ${themeClasses.card} p-4 space-y-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-semibold ${themeClasses.primary}`}>{i18n.pvp.room.settingsTitle}</h3>
          {!isHost && (
            <p className={`text-xs ${themeClasses.secondary}`}>{i18n.pvp.room.settingsHint}</p>
          )}
        </div>
        {!isHost && showPulse && pulseKey > 0 && (
          <span
            key={pulseKey}
            className={`text-[10px] px-2 py-1 rounded-full border ${themeClasses.border} ${themeClasses.accent} animate-pulse`}
          >
            {i18n.pvp.room.settingsUpdated}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className={`block text-xs font-semibold ${themeClasses.secondary}`}>{i18n.pvp.room.wordCount}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {pvpConfig.settings.wordCount.quickOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => isHost && updateRoomSettings({ wordCount: value })}
                disabled={!isHost}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                  settings.wordCount === value
                    ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold ${themeClasses.secondary}`}>{i18n.pvp.room.difficulty}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {pvpConfig.settings.difficultyOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => isHost && updateRoomSettings({ difficulty: option })}
                disabled={!isHost}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                  settings.difficulty === option
                    ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {i18n.pvp.difficulty[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold ${themeClasses.secondary}`}>{i18n.pvp.room.theme}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {pvpConfig.settings.themeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => isHost && updateRoomSettings({ theme: option })}
                disabled={!isHost}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                  settings.theme === option
                    ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {i18n.pvp.theme[option]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PvpRoomSettingsPanel
