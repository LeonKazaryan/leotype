import type { AIDifficulty } from '../../types'
import type { ThemeClasses } from '../../utils/themes'

interface DifficultyRowProps {
  difficulties: AIDifficulty[]
  value: AIDifficulty
  onChange: (difficulty: AIDifficulty) => void
  labels: Record<AIDifficulty, string>
  themeClasses: ThemeClasses
}

function DifficultyRow({ difficulties, value, onChange, labels, themeClasses }: DifficultyRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {difficulties.map((difficulty) => {
        const isActive = difficulty === value

        return (
          <button
            key={difficulty}
            type="button"
            onClick={() => onChange(difficulty)}
            className={`group inline-flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive ? themeClasses.accent : `${themeClasses.secondary} opacity-70 hover:opacity-100`
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full border ${
                isActive
                  ? `border-current bg-current shadow-[0_0_10px_currentColor]`
                  : `${themeClasses.border} bg-transparent`
              }`}
            />
            {labels[difficulty]}
          </button>
        )
      })}
    </div>
  )
}

export default DifficultyRow
