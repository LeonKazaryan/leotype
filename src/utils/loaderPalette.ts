import { Theme } from '../types'

type LoaderPalette = {
  bgFrom: string
  bgTo: string
  node: string
  line: string
  accent: string
  glow: string
}

const palettes: Record<Theme, LoaderPalette> = {
  dark: {
    bgFrom: 'rgba(14, 165, 233, 0.10)',
    bgTo: 'rgba(14, 165, 233, 0.02)',
    node: 'rgba(14, 165, 233, 0.35)',
    line: 'rgba(14, 165, 233, 0.20)',
    accent: '#38bdf8',
    glow: '0 0 25px rgba(14, 165, 233, 0.35)',
  },
  light: {
    bgFrom: 'rgba(37, 99, 235, 0.10)',
    bgTo: 'rgba(37, 99, 235, 0.03)',
    node: 'rgba(37, 99, 235, 0.30)',
    line: 'rgba(37, 99, 235, 0.18)',
    accent: '#2563eb',
    glow: '0 0 25px rgba(37, 99, 235, 0.30)',
  },
  neon: {
    bgFrom: 'rgba(236, 72, 153, 0.18)',
    bgTo: 'rgba(34, 211, 238, 0.08)',
    node: 'rgba(34, 211, 238, 0.45)',
    line: 'rgba(236, 72, 153, 0.28)',
    accent: '#ec4899',
    glow: '0 0 30px rgba(236, 72, 153, 0.45)',
  },
  ocean: {
    bgFrom: 'rgba(45, 212, 191, 0.15)',
    bgTo: 'rgba(59, 130, 246, 0.06)',
    node: 'rgba(34, 211, 238, 0.35)',
    line: 'rgba(59, 130, 246, 0.22)',
    accent: '#22d3ee',
    glow: '0 0 28px rgba(34, 211, 238, 0.40)',
  },
  forest: {
    bgFrom: 'rgba(132, 204, 22, 0.16)',
    bgTo: 'rgba(16, 185, 129, 0.08)',
    node: 'rgba(74, 222, 128, 0.35)',
    line: 'rgba(190, 242, 100, 0.26)',
    accent: '#84cc16',
    glow: '0 0 26px rgba(132, 204, 22, 0.40)',
  },
}

export function getLoaderPalette(theme: Theme): LoaderPalette {
  return palettes[theme] ?? palettes.dark
}

export type { LoaderPalette }
