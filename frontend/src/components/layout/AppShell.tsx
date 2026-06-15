import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from '@/components/common/CommandPalette'
import { useGotoShortcuts, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useKeyboardShortcuts({
    'ctrl+k': () => setSearchOpen(true),
  })

  useGotoShortcuts(navigate)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
