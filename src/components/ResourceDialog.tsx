import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select'
import type { AppData, ResourceDialogState, ResourceDraft, ResourceKind } from '../types'
import { formatCurrency } from '../utils/format'

type ResourceDialogProps = {
  state: ResourceDialogState
  data: AppData
  open: boolean
  onDraftChange: (draft: ResourceDraft) => void
  onOpenChange: (open: boolean) => void
  onSubmit: (event: FormEvent) => void
}

const titles: Record<ResourceKind, string> = {
  venues: 'Venue',
  artists: 'Artist',
  events: 'Event',
  seats: 'Kursi',
  ticketCategories: 'Kategori Tiket',
  tickets: 'Tiket',
  orders: 'Order',
  promotions: 'Promosi',
}

export function ResourceDialog({ state, data, open, onDraftChange, onOpenChange, onSubmit }: ResourceDialogProps) {
  const title =
    state.kind === 'events'
      ? state.mode === 'create'
        ? 'Buat Acara Baru'
        : 'Update Acara'
      : state.kind === 'promotions'
        ? state.mode === 'create'
          ? 'Buat Promo'
          : 'Update Promotion'
      : `${state.mode === 'create' ? 'Tambah' : 'Update'} ${titles[state.kind]}`
  const updateDraft = (draft: ResourceDraft) => onDraftChange({ ...state.draft, ...draft })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={state.kind === 'events' ? 'sm:max-w-[720px]' : 'sm:max-w-[500px]'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Fields state={state} data={data} onDraftChange={updateDraft} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              {state.kind === 'events' && state.mode === 'create'
                ? 'Buat Acara'
                : state.kind === 'promotions' && state.mode === 'create'
                  ? 'Buat'
                  : state.mode === 'create'
                    ? 'Tambah'
                    : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Fields({
  state,
  data,
  onDraftChange,
}: {
  state: ResourceDialogState
  data: AppData
  onDraftChange: (draft: ResourceDraft) => void
}) {
  const { kind } = state

  if (kind === 'venues') {
    return (
      <>
        <FieldInput label="Nama Venue" value={state.draft.name} field="name" onChange={onDraftChange} required />
        <FieldInput label="Alamat" value={state.draft.address} field="address" onChange={onDraftChange} required />
        <FieldInput label="Kota" value={state.draft.city} field="city" onChange={onDraftChange} required />
        <FieldInput label="Kapasitas" value={state.draft.capacity} field="capacity" type="number" onChange={onDraftChange} required />
        <FieldCheckbox
          label="Has Reserved Seating"
          checked={state.draft.hasReservedSeating === 'true'}
          field="hasReservedSeating"
          onChange={onDraftChange}
        />
      </>
    )
  }

   if (kind === 'events') {
     return (
       <div className="grid gap-5 md:grid-cols-2">
         <div className="grid gap-4">
           <FieldInput label="Judul Acara (Event_Title)" value={state.draft.title} field="title" onChange={onDraftChange} required />
           <FieldInput label="Gambar Acara (URL)" value={state.draft.imageUrl} field="imageUrl" onChange={onDraftChange} />
           <div className="grid gap-4 sm:grid-cols-2">
             <FieldInput label="Tanggal (Date)" value={state.draft.date} field="date" type="date" onChange={onDraftChange} required />
             <FieldInput label="Waktu (Time)" value={state.draft.time} field="time" type="time" onChange={onDraftChange} required />
           </div>
           <FieldSelect
             label="Venue (Venue_ID)"
             value={state.draft.venue}
             field="venue"
             options={data.venues.map((v) => v.name)}
             onChange={onDraftChange}
           />
           <FieldPillSelect
             label="Artis (Event_Artist)"
             value={state.draft.artist}
             field="artist"
             options={data.artists.map((a) => a.name)}
             onChange={onDraftChange}
           />
         </div>
         <div className="grid gap-4">
           <TicketCategoryFields draft={state.draft} onChange={onDraftChange} />
           <FieldTextarea label="Deskripsi" value={state.draft.description} field="description" onChange={onDraftChange} />
         </div>
       </div>
     )
   }

  if (kind === 'artists') {
    return (
      <>
        <FieldInput label="Nama" value={state.draft.name} field="name" onChange={onDraftChange} required />
        <FieldInput label="Genre" value={state.draft.genre} field="genre" onChange={onDraftChange} />
        <FieldInput label="Negara" value={state.draft.country} field="country" onChange={onDraftChange} />
      </>
    )
  }

  if (kind === 'seats') {
    return (
      <>
        <FieldSelect
          label="Venue"
          value={state.draft.venue}
          field="venue"
          options={data.venues.map((v) => v.name)}
          onChange={onDraftChange}
        />
        <FieldInput label="Section" value={state.draft.section} field="section" onChange={onDraftChange} required />
        <FieldInput label="Row" value={state.draft.row} field="row" onChange={onDraftChange} required />
        <FieldInput label="Seat Number" value={state.draft.number} field="number" onChange={onDraftChange} required />
        <FieldSelect
          label="Status"
          value={state.draft.status}
          field="status"
          options={['Tersedia', 'Terisi']}
          onChange={onDraftChange}
        />
      </>
    )
  }

  if (kind === 'ticketCategories') {
    return (
      <>
        <FieldSelect
          label="Event"
          value={state.draft.event}
          field="event"
          options={data.events.map((e) => e.title)}
          onChange={onDraftChange}
        />
        <FieldInput label="Nama Kategori" value={state.draft.name} field="name" onChange={onDraftChange} required />
        <FieldInput label="Harga" value={state.draft.price} field="price" type="number" onChange={onDraftChange} required />
        <FieldInput label="Kuota" value={state.draft.quota} field="quota" type="number" onChange={onDraftChange} required />
      </>
    )
  }

  if (kind === 'promotions') {
    return (
      <>
        <FieldInput label="Kode Promo" value={state.draft.code} field="code" onChange={onDraftChange} required />
        <FieldSelect
          label="Tipe Diskon"
          value={state.draft.discountType}
          field="discountType"
          options={['Persentase', 'Nominal']}
          onChange={onDraftChange}
        />
        <FieldInput label="Nilai Diskon" value={state.draft.value} field="value" onChange={onDraftChange} placeholder="20 atau 50000" required />
        <FieldInput label="Tanggal Mulai" value={state.draft.startDate} field="startDate" type="date" onChange={onDraftChange} required />
        <FieldInput label="Tanggal Berakhir" value={state.draft.endDate} field="endDate" type="date" onChange={onDraftChange} required />
        <FieldInput label="Batas Penggunaan" value={state.draft.usageLimit} field="usageLimit" type="number" onChange={onDraftChange} required />
      </>
    )
  }

  if (kind === 'orders') {
    return (
      <>
        <FieldInput label="Order ID" value={state.draft.code} field="code" onChange={onDraftChange} readOnly />
        <FieldSelect
          label="Status Pembayaran"
          value={state.draft.status}
          field="status"
          options={['Menunggu', 'Dibayar', 'Dibatalkan']}
          onChange={onDraftChange}
        />
      </>
    )
  }

  if (kind === 'tickets') {
    return <TicketFields state={state} data={data} onDraftChange={onDraftChange} />
  }

  return null
}

function TicketFields({
  state,
  data,
  onDraftChange,
}: {
  state: ResourceDialogState
  data: AppData
  onDraftChange: (draft: ResourceDraft) => void
}) {
  const [selectedOrder, setSelectedOrder] = useState(state.draft.orderCode || '')
  const [selectedCategory, setSelectedCategory] = useState(state.draft.category || '')

  const orderOptions = data.orders.map(o => ({
    value: o.code,
    label: `${o.code} - ${o.customer} - ${o.event}`,
  }))
  const selectedOrderData = data.orders.find(o => o.code === selectedOrder)
  const eventName = selectedOrderData?.event || ''
  
  const categoryOptions = eventName 
    ? data.ticketCategories.filter(c => c.event === eventName)
    : []
  
  const venueForEvent = data.events.find(e => e.title === eventName)?.venue || ''
  const venueData = data.venues.find(v => v.name === venueForEvent)
  const isReservedSeating = venueHasReservedSeating(venueData)
  
  const availableSeats = isReservedSeating
    ? data.seats.filter(s => s.venue === venueForEvent && s.status === 'Tersedia')
    : []

  const isUpdate = state.mode === 'update'

  if (isUpdate) {
    const currentTicket = data.tickets.find(t => t.id === state.id)
    const currentEvent = currentTicket?.event || ''
    const currentVenue = data.events.find(e => e.title === currentEvent)?.venue || ''
    const currentVenueData = data.venues.find(v => v.name === currentVenue)
    const isCurrentReserved = venueHasReservedSeating(currentVenueData)
    
    const currentSeatOptions = isCurrentReserved
      ? data.seats.filter(s => s.venue === currentVenue && s.status === 'Tersedia')
      : []

    return (
      <>
        <FieldInput
          label="Kode Tiket"
          value={currentTicket ? getDisplayTicketCode(data, currentTicket) : state.draft.code}
          field="code"
          onChange={onDraftChange}
          readOnly
        />
        <FieldSelect
          label="Status"
          value={state.draft.status}
          field="status"
          options={['Aktif', 'Dipakai', 'Dibatalkan']}
          onChange={onDraftChange}
        />
        {isCurrentReserved && (
          <div className="grid gap-2">
            <Label>Kursi</Label>
            <Select value={state.draft.seatCode || '-'} onValueChange={(value) => onDraftChange({ seatCode: value } as ResourceDraft)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kursi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">Tanpa Kursi</SelectItem>
                {state.draft.seatCode && state.draft.seatCode !== '-' && (
                  <SelectItem value={state.draft.seatCode}>{formatSeatLabel(state.draft.seatCode)}</SelectItem>
                )}
                {currentSeatOptions.map((seat) => {
                  const code = getSeatCode(seat)
                  if (code === state.draft.seatCode) return null
                  return (
                    <SelectItem key={code} value={code}>
                      {formatSeatLabel(code)}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="grid gap-2">
        <Label>Order</Label>
        <Select
          value={selectedOrder}
          onValueChange={(value) => {
            setSelectedOrder(value)
            setSelectedCategory('')
            onDraftChange({ orderCode: value, category: '', seatCode: '-' } as ResourceDraft)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih order" />
          </SelectTrigger>
          <SelectContent>
            {orderOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedOrder && (
        <div className="grid gap-2">
          <Label>Kategori Tiket</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              onDraftChange({ category: value, seatCode: '-' } as ResourceDraft)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori tiket" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => {
                const used = getUsedCategoryCount(data, eventName, category.name)
                const full = used >= category.quota
                return (
                  <SelectItem key={category.id} value={category.name} disabled={full}>
                    {category.name} - {formatCurrency(category.price)} ({used}/{category.quota})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {isReservedSeating && selectedOrder && selectedCategory && (
        <div className="grid gap-2">
          <Label>Kursi (Opsional)</Label>
          <Select value={state.draft.seatCode || '-'} onValueChange={(value) => onDraftChange({ seatCode: value } as ResourceDraft)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kursi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-">Tanpa Kursi</SelectItem>
              {availableSeats.map((seat) => {
                const code = getSeatCode(seat)
                return (
                  <SelectItem key={code} value={code}>
                    {formatSeatLabel(code)}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      <FieldInput label="Kode Tiket" value="Auto-generate saat dibuat" field="generatedCode" onChange={onDraftChange} readOnly />
    </>
  )
}

function FieldInput({
  label,
  value,
  field,
  type = 'text',
  placeholder,
  required,
  readOnly,
  onChange,
}: {
  label: string
  value: string
  field: string
  type?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Input
        id={field}
        type={type}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...{ [field]: e.target.value } } as ResourceDraft)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={readOnly ? 'bg-[var(--muted)]' : ''}
      />
    </div>
  )
}

function FieldTextarea({
  label,
  value,
  field,
  onChange,
}: {
  label: string
  value: string
  field: string
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <textarea
        id={field}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...{ [field]: e.target.value } } as ResourceDraft)}
        className="flex min-h-[80px] w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
      />
    </div>
  )
}

function FieldCheckbox({
  label,
  checked,
  field,
  onChange,
}: {
  label: string
  checked: boolean
  field: string
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange({ [field]: String(event.target.checked) } as ResourceDraft)}
        className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
      />
      {label}
    </label>
  )
}

function venueHasReservedSeating(venue: AppData['venues'][number] | undefined) {
  if (!venue) return false
  if ('hasReservedSeating' in venue) return venue.hasReservedSeating
  const legacyVenue = venue as AppData['venues'][number] & { seatingType?: string }
  return legacyVenue.seatingType !== 'Festival'
}

function getSeatCode(seat: { section: string; row: string; number: string }) {
  return `${seat.section}-${seat.row}-${seat.number}`
}

function formatSeatLabel(code: string) {
  if (code === '-') return 'Tanpa Kursi'
  const [section, row, number] = code.split('-')
  return `${section} - Baris ${row}, No. ${number}`
}

function getUsedCategoryCount(data: AppData, eventName: string, categoryName: string) {
  return data.tickets.filter((ticket) => ticket.event === eventName && ticket.category === categoryName).length
}

function getDisplayTicketCode(data: AppData, ticket: AppData['tickets'][number]) {
  const event = data.events.find((item) => item.title === ticket.event)
  const eventPart = `EVT${String(event?.id ?? ticket.id).padStart(3, '0')}`
  const [section = 'NOSEAT', , number = String(ticket.id).padStart(3, '0')] =
    ticket.seatCode && ticket.seatCode !== '-' ? ticket.seatCode.split('-') : []
  return `TKT-${eventPart}-${sanitizeTicketCodePart(section)}-${sanitizeTicketCodePart(number)}`
}

function sanitizeTicketCodePart(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase() || 'NA'
}

type TicketCategoryDraft = {
  name: string
  price: string
  quota: string
}

function TicketCategoryFields({
  draft,
  onChange,
}: {
  draft: ResourceDraft
  onChange: (draft: ResourceDraft) => void
}) {
  const categories = parseTicketCategoryDrafts(draft.ticketCategoriesJson)

  function updateCategories(nextCategories: TicketCategoryDraft[]) {
    onChange({ ticketCategoriesJson: JSON.stringify(nextCategories) } as ResourceDraft)
  }

  return (
    <div className="grid gap-2">
      <Label>Kategori Tiket (Ticket_Category)</Label>
      <div className="grid gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)]/30 p-3">
        {categories.map((category, index) => (
          <div key={index} className="grid gap-2 rounded-md bg-white p-2 shadow-[var(--shadow-sm)]">
            <div className="flex gap-2">
              <Input
                value={category.name}
                placeholder="Regular"
                onChange={(event) => {
                  const next = [...categories]
                  next[index] = { ...category, name: event.target.value }
                  updateCategories(next)
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Hapus kategori"
                onClick={() => updateCategories(categories.filter((_, itemIndex) => itemIndex !== index))}
                disabled={categories.length === 1}
                className="shrink-0 text-[var(--destructive)] hover:bg-[var(--destructive-light)] hover:text-[var(--destructive)]"
              >
                x
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                min="0"
                value={category.price}
                placeholder="100000"
                onChange={(event) => {
                  const next = [...categories]
                  next[index] = { ...category, price: event.target.value }
                  updateCategories(next)
                }}
              />
              <Input
                type="number"
                min="1"
                value={category.quota}
                placeholder="100"
                onChange={(event) => {
                  const next = [...categories]
                  next[index] = { ...category, quota: event.target.value }
                  updateCategories(next)
                }}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-[var(--primary)]"
          onClick={() => updateCategories([...categories, { name: '', price: '0', quota: '1' }])}
        >
          + Tambah Kategori
        </Button>
      </div>
    </div>
  )
}

function FieldPillSelect({
  label,
  value,
  field,
  options,
  onChange,
}: {
  label: string
  value: string
  field: string
  options: string[]
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange({ [field]: option } as ResourceDraft)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              value === option
                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function parseTicketCategoryDrafts(value: string | undefined): TicketCategoryDraft[] {
  try {
    const parsed = JSON.parse(value || '[]') as TicketCategoryDraft[]
    return parsed.length ? parsed : [{ name: 'Regular', price: '0', quota: '1' }]
  } catch {
    return [{ name: 'Regular', price: '0', quota: '1' }]
  }
}

function FieldSelect({
  label,
  value,
  field,
  options,
  onChange,
}: {
  label: string
  value: string
  field: string
  options: string[]
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={field}>{label}</Label>
      <Select value={value} onValueChange={(val) => onChange({ ...{ [field]: val } } as ResourceDraft)}>
        <SelectTrigger id={field}>
          <SelectValue placeholder={`Pilih ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
