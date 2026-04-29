import { useMemo, useState } from 'react'
import { Percent, Plus, Search, TicketCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { StatCards } from '../components/StatCards'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table'
import type { ReactNode } from 'react'
import type { AppData, Artist, EventItem, Order, Page, Promotion, Role, Seat, Ticket, TicketCategory, User, Venue } from '../types'
import { formatCurrency } from '../utils/format'
import { getSeatCode } from '../utils/resourceDrafts'

type ResourceKind = keyof AppData

type FeaturePageProps = {
  page: Page
  data: AppData
  user: User
  onAdd: (kind: ResourceKind) => void
  onUpdate: (kind: ResourceKind, id: number) => void
  onDelete: (kind: ResourceKind, id: number) => void
  onCheckout: (event: EventItem) => void
}

export function FeaturePage({ page, data, user, onAdd, onUpdate, onDelete, onCheckout }: FeaturePageProps) {
  if (page === 'events' || page === 'myEvents') {
    return (
      <EventCatalog
        events={page === 'myEvents' ? data.events.filter((event) => event.organizerId === user.id) : data.events}
        role={user.role}
        title={page === 'myEvents' ? 'Event Saya' : user.role === 'customer' ? 'Cari Event' : 'Manajemen Event'}
        canManage={user.role !== 'customer'}
        onAdd={() => onAdd('events')}
        onUpdate={(id) => onUpdate('events', id)}
        onDelete={(id) => onDelete('events', id)}
        onCheckout={onCheckout}
      />
    )
  }

  if (page === 'venues') {
    return (
      <VenuePage
        venues={data.venues}
        canManage={user.role !== 'customer'}
        onAdd={() => onAdd('venues')}
        onUpdate={(id) => onUpdate('venues', id)}
        onDelete={(id) => onDelete('venues', id)}
      />
    )
  }

  if (page === 'artists') {
    return (
      <TablePage
        title="Artis"
        description="Kelola data artis"
        data={[...data.artists].sort((a, b) => a.name.localeCompare(b.name))}
        columns={artistColumns}
        canCreate={user.role === 'admin'}
        canEdit={user.role === 'admin'}
        onAdd={() => onAdd('artists')}
        onUpdate={(item) => onUpdate('artists', item.id)}
        onDelete={(item) => onDelete('artists', item.id)}
      />
    )
  }

  if (page === 'seats') {
    return (
      <TablePage
        title="Manajemen Kursi"
        description="Kelola kursi venue"
        data={data.seats}
        columns={seatColumns}
        canCreate={user.role !== 'customer'}
        canEdit={user.role !== 'customer'}
        onAdd={() => onAdd('seats')}
        onUpdate={(item) => onUpdate('seats', item.id)}
        onDelete={(item) => onDelete('seats', item.id)}
        stats={[
          { label: 'Total', value: String(data.seats.length) },
          { label: 'Tersedia', value: String(data.seats.filter((seat) => seat.status === 'Tersedia').length) },
          { label: 'Terisi', value: String(data.seats.filter((seat) => seat.status === 'Terisi').length) },
        ]}
      />
    )
  }

  if (page === 'ticketCategories') {
    return (
      <TablePage
        title="Kategori Tiket"
        description="Kelola kategori dan harga tiket"
        data={[...data.ticketCategories].sort((a, b) => `${a.event}${a.name}`.localeCompare(`${b.event}${b.name}`))}
        columns={ticketCategoryColumns}
        canCreate={user.role !== 'customer'}
        canEdit={user.role !== 'customer'}
        onAdd={() => onAdd('ticketCategories')}
        onUpdate={(item) => onUpdate('ticketCategories', item.id)}
        onDelete={(item) => onDelete('ticketCategories', item.id)}
      />
    )
  }

  if (page === 'tickets' || page === 'ticketAssets' || page === 'myTickets') {
    const tickets = page === 'myTickets' ? data.tickets.filter((ticket) => ticket.customer === user.name) : data.tickets
    return (
      <TablePage
        title={page === 'myTickets' ? 'Tiket Saya' : page === 'ticketAssets' ? 'Tiket (Aset)' : 'Manajemen Tiket'}
        description="Kelola data tiket"
        data={tickets}
        columns={ticketColumns}
        canCreate={user.role !== 'customer'}
        canEdit={user.role === 'admin'}
        onAdd={() => onAdd('tickets')}
        onUpdate={(item) => onUpdate('tickets', item.id)}
        onDelete={(item) => onDelete('tickets', item.id)}
        statusOptions={['Aktif', 'Dipakai', 'Dibatalkan']}
        getStatus={(item) => item.status}
      />
    )
  }

  if (page === 'allOrders' || page === 'orderAssets' || page === 'myOrders') {
    const organizerEvents = data.events.filter((event) => event.organizerId === user.id).map((event) => event.title)
    const orders =
      page === 'myOrders'
        ? data.orders.filter((order) => order.customer === user.name)
        : user.role === 'organizer'
          ? data.orders.filter((order) => organizerEvents.includes(order.event))
          : data.orders
    return (
      <TablePage
        title={page === 'myOrders' ? 'Pesanan' : page === 'orderAssets' ? 'Order (Aset)' : 'Semua Order'}
        description="Kelola pesanan tiket"
        data={[...orders].sort((a, b) => b.id - a.id)}
        columns={orderColumns}
        canCreate={false}
        canEdit={user.role === 'admin'}
        onAdd={() => onAdd('orders')}
        onUpdate={(item) => onUpdate('orders', item.id)}
        onDelete={(item) => onDelete('orders', item.id)}
        statusOptions={['Menunggu', 'Dibayar', 'Dibatalkan']}
        getStatus={(item) => item.status}
        stats={[
          { label: 'Total Order', value: String(orders.length) },
          { label: 'Pending', value: String(orders.filter((order) => order.status === 'Menunggu').length) },
          { label: 'Dibayar', value: String(orders.filter((order) => order.status === 'Dibayar').length) },
          ...(user.role !== 'customer'
            ? [{ label: 'Revenue', value: formatCurrency(orders.reduce((total, order) => total + order.total, 0)) }]
            : []),
        ]}
      />
    )
  }

  return (
    <PromotionPage
      promotions={data.promotions}
      isAdmin={user.role === 'admin'}
      orders={data.orders}
      onAdd={() => onAdd('promotions')}
      onUpdate={(item) => onUpdate('promotions', item.id)}
      onDelete={(item) => onDelete('promotions', item.id)}
    />
  )
}

function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

type EventCatalogProps = {
  events: EventItem[]
  role: Role
  title: string
  canManage: boolean
  onAdd: () => void
  onUpdate: (id: number) => void
  onDelete: (id: number) => void
  onCheckout: (event: EventItem) => void
}

function EventCatalog({ events, role, title, canManage, onAdd, onUpdate, onDelete, onCheckout }: EventCatalogProps) {
  const [query, setQuery] = useState('')
  const [venue, setVenue] = useState('all')
  const [artist, setArtist] = useState('all')
  const venues = Array.from(new Set(events.map((event) => event.venue)))
  const artists = Array.from(new Set(events.map((event) => event.artist)))
  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesQuery = `${event.title} ${event.artist}`.toLowerCase().includes(query.toLowerCase())
        const matchesVenue = venue === 'all' || event.venue === venue
        const matchesArtist = artist === 'all' || event.artist === artist
        return matchesQuery && matchesVenue && matchesArtist
      }),
    [artist, events, query, venue],
  )

  return (
    <div>
      <PageHeader
        title={title}
        action={
          canManage && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Buat Acara
            </Button>
          )
        }
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul atau artis"
            className="pl-9"
          />
        </div>
        <Select value={venue} onValueChange={setVenue}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua venue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua venue</SelectItem>
            {venues.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={artist} onValueChange={setArtist}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua artis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua artis</SelectItem>
            {artists.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">{event.artist}</p>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Venue</span>
                <span className="font-medium">{event.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Tanggal</span>
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Waktu</span>
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Kategori</span>
                <span className="font-medium">{event.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Harga</span>
                <span className="font-semibold text-[var(--primary)]">{formatCurrency(event.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Kuota</span>
                <span className="font-medium">{event.quota} tiket</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] pt-2 border-t">{event.description}</p>
              <div className="flex gap-2 pt-2">
                {role === 'customer' && (
                  <Button size="sm" className="flex-1" onClick={() => onCheckout(event)}>
                    Beli Tiket
                  </Button>
                )}
                {canManage && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onUpdate(event.id)}>
                      Update
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

type VenuePageProps = {
  venues: Venue[]
  canManage: boolean
  onAdd: () => void
  onUpdate: (id: number) => void
  onDelete: (id: number) => void
}

function VenuePage({ venues, canManage, onAdd, onUpdate, onDelete }: VenuePageProps) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('all')
  const [reserved, setReserved] = useState('all')
  const cities = Array.from(new Set(venues.map((venue) => venue.city)))
  const filteredVenues = venues.filter((venue) => {
    const matchesQuery = `${venue.name} ${venue.address}`.toLowerCase().includes(query.toLowerCase())
    const matchesCity = city === 'all' || venue.city === city
    const matchesReserved =
      reserved === 'all' ||
      (reserved === 'reserved' && venueHasReservedSeating(venue)) ||
      (reserved === 'non-reserved' && !venueHasReservedSeating(venue))
    return matchesQuery && matchesCity && matchesReserved
  })

  return (
    <div>
      <PageHeader
        title={canManage ? 'Manajemen Venue' : 'Venue'}
        action={
          canManage && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Venue
            </Button>
          )
        }
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau alamat"
            className="pl-9"
          />
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua kota" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kota</SelectItem>
            {cities.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={reserved} onValueChange={setReserved}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Reserved seating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua seating</SelectItem>
            <SelectItem value="reserved">Has Reserved Seating</SelectItem>
            <SelectItem value="non-reserved">Tanpa Reserved Seating</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVenues.map((venue) => (
          <Card key={venue.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{venue.name}</CardTitle>
              <p className="text-sm text-[var(--muted-foreground)]">{venue.address}</p>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Kota</span>
                <span className="font-medium">{venue.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Kapasitas</span>
                <span className="font-medium">{venue.capacity} orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Reserved Seating</span>
                <span className="font-medium">{venueHasReservedSeating(venue) ? 'Ya' : 'Tidak'}</span>
              </div>
              {canManage && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => onUpdate(venue.id)}>
                    Update
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(venue.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

type TablePageProps<T extends { id: number }> = {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  canCreate: boolean
  canEdit: boolean
  onAdd: () => void
  onUpdate: (item: T) => void
  onDelete: (item: T) => void
  stats?: Array<{ label: string; value: string }>
  statusOptions?: string[]
  getStatus?: (item: T) => string
}

function TablePage<T extends { id: number }>({
  title,
  description,
  data,
  columns,
  canCreate,
  canEdit,
  onAdd,
  onUpdate,
  onDelete,
  stats,
  statusOptions,
  getStatus,
}: TablePageProps<T>) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const filteredData = data.filter((item) => {
    const matchesQuery = JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'all' || getStatus?.(item) === status
    return matchesQuery && matchesStatus
  })

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          canCreate && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah Data
            </Button>
          )
        }
      />
      {stats && (
        <div className="mb-6">
          <StatCards stats={stats} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari data"
            className="pl-9"
          />
        </div>
        {statusOptions && (
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {canEdit && <TableHead className="w-[150px]">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(item)}</TableCell>
                ))}
                {canEdit && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onUpdate(item)}>
                        Update
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!filteredData.length && (
              <TableRow>
                <TableCell colSpan={columns.length + (canEdit ? 1 : 0)} className="text-center text-[var(--muted-foreground)]">
                  Data tidak ditemukan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

type Column<T> = {
  key: string
  label: string
  render: (item: T) => ReactNode
}

const artistColumns: Column<Artist>[] = [
  { key: 'id', label: 'ID', render: (artist) => `ART-${artist.id}` },
  { key: 'name', label: 'Nama', render: (artist) => artist.name },
  { key: 'genre', label: 'Genre', render: (artist) => artist.genre },
  { key: 'country', label: 'Negara', render: (artist) => artist.country },
]

const seatColumns: Column<Seat>[] = [
  { key: 'venue', label: 'Venue', render: (seat) => seat.venue },
  { key: 'section', label: 'Section', render: (seat) => seat.section },
  { key: 'row', label: 'Row', render: (seat) => seat.row },
  { key: 'number', label: 'No Kursi', render: (seat) => seat.number },
  { key: 'code', label: 'Kode', render: (seat) => getSeatCode(seat) },
  { key: 'status', label: 'Status', render: (seat) => <StatusBadge value={seat.status} /> },
]

const ticketCategoryColumns: Column<TicketCategory>[] = [
  { key: 'id', label: 'ID', render: (category) => `CAT-${category.id}` },
  { key: 'event', label: 'Event', render: (category) => category.event },
  { key: 'name', label: 'Kategori', render: (category) => category.name },
  { key: 'price', label: 'Harga', render: (category) => formatCurrency(category.price) },
  { key: 'quota', label: 'Kuota', render: (category) => category.quota },
]

const ticketColumns: Column<Ticket>[] = [
  { key: 'code', label: 'Kode', render: (ticket) => ticket.code },
  { key: 'orderCode', label: 'Order', render: (ticket) => ticket.orderCode },
  { key: 'event', label: 'Event', render: (ticket) => ticket.event },
  { key: 'category', label: 'Kategori', render: (ticket) => ticket.category },
  { key: 'seatCode', label: 'Kursi', render: (ticket) => ticket.seatCode },
  { key: 'customer', label: 'Customer', render: (ticket) => ticket.customer },
  { key: 'status', label: 'Status', render: (ticket) => <StatusBadge value={ticket.status} /> },
]

const orderColumns: Column<Order>[] = [
  { key: 'code', label: 'Kode', render: (order) => order.code },
  { key: 'orderDate', label: 'Tanggal', render: (order) => order.orderDate },
  { key: 'customer', label: 'Customer', render: (order) => order.customer },
  { key: 'event', label: 'Event', render: (order) => order.event },
  { key: 'ticketCategory', label: 'Kategori', render: (order) => order.ticketCategory },
  { key: 'quantity', label: 'Jumlah', render: (order) => order.quantity },
  { key: 'promoCode', label: 'Promo', render: (order) => order.promoCode },
  { key: 'total', label: 'Total', render: (order) => formatCurrency(order.total) },
  { key: 'status', label: 'Status', render: (order) => <StatusBadge value={order.status} /> },
]

const promotionColumns: Column<Promotion>[] = [
  { key: 'id', label: 'Promotion ID', render: (promotion) => `PROMO-${promotion.id}` },
  { key: 'code', label: 'Promo Code', render: (promotion) => promotion.code },
  { key: 'discountType', label: 'Discount Type', render: (promotion) => promotion.discountType },
  { key: 'value', label: 'Discount Value', render: (promotion) => promotion.value },
  { key: 'startDate', label: 'Start Date', render: (promotion) => promotion.startDate },
  { key: 'endDate', label: 'End Date', render: (promotion) => promotion.endDate },
]

function PromotionPage({
  promotions,
  isAdmin,
  orders,
  onAdd,
  onUpdate,
  onDelete,
}: {
  promotions: Promotion[]
  isAdmin: boolean
  orders: Order[]
  onAdd: () => void
  onUpdate: (item: Promotion) => void
  onDelete: (item: Promotion) => void
}) {
  const [discountType, setDiscountType] = useState('all')
  const [query, setQuery] = useState('')
  const getUsedCount = (code: string) => orders.filter((order) => order.promoCode === code).length
  const totalUsage = promotions.reduce((total, promotion) => total + getUsedCount(promotion.code), 0)
  const percentageCount = promotions.filter((promotion) => promotion.discountType === 'Persentase').length
  const data = promotions.filter((promotion) => {
    const matchesType = discountType === 'all' || promotion.discountType === discountType
    const matchesQuery = promotion.code.toLowerCase().includes(query.trim().toLowerCase())
    return matchesType && matchesQuery
  })

  return (
    <div>
      <PageHeader
        title="Promosi"
        action={
          isAdmin && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Buat Promo
            </Button>
          )
        }
      />
      <StatCards
        stats={[
          {
            label: 'Total Promo',
            value: String(promotions.length),
            icon: <Percent className="h-5 w-5" />,
            accentClassName: 'bg-[#2563eb]',
          },
          {
            label: 'Total Penggunaan',
            value: String(totalUsage),
            description: 'Semua kode promo',
            icon: <TicketCheck className="h-5 w-5" />,
            accentClassName: 'bg-[#16a34a]',
          },
          {
            label: 'Tipe Persentase',
            value: String(percentageCount),
            description: `${promotions.length - percentageCount} nominal`,
            icon: <Percent className="h-5 w-5" />,
            accentClassName: 'bg-[#7c3aed]',
          },
        ]}
      />
      <div className="my-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari kode promo"
            className="pl-9"
          />
        </div>
        <Select value={discountType} onValueChange={setDiscountType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Semua tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="Persentase">Persentase</SelectItem>
            <SelectItem value="Nominal">Nominal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {promotionColumns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead>Penggunaan</TableHead>
              {isAdmin && <TableHead className="w-[150px]">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {promotionColumns.map((column) => (
                  <TableCell key={column.key}>{column.render(item)}</TableCell>
                ))}
                <TableCell>
                  {getUsedCount(item.code)} / {item.usageLimit}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onUpdate(item)}>
                        Update
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function StatusBadge({ value }: { value: string }) {
  const variant = value === 'Aktif' || value === 'Dibayar' || value === 'Tersedia' ? 'success' 
    : value === 'Menunggu' || value === 'Dipakai' ? 'warning' 
    : 'destructive'
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${variant === 'success' ? 'bg-[var(--success-light)] text-[var(--success)]' : ''}
      ${variant === 'warning' ? 'bg-[var(--warning-light)] text-[var(--warning)]' : ''}
      ${variant === 'destructive' ? 'bg-[var(--destructive-light)] text-[var(--destructive)]' : ''}
    `}>
      {value}
    </span>
  )
}

function venueHasReservedSeating(venue: Venue) {
  if ('hasReservedSeating' in venue) return venue.hasReservedSeating
  const legacyVenue = venue as Venue & { seatingType?: string }
  return legacyVenue.seatingType !== 'Festival'
}
