import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { BookOpen, ClipboardCheck, Search, Upload, User } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { queryKeys } from '@/constants/queryKeys'
import { searchService } from '@/services/searchService'
import { useDebounce } from '@/hooks/useDebounce'
import { recentSearchStorage } from '@/utils/storage'

const iconMap = {
  exam: BookOpen,
  student: User,
  user: User,
  submission: ClipboardCheck,
} as const

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const navigate = useNavigate()
  const recent = recentSearchStorage.get()

  const searchQuery = useQuery({
    queryKey: queryKeys.search(debouncedQuery),
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery('')
    }
    onOpenChange(nextOpen)
  }

  <Dialog open={open} onOpenChange={handleOpenChange}></Dialog>

  const handleSelect = (href: string, label: string) => {
    recentSearchStorage.add(label)
    onOpenChange(false)
    navigate(href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <Command shouldFilter={false} className="rounded-xl border-none">
          <CommandInput placeholder="Search exams, students, users, submissions..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>
              {debouncedQuery.length < 2 ? 'Type at least 2 characters to search' : 'No results found'}
            </CommandEmpty>

            {!query && recent.length ? (
              <CommandGroup heading="Recent searches">
                {recent.map((item) => (
                  <CommandItem key={item} onSelect={() => setQuery(item)}>
                    <Search className="mr-2 h-4 w-4" />
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {searchQuery.data?.length ? (
              <CommandGroup heading="Results">
                {searchQuery.data.map((result) => {
                  const Icon = iconMap[result.type] ?? Upload
                  return (
                    <CommandItem key={result.id} onSelect={() => handleSelect(result.href, result.title)}>
                      <Icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{result.title}</span>
                        {result.subtitle ? <span className="text-xs text-muted-foreground">{result.subtitle}</span> : null}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
