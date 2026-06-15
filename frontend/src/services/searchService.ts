import { api } from './api'
import type { SearchResult } from '@/types/api'

export const searchService = {
  async search(query: string) {
    const { data } = await api.get<SearchResult[]>('/search', {
      params: { q: query },
    })
    return data
  },
}