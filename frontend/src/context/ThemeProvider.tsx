import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '@/context/ThemeContext'
import { themeStorage, type ThemeMode } from '@/utils/storage'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => themeStorage.get())

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.classList.toggle('dark', media.matches)
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (mode: ThemeMode) => {
    themeStorage.set(mode)
    setThemeState(mode)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
