import type { Page, Role } from '../types'

export type NavItem = {
  label: string
  page: Page
}

const guestNav: NavItem[] = [
  { label: 'Login', page: 'login' },
  { label: 'Registrasi', page: 'registerRole' },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard' },
  { label: 'Manajemen Venue', page: 'venues' },
  { label: 'Manajemen Kursi', page: 'seats' },
  { label: 'Kategori Tiket', page: 'ticketCategories' },
  { label: 'Manajemen Tiket', page: 'tickets' },
  { label: 'Semua Order', page: 'allOrders' },
  { label: 'Tiket (Aset)', page: 'ticketAssets' },
  { label: 'Order (Aset)', page: 'orderAssets' },
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
]

export function getNavItems(role?: Role | null) {
  if (!role) return guestNav
  if (role === 'admin') return adminNav
  if (role === 'organizer') return organizerNav
  return customerNav
}
