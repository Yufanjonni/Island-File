import type { FormEvent } from 'react'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import type { EventItem } from '../types'
import { formatCurrency } from '../utils/format'

type CheckoutPageProps = {
  event: EventItem
  quantity: number
  onQuantityChange: (value: number) => void
  onSubmit: (event: FormEvent) => void
  onBack: () => void
}

export function CheckoutPage({ event, quantity, onQuantityChange, onSubmit, onBack }: CheckoutPageProps) {
  const safeQuantity = Math.max(1, quantity || 1)
  const total = event.price * safeQuantity

  return (
    <section className="content-page">
      <PageHeader
        eyebrow="Pesanan"
        title={event.title}
        action={
          <button className="secondary-button" type="button" onClick={onBack}>
            Kembali
          </button>
        }
      />
      <div className="checkout-layout">
        <article className="panel-card">
          <h2>Detail Event</h2>
          <dl className="detail-list">
            <Info label="Artis" value={event.artist} />
            <Info label="Venue" value={event.venue} />
            <Info label="Tanggal" value={event.date} />
            <Info label="Harga" value={formatCurrency(event.price)} />
          </dl>
        </article>
        <section className="panel-card">
          <h2>Beli Tiket</h2>
          <form className="form-stack" onSubmit={onSubmit}>
            <Field label="Jumlah Tiket">
              <input
                min={1}
                max={event.quota}
                type="number"
                value={safeQuantity}
                onChange={(inputEvent) => onQuantityChange(Number(inputEvent.target.value))}
              />
            </Field>
            <div className="total-row">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button className="primary-button" type="submit">
              Buat Pesanan
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
