import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import type { EventItem, Promotion, TicketCategory, Venue, Seat } from '../types'
import { formatCurrency } from '../utils/format'

type CheckoutPageProps = {
  event: EventItem
  venues: Venue[]
  seats: Seat[]
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
  venues,
  seats,
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
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  
  const venueData = venues.find(v => v.name === event.venue)
  const isReservedSeating = venueHasReservedSeating(venueData)
  const availableSeats = isReservedSeating 
    ? seats.filter(s => s.venue === event.venue && s.status === 'Tersedia')
    : []
  
  const sections = [...new Set(availableSeats.map(s => s.section))].sort()
  
  const selectedCategory = categories.find((c) => c.name === category)
  const basePrice = selectedCategory?.price ?? event.price
  const subtotal = basePrice * (quantity + (isReservedSeating ? selectedSeats.length : 0))
  
  const promo = promotions.find((p) => p.code.toLowerCase() === promoCode.trim().toLowerCase())
  const discount = promo
    ? promo.discountType === 'Persentase'
      ? Math.round((subtotal * parseInt(promo.value)) / 100)
      : parseInt(promo.value.replace(/\D/g, ''))
    : 0
  const total = Math.max(0, subtotal - discount)

  const toggleSeat = (seatCode: string) => {
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatCode))
    } else if (selectedSeats.length < quantity) {
      setSelectedSeats([...selectedSeats, seatCode])
    }
  }

  const getSeatDisplay = (seat: { section: string; row: string; number: string }) => {
    return `${seat.row}${seat.number}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Artis</span>
              <span className="font-medium">{event.artist}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Venue</span>
              <span className="font-medium">{event.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Tanggal & Waktu</span>
              <span className="font-medium">{event.date}, {event.time}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pemesanan Tiket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Kategori Tiket</Label>
                <Select value={category} onValueChange={(val) => { onCategoryChange(val); setSelectedSeats([]); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name} - {formatCurrency(cat.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isReservedSeating && category && availableSeats.length > 0 && (
                <div className="grid gap-2">
                  <Label>Pilih Kursi ({selectedSeats.length}/{quantity})</Label>
                  <div className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
                    <div className="text-center mb-4">
                      <span className="text-xs font-bold text-[#64748b] bg-[#f8fafc] px-4 py-1.5 rounded-lg uppercase tracking-wider">Stage</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {sections.map(section => {
                        const sectionSeats = availableSeats.filter(s => s.section === section)
                        const rows = [...new Set(sectionSeats.map(s => s.row))].sort()
                        
                        return (
                          <div key={section} className="text-center">
                            <div className="text-xs text-[#64748b] mb-3 font-semibold uppercase">Section {section}</div>
                            <div className="flex flex-col gap-2">
                              {rows.map(row => {
                                const rowSeats = sectionSeats.filter(s => s.row === row).sort((a, b) => a.number.localeCompare(b.number))
                                return (
                                  <div key={row} className="flex justify-center gap-1.5 flex-wrap">
                                    {rowSeats.map(seat => {
                                      const seatCode = `${seat.section}-${seat.row}-${seat.number}`
                                      const isSelected = selectedSeats.includes(seatCode)
                                      return (
                                        <button
                                          key={seatCode}
                                          type="button"
                                          onClick={() => toggleSeat(seatCode)}
                                          disabled={!isSelected && selectedSeats.length >= quantity}
                                          className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                                            isSelected 
                                              ? 'bg-[#0f172a] text-white shadow-md' 
                                              : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0f172a]'
                                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                          {getSeatDisplay(seat)}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-5 pt-4 border-t border-[#e2e8f0] flex gap-8 text-xs justify-center">
                      <span className="flex items-center gap-2 text-[#64748b]">
                        <span className="w-5 h-5 rounded-lg bg-[#f8fafc]"></span> Tersedia
                      </span>
                      <span className="flex items-center gap-2 text-[#64748b]">
                        <span className="w-5 h-5 rounded-lg bg-[#0f172a]"></span> Dipilih
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {isReservedSeating && category && availableSeats.length === 0 && (
                <div className="bg-[#fef3c7] border border-[#f59e0b] rounded-lg p-3 text-sm text-[#92400e]">
                  Tidak ada kursi tersedia untuk venue ini.
                </div>
              )}

              <div className="grid gap-2">
                <Label>Jumlah Tiket</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => { onQuantityChange(parseInt(e.target.value) || 1); setSelectedSeats([]); }}
                />
                <p className="text-xs text-[#64748b]">Maximum 10 tiket per transaksi</p>
              </div>

              <div className="grid gap-2">
                <Label>Kode Promo (Opsional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => onPromoChange(e.target.value)}
                    placeholder="Masukkan kode promo"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#64748b]">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {promo && (
                  <div className="flex justify-between text-sm text-[#22c55e] mb-2">
                    <span>Diskon ({promo.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">
                Buat Pesanan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function venueHasReservedSeating(venue: Venue | undefined) {
  if (!venue) return false
  if ('hasReservedSeating' in venue) return venue.hasReservedSeating
  const legacyVenue = venue as Venue & { seatingType?: string }
  return legacyVenue.seatingType !== 'Festival'
}
