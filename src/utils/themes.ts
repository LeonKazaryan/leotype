import { Theme } from '../types'

export function getThemeClasses(theme: Theme) {
  const themes = {
    dark: {
      bg: 'bg-gray-900',
      body: 'bg-gray-900 text-gray-100',
      primary: 'text-primary-400',
      secondary: 'text-gray-400',
      accent: 'text-primary-500',
      accentBg: 'bg-primary-500',
      accentBorder: 'border-primary-500',
      accentRing: 'ring-primary-400/40',
      border: 'border-gray-700',
      card: 'bg-gray-800',
      overlay: 'bg-black/70 backdrop-blur-md',
    },
    light: {
      bg: 'bg-gray-50',
      body: 'bg-gray-50 text-gray-900',
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      accent: 'text-blue-500',
      accentBg: 'bg-blue-500',
      accentBorder: 'border-blue-500',
      accentRing: 'ring-blue-400/40',
      border: 'border-gray-300',
      card: 'bg-white',
      overlay: 'bg-white/70 backdrop-blur-md',
    },
    neon: {
      bg: 'bg-black',
      body: 'bg-black text-cyan-300',
      primary: 'text-cyan-400',
      secondary: 'text-purple-400',
      accent: 'text-pink-500',
      accentBg: 'bg-pink-500',
      accentBorder: 'border-pink-500',
      accentRing: 'ring-pink-500/40',
      border: 'border-cyan-500',
      card: 'bg-gray-950',
      overlay: 'bg-black/80 backdrop-blur-lg',
    },
    ocean: {
      bg: 'bg-slate-900',
      body: 'bg-slate-900 text-teal-100',
      primary: 'text-teal-400',
      secondary: 'text-cyan-400',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-400',
      accentBorder: 'border-blue-400',
      accentRing: 'ring-blue-400/40',
      border: 'border-teal-500',
      card: 'bg-slate-800',
      overlay: 'bg-slate-950/70 backdrop-blur-lg',
    },
    forest: {
      bg: 'bg-green-950',
      body: 'bg-green-950 text-green-100',
      primary: 'text-green-400',
      secondary: 'text-emerald-400',
      accent: 'text-lime-400',
      accentBg: 'bg-lime-400',
      accentBorder: 'border-lime-400',
      accentRing: 'ring-lime-400/40',
      border: 'border-green-500',
      card: 'bg-green-900',
      overlay: 'bg-green-950/75 backdrop-blur-lg',
    },
  }
  
  return themes[theme]
}

export type ThemeClasses = ReturnType<typeof getThemeClasses>
