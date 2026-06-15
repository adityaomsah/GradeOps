import { useEffect } from 'react'

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const parts = []
      if (event.ctrlKey || event.metaKey) parts.push('ctrl')
      if (event.shiftKey) parts.push('shift')
      if (event.altKey) parts.push('alt')
      parts.push(event.key.toLowerCase())

      const combo = parts.join('+')
      const action = shortcuts[combo]
      if (action) {
        event.preventDefault()
        action()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}

export function useGotoShortcuts(navigate: (path: string) => void) {
  useEffect(() => {
    let pending: string | null = null
    let timer: number | undefined

    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (pending) {
        const combo = `${pending}+${event.key.toLowerCase()}`
        const routes: Record<string, string> = {
          'g+d': '/dashboard',
          'g+e': '/exams',
          'g+u': '/submissions/upload',
          'g+r': '/results',
        }
        if (routes[combo]) {
          event.preventDefault()
          navigate(routes[combo])
        }
        pending = null
        if (timer) window.clearTimeout(timer)
        return
      }

      if (event.key.toLowerCase() === 'g') {
        pending = 'g'
        timer = window.setTimeout(() => {
          pending = null
        }, 1000)
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (timer) window.clearTimeout(timer)
    }
  }, [navigate])
}
