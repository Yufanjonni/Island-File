import { useMemo, useState } from 'react'
import { DataTable, type Column } from '../components/DataTable'
import { PageHeader } from '../components/PageHeader'
import type {
  AppData,
  Artist,
  EventItem,
  Order,
  Page,
  Promotion,
  Role,
  Seat,
  Ticket,
  TicketCategory,
  User,
  Venue,
} from '../types'
import { formatCurrency } from '../utils/format'

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
        title={page === 'myEvents' ? 'Event Saya' : 'Cari Event'}
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
        data={[...data.artists].sort((a, b) => a.name.localeCompare(b.name))}
        columns={artistColumns}
        canManage={user.role === 'admin'}
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
        data={data.seats}
        columns={seatColumns}
        canManage={user.role !== 'customer'}
        onAdd={() => onAdd('seats')}
        onUpdate={(item) => onUpdate('seats', item.id)}
        onDelete={(item) => onDelete('seats', item.id)}
        stats={[
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
        data={data.ticketCategories}
        columns={ticketCategoryColumns}
        canManage={user.role !== 'customer'}
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
        data={tickets}
        columns={ticketColumns}
        canManage={user.role !== 'customer'}
        onAdd={() => onAdd('tickets')}
        onUpdate={(item) => onUpdate('tickets', item.id)}
        onDelete={(item) => onDelete('tickets', item.id)}
      />
    )
  }

  if (page === 'allOrders' || page === 'orderAssets' || page === 'myOrders') {
    const orders = page === 'myOrders' ? data.orders.filter((order) => order.customer === user.name) : data.orders
    return (
      <TablePage
        title={page === 'myOrders' ? 'Pesanan' : page === 'orderAssets' ? 'Order (Aset)' : 'Semua Order'}
        data={orders}
        columns={orderColumns}
        canManage={user.role === 'admin'}
        onAdd={() => onAdd('orders')}
        onUpdate={(item) => onUpdate('orders', item.id)}
        onDelete={(item) => onDelete('orders', item.id)}
        stats={[
          { label: 'Total Order', value: String(orders.length) },
          { label: 'Dibayar', value: String(orders.filter((order) => order.status === 'Dibayar').length) },
        ]}
      />
    )
  }

  return (
    <TablePage
      title="Promosi"
      data={data.promotions}
      columns={promotionColumns}
      canManage={user.role === 'admin'}
      onAdd={() => onAdd('promotions')}
      onUpdate={(item) => onUpdate('promotions', item.id)}
      onDelete={(item) => onDelete('promotions', item.id)}
    />
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
  const [venue, setVenue] = useState('Semua venue')
  const venues = Array.from(new Set(events.map((event) => event.venue)))
  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesQuery = `${event.title} ${event.artist}`.toLowerCase().includes(query.toLowerCase())
        const matchesVenue = venue === 'Semua venue' || event.venue === venue
        return matchesQuery && matchesVenue
      }),
    [events, query, venue],
  )

  return (
    <section className="content-page">
      <PageHeader
        title={title}
        action={
          canManage && (
            <button className="primary-button" type="button" onClick={onAdd}>
              Tambah Event
            </button>
          )
        }
      />
      <div className="toolbar-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau artis" />
        <select value={venue} onChange={(event) => setVenue(event.target.value)}>
          <option>Semua venue</option>
          {venues.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="card-grid">
        {filteredEvents.map((event) => (
          <article className="resource-card" key={event.id}>
            <div>
              <h2>{event.title}</h2>
              <p>{event.artist}</p>
            </div>
            <dl>
              <Info label="Venue" value={event.venue} />
              <Info label="Tanggal" value={event.date} />
              <Info label="Harga" value={formatCurrency(event.price)} />
              <Info label="Kuota" value={`${event.quota} tiket`} />
            </dl>
            <div className="action-row">
              {role === 'customer' && (
                <button className="primary-button" type="button" onClick={() => onCheckout(event)}>
                  Beli Tiket
                </button>
              )}
              {canManage && (
                <>
                  <button className="secondary-button" type="button" onClick={() => onUpdate(event.id)}>
                    Update
                  </button>
                  <button className="danger-button" type="button" onClick={() => onDelete(event.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
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
  const [city, setCity] = useState('Semua kota')
  const [seatingType, setSeatingType] = useState('Semua kursi')
  const cities = Array.from(new Set(venues.map((venue) => venue.city)))
  const seatingTypes = Array.from(new Set(venues.map((venue) => venue.seatingType)))
  const filteredVenues = venues.filter((venue) => {
    const matchesQuery = `${venue.name} ${venue.address}`.toLowerCase().includes(query.toLowerCase())
    const matchesCity = city === 'Semua kota' || venue.city === city
    const matchesSeating = seatingType === 'Semua kursi' || venue.seatingType === seatingType
    return matchesQuery && matchesCity && matchesSeating
  })

  return (
    <section className="content-page">
      <PageHeader
        title={canManage ? 'Manajemen Venue' : 'Venue'}
        action={
          canManage && (
            <button className="primary-button" type="button" onClick={onAdd}>
              Tambah Venue
            </button>
          )
        }
      />
      <div className="toolbar-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau alamat" />
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option>Semua kota</option>
          {cities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={seatingType} onChange={(event) => setSeatingType(event.target.value)}>
          <option>Semua kursi</option>
          {seatingTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="card-grid">
        {filteredVenues.map((venue) => (
          <article className="resource-card" key={venue.id}>
            <div>
              <h2>{venue.name}</h2>
              <p>{venue.address}</p>
            </div>
            <dl>
              <Info label="Kota" value={venue.city} />
              <Info label="Kapasitas" value={`${venue.capacity} orang`} />
              <Info label="Tipe Kursi" value={venue.seatingType} />
            </dl>
            {canManage && (
              <div className="action-row">
                <button className="secondary-button" type="button" onClick={() => onUpdate(venue.id)}>
                  Update
                </button>
                <button className="danger-button" type="button" onClick={() => onDelete(venue.id)}>
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

type TablePageProps<T extends { id: number }> = {
  title: string
  data: T[]
  columns: Column<T>[]
  canManage: boolean
  onAdd: () => void
  onUpdate: (item: T) => void
  onDelete: (item: T) => void
  stats?: Array<{ label: string; value: string }>
}

function TablePage<T extends { id: number }>({
  title,
  data,
  columns,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  stats,
}: TablePageProps<T>) {
  const [query, setQuery] = useState('')
  const filteredData = data.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="content-page">
      <PageHeader
        title={title}
        action={
          canManage && (
            <button className="primary-button" type="button" onClick={onAdd}>
              Tambah Data
            </button>
          )
        }
      />
      {stats && (
        <div className="stats-row">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="toolbar-row single">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari data" />
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        actions={
          canManage
            ? (item) => (
                <div className="table-actions">
                  <button className="small-button" type="button" onClick={() => onUpdate(item)}>
                    Update
                  </button>
                  <button className="small-danger-button" type="button" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              )
            : undefined
        }
      />
    </section>
  )
}

const artistColumns: Column<Artist>[] = [
  { key: 'name', label: 'Nama', render: (artist) => artist.name },
  { key: 'genre', label: 'Genre', render: (artist) => artist.genre },
  { key: 'country', label: 'Negara', render: (artist) => artist.country },
]

const seatColumns: Column<Seat>[] = [
  { key: 'venue', label: 'Venue', render: (seat) => seat.venue },
  { key: 'code', label: 'Kode', render: (seat) => seat.code },
  { key: 'section', label: 'Section', render: (seat) => seat.section },
  { key: 'status', label: 'Status', render: (seat) => <StatusPill value={seat.status} /> },
]

const ticketCategoryColumns: Column<TicketCategory>[] = [
  { key: 'event', label: 'Event', render: (category) => category.event },
  { key: 'name', label: 'Kategori', render: (category) => category.name },
  { key: 'price', label: 'Harga', render: (category) => formatCurrency(category.price) },
  { key: 'quota', label: 'Kuota', render: (category) => category.quota },
]

const ticketColumns: Column<Ticket>[] = [
  { key: 'code', label: 'Kode', render: (ticket) => ticket.code },
  { key: 'event', label: 'Event', render: (ticket) => ticket.event },
  { key: 'customer', label: 'Customer', render: (ticket) => ticket.customer },
  { key: 'status', label: 'Status', render: (ticket) => <StatusPill value={ticket.status} /> },
]

const orderColumns: Column<Order>[] = [
  { key: 'code', label: 'Kode', render: (order) => order.code },
  { key: 'customer', label: 'Customer', render: (order) => order.customer },
  { key: 'event', label: 'Event', render: (order) => order.event },
  { key: 'quantity', label: 'Jumlah', render: (order) => order.quantity },
  { key: 'total', label: 'Total', render: (order) => formatCurrency(order.total) },
  { key: 'status', label: 'Status', render: (order) => <StatusPill value={order.status} /> },
]

const promotionColumns: Column<Promotion>[] = [
  { key: 'code', label: 'Kode', render: (promotion) => promotion.code },
  { key: 'title', label: 'Nama', render: (promotion) => promotion.title },
  { key: 'discountType', label: 'Tipe', render: (promotion) => promotion.discountType },
  { key: 'value', label: 'Nilai', render: (promotion) => promotion.value },
]

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function StatusPill({ value }: { value: string }) {
  return <span className="status-pill">{value}</span>
}
