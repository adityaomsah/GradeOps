import { createContext, useContext } from 'react'
import type { ThemeMode } from '@/utils/storage'

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
