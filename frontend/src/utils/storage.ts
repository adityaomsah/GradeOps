const ACCESS_TOKEN_KEY = 'gradeops_access_token'
const REFRESH_TOKEN_KEY = 'gradeops_refresh_token'
const REMEMBER_KEY = 'gradeops_remember_me'

function getStorage(persistent: boolean) {
  return persistent ? localStorage : sessionStorage
}

export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },
  setTokens(accessToken: string, refreshToken: string, remember = true) {
    this.clear(false)
    const storage = getStorage(remember)
    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(REMEMBER_KEY, String(remember))
  },
  setAccessToken(token: string) {
    const remember = localStorage.getItem(REMEMBER_KEY) !== 'false'
    getStorage(remember).setItem(ACCESS_TOKEN_KEY, token)
  },
  setRefreshToken(token: string) {
    const remember = localStorage.getItem(REMEMBER_KEY) !== 'false'
    getStorage(remember).setItem(REFRESH_TOKEN_KEY, token)
  },
  clear(clearFlag = true) {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    if (clearFlag) localStorage.removeItem(REMEMBER_KEY)
  },
}

const THEME_KEY = 'gradeops_theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export const themeStorage = {
  get(): ThemeMode {
    const value = localStorage.getItem(THEME_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
    return 'system'
  },
  set(mode: ThemeMode) {
    localStorage.setItem(THEME_KEY, mode)
  },
}

const RECENT_SEARCHES_KEY = 'gradeops_recent_searches'

export const recentSearchStorage = {
  get(): string[] {
    try {
      return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  },
  add(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return
    const next = [trimmed, ...this.get().filter((item) => item !== trimmed)].slice(0, 8)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  },
}
