import type { FormEvent } from 'react'
import { Field } from './Field'
import { Modal } from './Modal'
import type { AppData } from '../types'

export type ResourceKind = keyof AppData
export type ResourceDraft = Record<string, string>

export type ResourceDialogState = {
  kind: ResourceKind
  mode: 'create' | 'update'
  id?: number
  draft: ResourceDraft
}

type ResourceDialogProps = {
  state: ResourceDialogState
  data: AppData
  onDraftChange: (draft: ResourceDraft) => void
  onClose: () => void
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

export function ResourceDialog({ state, data, onDraftChange, onClose, onSubmit }: ResourceDialogProps) {
  const title = `${state.mode === 'create' ? 'Tambah' : 'Update'} ${titles[state.kind]}`

  return (
    <Modal title={title} onClose={onClose}>
      <form className="form-stack modal-form" onSubmit={onSubmit}>
        <Fields state={state} data={data} onDraftChange={onDraftChange} />
        <button className="primary-button" type="submit">
          {state.mode === 'create' ? 'Tambah' : 'Simpan'}
        </button>
      </form>
    </Modal>
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
  const { kind, draft, mode } = state

  if (kind === 'venues') {
    return (
      <>
        <TextField draft={draft} field="name" label="Nama Venue" onChange={onDraftChange} />
        <TextField draft={draft} field="address" label="Alamat" onChange={onDraftChange} />
        <TextField draft={draft} field="city" label="Kota" onChange={onDraftChange} />
        <TextField draft={draft} field="capacity" label="Kapasitas" type="number" onChange={onDraftChange} />
        <SelectField
          draft={draft}
          field="seatingType"
          label="Jenis Seating"
          options={['Nomor kursi', 'Festival', 'Campuran']}
          onChange={onDraftChange}
        />
      </>
    )
  }

  if (kind === 'events') {
    return (
      <>
        <TextField draft={draft} field="title" label="Judul Acara" onChange={onDraftChange} />
        <TextField draft={draft} field="date" label="Tanggal" onChange={onDraftChange} />
        <TextField draft={draft} field="time" label="Waktu" type="time" onChange={onDraftChange} />
        <SelectField
          draft={draft}
          field="venue"
          label="Venue"
          options={data.venues.map((venue) => venue.name)}
          onChange={onDraftChange}
        />
        <SelectField
          draft={draft}
          field="artist"
          label="Artist"
          options={data.artists.map((artist) => artist.name)}
          onChange={onDraftChange}
        />
        <TextField draft={draft} field="category" label="Kategori Tiket" onChange={onDraftChange} />
        <TextField draft={draft} field="price" label="Harga Mulai" type="number" onChange={onDraftChange} />
        <TextField draft={draft} field="quota" label="Kuota" type="number" onChange={onDraftChange} />
        <TextField draft={draft} field="description" label="Deskripsi" onChange={onDraftChange} />
      </>
    )
  }

  if (kind === 'artists') {
    return (
      <>
        <TextField draft={draft} field="name" label="Name" onChange={onDraftChange} />
        <TextField draft={draft} field="genre" label="Genre" required={false} onChange={onDraftChange} />
        <TextField draft={draft} field="country" label="Negara" required={false} onChange={onDraftChange} />
      </>
    )
  }

  if (kind === 'seats') {
    return (
      <>
        <SelectField
          draft={draft}
          field="venue"
          label="Venue"
          options={data.venues.map((venue) => venue.name)}
          onChange={onDraftChange}
        />
        <TextField draft={draft} field="section" label="Section" onChange={onDraftChange} />
        <TextField draft={draft} field="row" label="Row" onChange={onDraftChange} />
        <TextField draft={draft} field="number" label="Seat Number" onChange={onDraftChange} />
        <SelectField draft={draft} field="status" label="Status" options={['Tersedia', 'Terisi']} onChange={onDraftChange} />
      </>
    )
  }

  if (kind === 'ticketCategories') {
    return (
      <>
        <SelectField
          draft={draft}
          field="event"
          label="Event"
          options={data.events.map((event) => event.title)}
          onChange={onDraftChange}
        />
        <TextField draft={draft} field="name" label="Category Name" onChange={onDraftChange} />
        <TextField draft={draft} field="quota" label="Quota" type="number" onChange={onDraftChange} />
        <TextField draft={draft} field="price" label="Price" type="number" onChange={onDraftChange} />
      </>
    )
  }

  if (kind === 'tickets') {
    return (
      <>
        {mode === 'update' && <TextField draft={draft} field="code" label="Kode Tiket" disabled onChange={onDraftChange} />}
        {mode === 'create' && (
          <SelectField
            draft={draft}
            field="orderCode"
            label="Order"
            options={data.orders.map((order) => `${order.code} - ${order.customer} - ${order.event}`)}
            onChange={onDraftChange}
          />
        )}
        {mode === 'create' && (
          <SelectField
            draft={draft}
            field="category"
            label="Kategori Tiket"
            options={data.ticketCategories.map((category) => category.name)}
            onChange={onDraftChange}
          />
        )}
        {mode === 'create' && (
          <SelectField
            draft={draft}
            field="seatCode"
            label="Kursi"
            options={['-', ...data.seats.filter((seat) => seat.status === 'Tersedia').map(getSeatCode)]}
            onChange={onDraftChange}
          />
        )}
        <SelectField
          draft={draft}
          field="status"
          label="Status"
          options={['Aktif', 'Dipakai', 'Dibatalkan']}
          onChange={onDraftChange}
        />
      </>
    )
  }

  if (kind === 'orders') {
    return (
      <>
        <TextField draft={draft} field="code" label="Order ID" disabled onChange={onDraftChange} />
        <SelectField
          draft={draft}
          field="status"
          label="Payment Status"
          options={['Menunggu', 'Dibayar', 'Dibatalkan']}
          onChange={onDraftChange}
        />
      </>
    )
  }

  return (
    <>
      <TextField draft={draft} field="code" label="Kode Promo" onChange={onDraftChange} />
      <TextField draft={draft} field="title" label="Nama Promosi" onChange={onDraftChange} />
      <SelectField
        draft={draft}
        field="discountType"
        label="Tipe Diskon"
        options={['Persentase', 'Nominal']}
        onChange={onDraftChange}
      />
      <TextField draft={draft} field="value" label="Nilai Diskon" onChange={onDraftChange} />
      <TextField draft={draft} field="startDate" label="Tanggal Mulai" type="date" onChange={onDraftChange} />
      <TextField draft={draft} field="endDate" label="Tanggal Berakhir" type="date" onChange={onDraftChange} />
      <TextField draft={draft} field="usageLimit" label="Batas Penggunaan" type="number" onChange={onDraftChange} />
    </>
  )
}

function TextField({
  draft,
  field,
  label,
  type = 'text',
  required = true,
  disabled = false,
  onChange,
}: {
  draft: ResourceDraft
  field: string
  label: string
  type?: string
  required?: boolean
  disabled?: boolean
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <Field label={label}>
      <input
        disabled={disabled}
        required={required}
        type={type}
        value={draft[field] ?? ''}
        onChange={(event) => onChange({ ...draft, [field]: event.target.value })}
      />
    </Field>
  )
}

function SelectField({
  draft,
  field,
  label,
  options,
  onChange,
}: {
  draft: ResourceDraft
  field: string
  label: string
  options: string[]
  onChange: (draft: ResourceDraft) => void
}) {
  return (
    <Field label={label}>
      <select required value={draft[field] ?? ''} onChange={(event) => onChange({ ...draft, [field]: event.target.value })}>
        <option value="">Pilih</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}

function getSeatCode(seat: { section: string; row: string; number: string }) {
  return `${seat.section}-${seat.row}-${seat.number}`
}
