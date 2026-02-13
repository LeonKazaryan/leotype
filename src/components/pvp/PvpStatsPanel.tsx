import { useTypingStore } from '../../store/useTypingStore'
import { getThemeClasses } from '../../utils/themes'
import { useI18n } from '../../hooks/useI18n'

interface PvpStatsPanelProps {
  wpm: number
  accuracy: number
  errors: number
}

function PvpStatsPanel({ wpm, accuracy, errors }: PvpStatsPanelProps) {
  const theme = useTypingStore((state) => state.settings.theme)
  const themeClasses = getThemeClasses(theme)
  const i18n = useI18n()

  return (
    <div className={`rounded-2xl border ${themeClasses.border} ${themeClasses.card} p-4 space-y-3`}>
      <div className="flex items-center justify-between text-sm">
        <span className={themeClasses.secondary}>{i18n.pvp.match.stats.wpm}</span>
        <span className={`font-semibold ${themeClasses.primary}`}>{wpm}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={themeClasses.secondary}>{i18n.pvp.match.stats.accuracy}</span>
        <span className={`font-semibold ${themeClasses.primary}`}>{accuracy}%</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={themeClasses.secondary}>{i18n.pvp.match.stats.errors}</span>
        <span className={`font-semibold ${themeClasses.primary}`}>{errors}</span>
      </div>
    </div>
  )
}

export default PvpStatsPanel
