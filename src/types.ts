export type Role = 'admin' | 'organizer' | 'customer'

export type Page =
  | 'login'
  | 'registerRole'
  | 'registerForm'
  | 'dashboard'
  | 'profile'
  | 'events'
  | 'myEvents'
  | 'venues'
  | 'seats'
  | 'ticketCategories'
  | 'tickets'
  | 'allOrders'
  | 'ticketAssets'
  | 'orderAssets'
  | 'myTickets'
  | 'myOrders'
  | 'promotions'
  | 'artists'
  | 'checkout'

export type User = {
  id: number
  role: Role
  name: string
  email: string
  phone: string
  username: string
  password: string
  contactEmail?: string
}

export type RegisterForm = {
  name: string
  email: string
  phone: string
  username: string
  password: string
  confirmPassword: string
  agree: boolean
}

export type Venue = {
  id: number
  name: string
  city: string
  address: string
  capacity: number
  seatingType: 'Nomor kursi' | 'Festival' | 'Campuran'
}

export type Artist = {
  id: number
  name: string
  genre: string
  country: string
}

export type EventItem = {
  id: number
  organizerId: number
  title: string
  artist: string
  venue: string
  date: string
  time: string
  category: string
  description: string
  price: number
  quota: number
}

export type Seat = {
  id: number
  venue: string
  section: string
  row: string
  number: string
  status: 'Tersedia' | 'Terisi'
}

export type TicketCategory = {
  id: number
  event: string
  name: string
  price: number
  quota: number
}

export type Ticket = {
  id: number
  code: string
  orderCode: string
  category: string
  seatCode: string
  event: string
  customer: string
  status: 'Aktif' | 'Dipakai' | 'Dibatalkan'
}

export type Order = {
  id: number
  code: string
  orderDate: string
  customer: string
  event: string
  ticketCategory: string
  quantity: number
  promoCode: string
  total: number
  status: 'Menunggu' | 'Dibayar' | 'Dibatalkan'
}

export type Promotion = {
  id: number
  code: string
  title: string
  discountType: 'Persentase' | 'Nominal'
  value: string
  startDate: string
  endDate: string
  usageLimit: number
}

export type AppData = {
  venues: Venue[]
  artists: Artist[]
  events: EventItem[]
  seats: Seat[]
  ticketCategories: TicketCategory[]
  tickets: Ticket[]
  orders: Order[]
  promotions: Promotion[]
}

export type Toast = {
  type: 'success' | 'error'
  text: string
}
