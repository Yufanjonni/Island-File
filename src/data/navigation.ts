import type { Page, Role } from '../types'

export type NavItem = {
  label: string
  page: Page
}

const visitorNav: NavItem[] = [
  { label: 'Login', page: 'login' },
  { label: 'Registrasi', page: 'registerRole' },
]

const guestNav: NavItem[] = [
  { label: 'Cari Event', page: 'events' },
  { label: 'Promosi', page: 'promotions' },
  { label: 'Kategori Tiket', page: 'ticketCategories' },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Manajemen Event', page: 'events' },
  { label: 'Manajemen Venue', page: 'venues' },
  { label: 'Manajemen Kursi', page: 'seats' },
  { label: 'Kategori Tiket', page: 'ticketCategories' },
  { label: 'Manajemen Tiket', page: 'tickets' },
  { label: 'Semua Order', page: 'allOrders' },
  { label: 'Tiket (Aset)', page: 'ticketAssets' },
  { label: 'Order (Aset)', page: 'orderAssets' },
  { label: 'Promosi', page: 'promotions' },
  { label: 'Artis', page: 'artists' },
  { label: 'Profile', page: 'profile' },
]

const organizerNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Event Saya', page: 'myEvents' },
  { label: 'Manajemen Venue', page: 'venues' },
  { label: 'Manajemen Kursi', page: 'seats' },
  { label: 'Kategori Tiket', page: 'ticketCategories' },
  { label: 'Manajemen Tiket', page: 'tickets' },
  { label: 'Semua Order', page: 'allOrders' },
  { label: 'Tiket (Aset)', page: 'ticketAssets' },
  { label: 'Order (Aset)', page: 'orderAssets' },
  { label: 'Promosi', page: 'promotions' },
  { label: 'Artis', page: 'artists' },
  { label: 'Profile', page: 'profile' },
]

const customerNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Tiket Saya', page: 'myTickets' },
  { label: 'Pesanan', page: 'myOrders' },
  { label: 'Cari Event', page: 'events' },
  { label: 'Promosi', page: 'promotions' },
  { label: 'Venue', page: 'venues' },
  { label: 'Artis', page: 'artists' },
  { label: 'Profile', page: 'profile' },
]

export function getNavItems(role?: Role | null) {
  if (!role) return visitorNav
  if (role === 'guest') return guestNav
  if (role === 'admin') return adminNav
  if (role === 'organizer') return organizerNav
  return customerNav
}
