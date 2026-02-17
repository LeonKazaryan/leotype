import type { LucideIcon } from 'lucide-react'
import {
  Brain,
  Cpu,
  Settings2,
  Sparkles,
  Swords,
  Target,
  TextQuote,
  Timer,
  Type,
} from 'lucide-react'
import type { TestMode } from '../types'

export const modeIcons: Record<TestMode, LucideIcon> = {
  time: Timer,
  words: Type,
  quote: TextQuote,
  memory: Brain,
}

export const menuIcons = {
  pvp: Swords,
  ai: Sparkles,
  aiAlt: Cpu,
  difficulty: Target,
  settings: Settings2,
} satisfies Record<string, LucideIcon>

export const iconSize = 18

export const iconStroke = 1.5
