import type { FormEvent } from 'react'
import { ArrowUpRight, Calendar, ChevronRight, MapPin, Megaphone, Tag, Ticket, TrendingUp, Users, WalletCards } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { StatCards } from '../components/StatCards'
import { roleLabels } from '../data/mockData'
import type { AppData, EventItem, Page, Role, User } from '../types'
import { formatCurrency } from '../utils/format'

export type ProfileForm = {
  name: string
  phone: string
  contactEmail: string
}

export type PasswordForm = {
  currentPassword: string
  nextPassword: string
  confirmPassword: string
}

type DashboardPageProps = {
  user: User
  data: AppData
  userCount: number
  onProfile: () => void
  onNavigate: (page: Page) => void
}

export function DashboardPage({ user, data, userCount, onProfile, onNavigate }: DashboardPageProps) {
  const stats = getDashboardStats(user, data, userCount)

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-[var(--primary)] p-6 text-[var(--primary-foreground)] shadow-[var(--shadow-md)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">
              Dashboard {roleLabels[user.role]}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{user.name}</h1>
            <p className="mt-2 text-sm text-white/70">{getDashboardSubtitle(user.role, data, user)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role === 'admin' && (
              <>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('venues')}>
                  Kelola Venue
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('promotions')}>
                  Kelola Promosi
                </Button>
              </>
            )}
            {user.role === 'organizer' && (
              <>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('myEvents')}>
                  Kelola Acara
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onNavigate('venues')}>
                  Venue
                </Button>
              </>
            )}
            {user.role === 'customer' && (
              <Button variant="secondary" size="sm" onClick={() => onNavigate('events')}>
                Lihat Event
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onProfile}>
              Profil Saya
            </Button>
          </div>
        </div>
      </div>

      <StatCards stats={stats} />

      {user.role === 'admin' && <AdminDashboardDetails data={data} onNavigate={onNavigate} />}
      {user.role === 'organizer' && <OrganizerDashboardDetails data={data} user={user} onNavigate={onNavigate} />}
      {user.role === 'customer' && <CustomerDashboardDetails data={data} user={user} onNavigate={onNavigate} />}
    </div>
  )
}

function AdminDashboardDetails({ data, onNavigate }: { data: AppData; onNavigate: (page: Page) => void }) {
  const reservedVenues = data.venues.filter((venue) => venue.seatingType !== 'Festival').length
  const largestCapacity = Math.max(...data.venues.map((venue) => venue.capacity), 0)
  const percentagePromos = data.promotions.filter((promo) => promo.discountType === 'Persentase')
  const nominalPromos = data.promotions.filter((promo) => promo.discountType === 'Nominal')
  const promoUsage = data.orders.filter((order) => order.promoCode !== '-').length

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DashboardInfoCard
        title="Infrastruktur Venue"
        accentClassName="bg-blue-500"
        actionLabel="Kelola Venue"
        onAction={() => onNavigate('venues')}
        rows={[
          ['Total Venue Terdaftar', `${data.venues.length} Lokasi`],
          ['Reserved Seating', `${reservedVenues} Venue`],
          ['Kapasitas Terbesar', `${largestCapacity.toLocaleString('id-ID')} Kursi`],
        ]}
      />
      <DashboardInfoCard
        title="Marketing & Promosi"
        accentClassName="bg-orange-500"
        actionLabel="Kelola Promosi"
        onAction={() => onNavigate('promotions')}
        rows={[
          ['Promo Persentase', `${percentagePromos.length} Aktif`],
          ['Promo Potongan Nominal', `${nominalPromos.length} Aktif`],
          ['Total Penggunaan', `${promoUsage} Kali`],
        ]}
      />
    </div>
  )
}

function OrganizerDashboardDetails({
  data,
  user,
  onNavigate,
}: {
  data: AppData
  user: User
  onNavigate: (page: Page) => void
}) {
  const eventTitles = data.events.filter((event) => event.organizerId === user.id).map((event) => event.title)
  const events = data.events.filter((event) => eventTitles.includes(event.title)).slice(0, 3)

  return (
    <Card className="overflow-hidden border-0 shadow-[var(--shadow-md)]">
      <CardHeader className="flex-row items-start justify-between space-y-0 bg-slate-50/80">
        <div>
          <CardTitle className="text-base">Performa Acara</CardTitle>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Status acara yang Anda kelola</p>
        </div>
        <Button variant="link" size="sm" onClick={() => onNavigate('myEvents')}>
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 p-5">
        {events.map((event) => (
          <EventSummaryRow key={event.id} event={event} label="Live" />
        ))}
      </CardContent>
    </Card>
  )
}

function CustomerDashboardDetails({
  data,
  user,
  onNavigate,
}: {
  data: AppData
  user: User
  onNavigate: (page: Page) => void
}) {
  const tickets = data.tickets.filter((ticket) => ticket.customer === user.name && ticket.status === 'Aktif').slice(0, 3)
  const events = tickets
    .map((ticket) => data.events.find((event) => event.title === ticket.event))
    .filter((event): event is EventItem => Boolean(event))

  return (
    <Card className="overflow-hidden border-0 shadow-[var(--shadow-md)]">
      <CardHeader className="flex-row items-start justify-between space-y-0 bg-slate-50/80">
        <div>
          <CardTitle className="text-base">Tiket Mendatang</CardTitle>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Tiket pertunjukan yang akan datang</p>
        </div>
        <Button variant="link" size="sm" onClick={() => onNavigate('myTickets')}>
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent className="grid gap-2 p-5">
        {events.map((event) => (
          <EventSummaryRow key={event.id} event={event} label={event.category} />
        ))}
      </CardContent>
    </Card>
  )
}

function DashboardInfoCard({
  title,
  rows,
  accentClassName,
  actionLabel,
  onAction,
}: {
  title: string
  rows: Array<[string, string]>
  accentClassName: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-[var(--shadow-md)]">
      <div className={`h-1.5 ${accentClassName}`} />
      <CardHeader className="flex-row items-start justify-between space-y-0 bg-slate-50/80">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Ringkasan operasional</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-3 text-sm">
              <span className="text-[var(--muted-foreground)]">{label}</span>
              <span className="font-semibold text-[var(--foreground)]">{value}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

function EventSummaryRow({ event, label }: { event: EventItem; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--border)] bg-white px-3 py-3 shadow-[var(--shadow-sm)] hover:bg-slate-50">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{event.title}</p>
          <span className="rounded-full bg-[var(--success-light)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--success)]">
            {label}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <span>{event.date}</span>
          <span>{event.venue}</span>
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
    </div>
  )
}

type ProfilePageProps = {
  user: User
  form: ProfileForm
  passwordForm: PasswordForm
  passwordOpen: boolean
  onBack: () => void
  onFormChange: (value: ProfileForm) => void
  onPasswordChange: (value: PasswordForm) => void
  onSubmit: (event: FormEvent) => void
  onPasswordSubmit: (event: FormEvent) => void
  onOpenPassword: () => void
  onClosePassword: () => void
}

export function ProfilePage({
  user,
  form,
  passwordForm,
  passwordOpen,
  onBack,
  onFormChange,
  onPasswordChange,
  onSubmit,
  onPasswordSubmit,
  onOpenPassword,
  onClosePassword,
}: ProfilePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Kembali
        </Button>
      </div>
      <h1 className="text-2xl font-bold">Edit Profil</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>Nama</Label>
              <div className="font-medium">{user.name}</div>
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <div className="font-medium">{roleLabels[user.role]}</div>
            </div>
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <div className="font-medium">{user.email}</div>
            </div>
            <div className="grid gap-1.5">
              <Label>Nomor Telepon</Label>
              <div className="font-medium">{user.phone}</div>
            </div>
            <div className="grid gap-1.5">
              <Label>Username</Label>
              <div className="font-medium">{user.username}</div>
            </div>
            {user.contactEmail && (
              <div className="grid gap-1.5">
                <Label>Email Kontak</Label>
                <div className="font-medium">{user.contactEmail}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perbarui Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <ProfileFields role={user.role} form={form} onChange={onFormChange} />
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input disabled value={user.username} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={onOpenPassword}>
                  Ubah Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={passwordOpen} onOpenChange={onClosePassword}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={onPasswordSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Password Saat Ini</Label>
              <Input
                id="current-password"
                required
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => onPasswordChange({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                required
                minLength={6}
                type="password"
                value={passwordForm.nextPassword}
                onChange={(e) => onPasswordChange({ ...passwordForm, nextPassword: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                required
                minLength={6}
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => onPasswordChange({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <Button type="submit">Simpan Password</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProfileFields({
  role,
  form,
  onChange,
}: {
  role: Role
  form: ProfileForm
  onChange: (value: ProfileForm) => void
}) {
  if (role === 'organizer') {
    return (
      <>
        <div className="grid gap-2">
          <Label>Nama Penyelenggara</Label>
          <Input 
            required 
            value={form.name} 
            onChange={(e) => onChange({ ...form, name: e.target.value })} 
          />
        </div>
        <div className="grid gap-2">
          <Label>Email Kontak</Label>
          <Input
            required
            type="email"
            value={form.contactEmail}
            onChange={(e) => onChange({ ...form, contactEmail: e.target.value })}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="grid gap-2">
        <Label>Nama Lengkap</Label>
        <Input 
          required 
          value={form.name} 
          onChange={(e) => onChange({ ...form, name: e.target.value })} 
        />
      </div>
      <div className="grid gap-2">
        <Label>Nomor Telepon</Label>
        <Input 
          required 
          value={form.phone} 
          onChange={(e) => onChange({ ...form, phone: e.target.value })} 
        />
      </div>
    </>
  )
}

function getDashboardSubtitle(role: Role, data: AppData, user: User) {
  if (role === 'admin') return 'Pantau dan kelola platform TikTakTuk'
  if (role === 'organizer') {
    const eventCount = data.events.filter((event) => event.organizerId === user.id).length
    return `Kelola ${eventCount} acara aktif Anda`
  }
  const eventCount = data.events.length
  return `${eventCount} acara menarik menunggu Anda`
}

function getDashboardStats(user: User, data: AppData, userCount: number) {
  const revenue = data.orders.reduce((total, order) => total + order.total, 0)

  if (user.role === 'admin') {
    return [
      {
        label: 'Total Pengguna',
        value: userCount.toLocaleString('id-ID'),
        description: 'Pengguna aktif',
        icon: <Users className="h-5 w-5" />,
        iconClassName: 'bg-blue-50 text-blue-600',
      },
      {
        label: 'Total Acara',
        value: String(data.events.length),
        description: 'Bulan ini',
        icon: <Calendar className="h-5 w-5" />,
        iconClassName: 'bg-green-50 text-green-600',
      },
      {
        label: 'Omzet Platform',
        value: formatCurrency(revenue),
        description: 'Gross volume',
        icon: <TrendingUp className="h-5 w-5" />,
        iconClassName: 'bg-purple-50 text-purple-600',
      },
      {
        label: 'Promosi Aktif',
        value: String(data.promotions.length),
        description: 'Running campaigns',
        icon: <Tag className="h-5 w-5" />,
        iconClassName: 'bg-orange-50 text-orange-600',
      },
    ]
  }

  if (user.role === 'organizer') {
    const eventTitles = data.events.filter((event) => event.organizerId === user.id).map((event) => event.title)
    const orders = data.orders.filter((order) => eventTitles.includes(order.event))
    const ticketsSold = data.tickets.filter((ticket) => eventTitles.includes(ticket.event)).length
    const venueCount = new Set(data.events.filter((event) => event.organizerId === user.id).map((event) => event.venue)).size
    return [
      {
        label: 'Acara Aktif',
        value: String(eventTitles.length),
        description: 'Dalam koordinasi',
        icon: <Calendar className="h-5 w-5" />,
        iconClassName: 'bg-blue-50 text-blue-600',
      },
      {
        label: 'Tiket Terjual',
        value: ticketsSold.toLocaleString('id-ID'),
        description: 'Total terjual',
        icon: <Ticket className="h-5 w-5" />,
        iconClassName: 'bg-green-50 text-green-600',
      },
      {
        label: 'Revenue',
        value: formatCurrency(orders.reduce((total, order) => total + order.total, 0)),
        description: 'Bulan ini',
        icon: <TrendingUp className="h-5 w-5" />,
        iconClassName: 'bg-purple-50 text-purple-600',
      },
      {
        label: 'Venue Mitra',
        value: String(venueCount),
        description: 'Lokasi aktif',
        icon: <MapPin className="h-5 w-5" />,
        iconClassName: 'bg-orange-50 text-orange-600',
      },
    ]
  }

  const orders = data.orders.filter((order) => order.customer === user.name)
  const tickets = data.tickets.filter((ticket) => ticket.customer === user.name)
  return [
    {
      label: 'Tiket Aktif',
      value: String(tickets.filter((ticket) => ticket.status === 'Aktif').length),
      description: 'Siap digunakan',
      icon: <Ticket className="h-5 w-5" />,
      iconClassName: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Acara Diikuti',
      value: String(new Set(tickets.map((ticket) => ticket.event)).size),
      description: 'Total pengalaman',
      icon: <Calendar className="h-5 w-5" />,
      iconClassName: 'bg-green-50 text-green-600',
    },
    {
      label: 'Kode Promo',
      value: String(data.promotions.length),
      description: 'Tersedia untuk Anda',
      icon: <Megaphone className="h-5 w-5" />,
      iconClassName: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Belanja',
      value: formatCurrency(orders.reduce((total, order) => total + order.total, 0)),
      description: 'Bulan ini',
      icon: <WalletCards className="h-5 w-5" />,
      iconClassName: 'bg-orange-50 text-orange-600',
    },
  ]
}
