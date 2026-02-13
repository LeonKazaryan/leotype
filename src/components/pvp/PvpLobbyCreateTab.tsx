import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'
import { pvpConfig } from '../../config/pvp'

interface PvpLobbyCreateTabProps {
  maxPlayers: number
  privacy: 'public' | 'private'
  roomName: string
  onFieldChange: (field: 'maxPlayers' | 'privacy' | 'roomName', value: string | number) => void
  onCreate: () => void
}

function PvpLobbyCreateTab({ maxPlayers, privacy, roomName, onFieldChange, onCreate }: PvpLobbyCreateTabProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.pvp.lobby.maxPlayers}</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: pvpConfig.room.maxPlayers - pvpConfig.room.minPlayers + 1 }).map((_, index) => {
            const value = pvpConfig.room.minPlayers + index
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFieldChange('maxPlayers', value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                  maxPlayers === value
                    ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                    : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.pvp.lobby.privacy}</label>
        <div className="flex gap-2">
          {pvpConfig.settings.privacyOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onFieldChange('privacy', option)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                privacy === option
                  ? `${themeClasses.accent} bg-opacity-20 ${themeClasses.border}`
                  : `${themeClasses.secondary} border-transparent hover:${themeClasses.border}`
              }`}
            >
              {i18n.pvp.lobby.privacyOptions[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-semibold ${themeClasses.secondary}`}>{i18n.pvp.lobby.roomName}</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => onFieldChange('roomName', e.target.value)}
          placeholder={i18n.pvp.lobby.roomNamePlaceholder}
          maxLength={pvpConfig.room.nameMaxLength}
          className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.card} border-2 ${themeClasses.border} ${themeClasses.secondary} bg-transparent focus:outline-none focus:${themeClasses.accent}`}
        />
      </div>

      <button
        type="button"
        onClick={onCreate}
        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${themeClasses.border} ${themeClasses.accent}`}
      >
        {i18n.pvp.lobby.createButton}
      </button>
    </div>
  )
}

export default PvpLobbyCreateTab
