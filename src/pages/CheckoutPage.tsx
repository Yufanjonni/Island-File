import type { FormEvent } from 'react'
import { Field } from '../components/Field'
import { PageHeader } from '../components/PageHeader'
import type { EventItem, Promotion, TicketCategory } from '../types'
import { formatCurrency } from '../utils/format'

type CheckoutPageProps = {
  event: EventItem
  categories: TicketCategory[]
  promotions: Promotion[]
  quantity: number
  category: string
  promoCode: string
  onQuantityChange: (value: number) => void
  onCategoryChange: (value: string) => void
  onPromoChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
  onBack: () => void
}

export function CheckoutPage({
  event,
  categories,
  promotions,
  quantity,
  category,
  promoCode,
  onQuantityChange,
  onCategoryChange,
  onPromoChange,
  onSubmit,
  onBack,
}: CheckoutPageProps) {
  const safeQuantity = Math.max(1, quantity || 1)
  const selectedCategory = categories.find((item) => item.name === category) ?? categories[0]
  const price = selectedCategory?.price ?? event.price
  const subtotal = price * safeQuantity
  const selectedPromotion = promotions.find((item) => item.code.toLowerCase() === promoCode.trim().toLowerCase())
  const discount =
    selectedPromotion?.discountType === 'Persentase'
      ? Math.round((subtotal * Number.parseInt(selectedPromotion.value, 10)) / 100)
      : selectedPromotion
        ? Number.parseInt(selectedPromotion.value.replace(/\D/g, ''), 10)
        : 0
  const total = Math.max(0, subtotal - discount)

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
            <Info label="Waktu" value={event.time} />
            <Info label="Harga Mulai" value={formatCurrency(event.price)} />
          </dl>
        </article>
        <section className="panel-card">
          <h2>Beli Tiket</h2>
          <form className="form-stack" onSubmit={onSubmit}>
            <Field label="Kategori Tiket">
              <select required value={category} onChange={(eventInput) => onCategoryChange(eventInput.target.value)}>
                {categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Jumlah Tiket">
              <input
                min={1}
                max={10}
                type="number"
                value={safeQuantity}
                onChange={(inputEvent) => onQuantityChange(Number(inputEvent.target.value))}
              />
            </Field>
            <Field label="Kode Promo">
              <input value={promoCode} onChange={(inputEvent) => onPromoChange(inputEvent.target.value)} />
            </Field>
            <div className="total-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="total-row compact">
              <span>Diskon</span>
              <strong>{formatCurrency(discount)}</strong>
            </div>
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
