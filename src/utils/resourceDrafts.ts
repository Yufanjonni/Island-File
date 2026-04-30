import type { AppData, Artist, EventItem, Order, Promotion, Seat, Ticket, TicketCategory, User, Venue, ResourceDialogState, ResourceDraft, ResourceKind } from '../types'

export function createDefaultDraft(kind: ResourceKind, data: AppData): ResourceDraft {
  if (kind === 'venues') {
    return { name: '', address: '', city: '', capacity: '100', hasReservedSeating: 'false' }
  }
  if (kind === 'events') {
    return {
      title: '',
      date: '',
      time: '19:00',
      venue: data.venues[0]?.name ?? '',
      artist: data.artists[0]?.name ?? '',
      category: '',
      price: '0',
      quota: '1',
      ticketCategoriesJson: JSON.stringify([{ name: 'Regular', price: '0', quota: '1' }]),
      description: '',
    }
  }
  if (kind === 'artists') return { name: '', genre: '', country: 'Indonesia' }
  if (kind === 'seats') {
    return { venue: data.venues[0]?.name ?? '', section: '', row: '', number: '', status: 'Tersedia' }
  }
  if (kind === 'ticketCategories') {
    return { event: data.events[0]?.title ?? '', name: '', quota: '1', price: '0' }
  }
  if (kind === 'tickets') {
    const firstOrder = data.orders[0]
    return {
      orderCode: firstOrder?.code ?? '',
      category: data.ticketCategories[0]?.name ?? '',
      seatCode: '-',
      status: 'Aktif',
    }
  }
  if (kind === 'orders') return { code: '', status: 'Menunggu' }
  return {
    code: '',
    title: '',
    discountType: 'Persentase',
    value: '',
    startDate: '',
    endDate: '',
    usageLimit: '1',
  }
}

export function createDraftFromData(kind: ResourceKind, data: AppData, id: number): ResourceDraft {
  if (kind === 'venues') {
    const venue = data.venues.find((item) => item.id === id)
    return {
      ...toStringDraft(venue),
      hasReservedSeating: String(venueHasReservedSeating(venue)),
    }
  }
  if (kind === 'events') {
    const event = data.events.find((item) => item.id === id)
    const draft = toStringDraft(event)
    const categories = data.ticketCategories
      .filter((category) => category.event === event?.title)
      .map((category) => ({
        name: category.name,
        price: String(category.price),
        quota: String(category.quota),
      }))
    return {
      ...draft,
      ticketCategoriesJson: JSON.stringify(
        categories.length ? categories : [{ name: event?.category ?? 'Regular', price: String(event?.price ?? 0), quota: String(event?.quota ?? 1) }],
      ),
    }
  }
  if (kind === 'artists') return toStringDraft(data.artists.find((item) => item.id === id))
  if (kind === 'seats') return toStringDraft(data.seats.find((item) => item.id === id))
  if (kind === 'ticketCategories') return toStringDraft(data.ticketCategories.find((item) => item.id === id))
  if (kind === 'tickets') return toStringDraft(data.tickets.find((item) => item.id === id))
  if (kind === 'orders') return toStringDraft(data.orders.find((item) => item.id === id))
  return toStringDraft(data.promotions.find((item) => item.id === id))
}

export function validateResourceDraft(state: ResourceDialogState, data: AppData) {
  const { kind, draft, mode, id } = state

  if (kind === 'artists' && !draft.name.trim()) return 'Name wajib diisi.'
  if (kind === 'venues') {
    if (!draft.name.trim() || !draft.address.trim() || !draft.city.trim()) return 'Seluruh field venue wajib diisi.'
    if (Number(draft.capacity) <= 0) return 'Kapasitas harus lebih dari 0.'
  }
  if (kind === 'events') {
    if (!draft.title.trim() || !draft.date.trim() || !draft.time.trim() || !draft.venue || !draft.artist) {
      return 'Seluruh field event wajib diisi.'
    }
    const categories = parseTicketCategories(draft.ticketCategoriesJson)
    if (!categories.length) return 'Minimal satu kategori tiket wajib diisi.'
    if (categories.some((category) => !category.name.trim())) return 'Nama kategori tiket wajib diisi.'
    if (categories.some((category) => Number(category.price) < 0)) return 'Harga tidak boleh negatif.'
    if (categories.some((category) => Number(category.quota) <= 0)) return 'Kuota harus lebih dari 0.'
    const venue = data.venues.find((item) => item.name === draft.venue)
    const totalQuota = categories.reduce((total, category) => total + Number(category.quota), 0)
    if (venue && totalQuota > venue.capacity) return 'Total kuota kategori tiket tidak boleh melebihi kapasitas venue.'
  }
  if (kind === 'seats') {
    if (!draft.venue || !draft.section.trim() || !draft.row.trim() || !draft.number.trim()) {
      return 'Seluruh field kursi wajib diisi.'
    }
    const duplicate = data.seats.some(
      (seat) =>
        seat.id !== id &&
        seat.venue === draft.venue &&
        seat.section.toLowerCase() === draft.section.trim().toLowerCase() &&
        seat.row.toLowerCase() === draft.row.trim().toLowerCase() &&
        seat.number.toLowerCase() === draft.number.trim().toLowerCase(),
    )
    if (duplicate) return 'Kombinasi venue, section, row, dan nomor kursi sudah ada.'
  }
  if (kind === 'ticketCategories') {
    if (!draft.event || !draft.name.trim()) return 'Event dan nama kategori wajib diisi.'
    if (Number(draft.quota) <= 0) return 'Quota harus berupa bilangan positif.'
    if (Number(draft.price) < 0) return 'Price tidak boleh negatif.'
    const eventItem = data.events.find((item) => item.title === draft.event)
    const venue = data.venues.find((item) => item.name === eventItem?.venue)
    const otherQuota = data.ticketCategories
      .filter((item) => item.event === draft.event && item.id !== id)
      .reduce((total, item) => total + item.quota, 0)
    if (venue && otherQuota + Number(draft.quota) > venue.capacity) {
      return 'Total kuota kategori tiket tidak boleh melebihi kapasitas venue.'
    }
  }
  if (kind === 'tickets') {
    if (mode === 'create' && (!draft.orderCode || !draft.category)) return 'Order dan kategori tiket wajib dipilih.'
    if (mode === 'create') {
      const order = data.orders.find((item) => item.code === draft.orderCode)
      const category = data.ticketCategories.find((item) => item.event === order?.event && item.name === draft.category)
      const used = data.tickets.filter((ticket) => ticket.event === order?.event && ticket.category === draft.category).length
      if (category && used >= category.quota) return 'Kuota kategori tiket sudah penuh.'
    }
  }
  if (kind === 'promotions') {
    if (!draft.code.trim() || !draft.value.trim() || !draft.startDate || !draft.endDate) {
      return 'Seluruh field wajib diisi.'
    }
    if (parseDiscountValue(draft.value) <= 0) return 'Nilai diskon harus berupa bilangan positif.'
    const duplicateCode = data.promotions.some(
      (promo) => promo.id !== id && promo.code.toLowerCase() === draft.code.trim().toLowerCase(),
    )
    if (duplicateCode) return 'Kode promo harus unik.'
    if (Number(draft.usageLimit) <= 0) return 'Batas penggunaan harus lebih dari 0.'
    if (draft.endDate < draft.startDate) return 'Tanggal berakhir harus sama dengan atau setelah tanggal mulai.'
  }

  return ''
}

export function applyResourceDraft(state: ResourceDialogState, data: AppData, user: User | null): AppData {
  const { kind, mode, id, draft } = state
  const nextId = Date.now()

  if (kind === 'venues') {
    const value: Venue = {
      id: mode === 'update' && id ? id : nextId,
      name: draft.name.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      capacity: Number(draft.capacity),
      hasReservedSeating: draft.hasReservedSeating === 'true',
    }
    return mode === 'update'
      ? { ...data, venues: data.venues.map((item) => (item.id === id ? value : item)) }
      : { ...data, venues: [value, ...data.venues] }
  }

  if (kind === 'events') {
    const categories = parseTicketCategories(draft.ticketCategoriesJson)
    const primaryCategory = categories[0] ?? { name: draft.category.trim(), price: draft.price, quota: draft.quota }
    const oldEvent = mode === 'update' ? data.events.find((item) => item.id === id) : undefined
    const value: EventItem = {
      id: mode === 'update' && id ? id : nextId,
      organizerId: mode === 'update' ? data.events.find((item) => item.id === id)?.organizerId ?? user?.id ?? 2 : user?.id ?? 2,
      title: draft.title.trim(),
      artist: draft.artist,
      venue: draft.venue,
      date: draft.date.trim(),
      time: draft.time,
      category: primaryCategory.name.trim(),
      description: draft.description.trim(),
      price: Number(primaryCategory.price),
      quota: categories.reduce((total, category) => total + Number(category.quota), 0),
    }
    const existingCategoryIds = data.ticketCategories
      .filter((item) => item.event === oldEvent?.title)
      .map((item) => item.id)
    const nextCategories: TicketCategory[] = categories.map((category, index) => ({
      id: existingCategoryIds[index] ?? nextId + index + 1,
      event: value.title,
      name: category.name.trim(),
      price: Number(category.price),
      quota: Number(category.quota),
    }))

    return mode === 'update'
      ? {
          ...data,
          events: data.events.map((item) => (item.id === id ? value : item)),
          ticketCategories: [
            ...data.ticketCategories.filter((item) => item.event !== oldEvent?.title),
            ...nextCategories,
          ],
        }
      : {
          ...data,
          events: [value, ...data.events],
          ticketCategories: [...nextCategories, ...data.ticketCategories],
        }
  }

  if (kind === 'artists') {
    const value: Artist = {
      id: mode === 'update' && id ? id : nextId,
      name: draft.name.trim(),
      genre: draft.genre.trim(),
      country: draft.country.trim() || 'Indonesia',
    }
    return mode === 'update'
      ? { ...data, artists: data.artists.map((item) => (item.id === id ? value : item)) }
      : { ...data, artists: [value, ...data.artists] }
  }

  if (kind === 'seats') {
    const value: Seat = {
      id: mode === 'update' && id ? id : nextId,
      venue: draft.venue,
      section: draft.section.trim(),
      row: draft.row.trim(),
      number: draft.number.trim(),
      status: draft.status as Seat['status'],
    }
    return mode === 'update'
      ? { ...data, seats: data.seats.map((item) => (item.id === id ? value : item)) }
      : { ...data, seats: [value, ...data.seats] }
  }

  if (kind === 'ticketCategories') {
    const value: TicketCategory = {
      id: mode === 'update' && id ? id : nextId,
      event: draft.event,
      name: draft.name.trim(),
      price: Number(draft.price),
      quota: Number(draft.quota),
    }
    return mode === 'update'
      ? { ...data, ticketCategories: data.ticketCategories.map((item) => (item.id === id ? value : item)) }
      : { ...data, ticketCategories: [value, ...data.ticketCategories] }
  }

  if (kind === 'tickets') {
    if (mode === 'update') {
      const oldTicket = data.tickets.find((item) => item.id === id)
      const nextSeatCode = normalizeSeatCode(draft.seatCode)
      const nextTickets = data.tickets.map((item) =>
        item.id === id ? { ...item, status: draft.status as Ticket['status'], seatCode: nextSeatCode } : item,
      )
      const releasedSeats = oldTicket?.seatCode && oldTicket.seatCode !== nextSeatCode
        ? updateSeatStatus(data.seats, oldTicket.seatCode, 'Tersedia')
        : data.seats
      return {
        ...data,
        tickets: nextTickets,
        seats: updateSeatStatus(releasedSeats, nextSeatCode, 'Terisi'),
      }
    }
    const orderCode = draft.orderCode
    const order = data.orders.find((item) => item.code === orderCode)
    const value: Ticket = {
      id: nextId,
      code: `TKT-${String(nextId).slice(-4)}`,
      orderCode,
      category: draft.category,
      seatCode: normalizeSeatCode(draft.seatCode),
      event: order?.event ?? '',
      customer: order?.customer ?? '',
      status: draft.status as Ticket['status'],
    }
    return {
      ...data,
      tickets: [value, ...data.tickets],
      seats: updateSeatStatus(data.seats, value.seatCode, 'Terisi'),
    }
  }

  if (kind === 'orders') {
    return {
      ...data,
      orders: data.orders.map((item) =>
        item.id === id ? { ...item, status: draft.status as Order['status'] } : item,
      ),
    }
  }

  const value: Promotion = {
    id: mode === 'update' && id ? id : nextId,
    code: draft.code.trim().toUpperCase(),
    title: draft.title.trim(),
    discountType: draft.discountType as Promotion['discountType'],
    value: draft.value.trim(),
    startDate: draft.startDate,
    endDate: draft.endDate,
    usageLimit: Number(draft.usageLimit),
  }
  return mode === 'update'
    ? { ...data, promotions: data.promotions.map((item) => (item.id === id ? value : item)) }
    : { ...data, promotions: [value, ...data.promotions] }
}

export function deleteResource(kind: ResourceKind, id: number, data: AppData): AppData {
  if (kind === 'tickets') {
    const ticket = data.tickets.find((item) => item.id === id)
    return {
      ...data,
      tickets: data.tickets.filter((item) => item.id !== id),
      seats: ticket ? updateSeatStatus(data.seats, ticket.seatCode, 'Tersedia') : data.seats,
    }
  }
  if (kind === 'venues') return { ...data, venues: data.venues.filter((item) => item.id !== id) }
  if (kind === 'events') return { ...data, events: data.events.filter((item) => item.id !== id) }
  if (kind === 'artists') return { ...data, artists: data.artists.filter((item) => item.id !== id) }
  if (kind === 'seats') return { ...data, seats: data.seats.filter((item) => item.id !== id) }
  if (kind === 'ticketCategories') return { ...data, ticketCategories: data.ticketCategories.filter((item) => item.id !== id) }
  if (kind === 'orders') return { ...data, orders: data.orders.filter((item) => item.id !== id) }
  return { ...data, promotions: data.promotions.filter((item) => item.id !== id) }
}

export function getResourceName(kind: ResourceKind, id: number, data: AppData) {
  if (kind === 'venues') return data.venues.find((item) => item.id === id)?.name ?? 'Data'
  if (kind === 'events') return data.events.find((item) => item.id === id)?.title ?? 'Data'
  if (kind === 'artists') return data.artists.find((item) => item.id === id)?.name ?? 'Data'
  if (kind === 'seats') {
    const seat = data.seats.find((item) => item.id === id)
    return seat ? getSeatCode(seat) : 'Data'
  }
  if (kind === 'ticketCategories') return data.ticketCategories.find((item) => item.id === id)?.name ?? 'Data'
  if (kind === 'tickets') return data.tickets.find((item) => item.id === id)?.code ?? 'Data'
  if (kind === 'orders') return data.orders.find((item) => item.id === id)?.code ?? 'Data'
  return data.promotions.find((item) => item.id === id)?.code ?? 'Data'
}

export function getSeatCode(seat: Pick<Seat, 'section' | 'row' | 'number'>) {
  return `${seat.section}-${seat.row}-${seat.number}`
}

function updateSeatStatus(seats: Seat[], code: string, status: Seat['status']) {
  if (!code || code === '-') return seats
  return seats.map((seat) => (getSeatCode(seat) === code ? { ...seat, status } : seat))
}

function normalizeSeatCode(code: string | undefined) {
  return !code || code === 'Tanpa Kursi' ? '-' : code
}

function toStringDraft(item: unknown): ResourceDraft {
  if (!item || typeof item !== 'object') return {}
  return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, String(value)]))
}

function parseTicketCategories(value: string | undefined) {
  try {
    const parsed = JSON.parse(value || '[]') as Array<{ name?: string; price?: string; quota?: string }>
    return parsed.map((category) => ({
      name: category.name ?? '',
      price: category.price ?? '0',
      quota: category.quota ?? '1',
    }))
  } catch {
    return []
  }
}

function parseDiscountValue(value: string) {
  return Number(value.replace(/[^\d]/g, ''))
}

function venueHasReservedSeating(venue: Venue | undefined) {
  if (!venue) return false
  if ('hasReservedSeating' in venue) return venue.hasReservedSeating
  const legacyVenue = venue as Venue & { seatingType?: string }
  return legacyVenue.seatingType !== 'Festival'
}
