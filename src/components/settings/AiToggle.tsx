import type { ThemeClasses } from '../../utils/themes'
import { iconSize, iconStroke, menuIcons } from '../../config/menu'

interface AiToggleProps {
  label: string
  placeholder: string
  statusOn: string
  statusOff: string
  topic: string
  onTopicChange: (topic: string) => void
  themeClasses: ThemeClasses
}

function AiToggle({ label, placeholder, statusOn, statusOff, topic, onTopicChange, themeClasses }: AiToggleProps) {
  const AiIcon = menuIcons.ai
  const hasTopic = topic.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AiIcon className={themeClasses.secondary} size={iconSize} strokeWidth={iconStroke} />
          <span className={`text-xs uppercase tracking-[0.2em] ${themeClasses.secondary} opacity-60`}>{label}</span>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
            hasTopic
              ? `${themeClasses.accent} ${themeClasses.accentBorder} shadow-[0_0_10px_currentColor]`
              : `${themeClasses.secondary} ${themeClasses.border} opacity-60`
          }`}
        >
          {hasTopic ? statusOn : statusOff}
        </span>
      </div>

      <div className="pt-1">
        <input
          type="text"
          value={topic}
          onChange={(event) => onTopicChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-3 py-2 text-sm ${
            hasTopic ? `${themeClasses.accentBorder} ring-1 ${themeClasses.accentRing}` : themeClasses.border
          } ${themeClasses.secondary} bg-transparent focus:outline-none focus:${themeClasses.accent} transition-all placeholder:opacity-50`}
        />
      </div>
    </div>
  )
}

export default AiToggle
