import { getNavItems } from '../data/navigation'
import type { Page, User } from '../types'

type TopNavProps = {
  activeUser: User | null
  page: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
}

export function TopNav({ activeUser, page, onNavigate, onLogout }: TopNavProps) {
  const navItems = getNavItems(activeUser?.role)

  return (
    <header className="top-nav">
      <button className="nav-brand" type="button" onClick={() => onNavigate(activeUser ? 'dashboard' : 'login')}>
        <span>TT</span>
        TikTakTuk
      </button>

      <nav className="nav-menu" aria-label="Navigasi utama">
        {navItems.map((item) => (
          <button
            className={page === item.page ? 'active' : ''}
            key={item.page}
            type="button"
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
        {activeUser?.role === 'customer' && (
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
        {activeUser && activeUser.role !== 'customer' && (
          <button type="button" onClick={onLogout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  )
}
