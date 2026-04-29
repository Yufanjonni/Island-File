import { Bell, LogOut, Menu, Ticket, X } from 'lucide-react'
import { getNavItems } from '../data/navigation'
import { Button } from './ui/Button'
import type { Page, User } from '../types'
import { useState } from 'react'

type TopNavProps = {
  activeUser: User | null
  page: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
}

export function TopNav({ activeUser, page, onNavigate, onLogout }: TopNavProps) {
  const navItems = getNavItems(activeUser?.role)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e2e8f0] bg-white">
      <div className="flex h-12 items-center justify-between px-3 md:px-4 max-w-[1400px] mx-auto">
        <Button 
          variant="ghost" 
          className="gap-2 font-semibold text-lg h-auto p-1"
          onClick={() => onNavigate(activeUser ? 'dashboard' : 'login')}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0f172a] text-white">
            <Ticket className="h-3.5 w-3.5" />
          </div>
          <span className="hidden lg:inline text-[#0f0f0f]">TikTakTuk</span>
        </Button>

        {activeUser && (
          <>
            <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto max-w-[calc(100vw-200px)]">
              {navItems.map((item) => (
                <Button
                  key={item.page}
                  variant={page === item.page ? 'secondary' : 'ghost'}
                  size="sm"
                  className="text-xs px-2 py-1 h-8 whitespace-nowrap"
                  onClick={() => onNavigate(item.page)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            
            <div className="flex md:hidden items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 text-xs"
                onClick={onLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          </>
        )}
      </div>

      {menuOpen && activeUser && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-[#e2e8f0]">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-1 p-2">
              {navItems.map((item) => (
                <Button
                  key={item.page}
                  variant={page === item.page ? 'secondary' : 'ghost'}
                  className="justify-start"
                  onClick={() => { onNavigate(item.page); setMenuOpen(false); }}
                >
                  {item.label}
                </Button>
              ))}
              <hr className="my-2" />
              <Button variant="ghost" className="justify-start text-red-600" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}