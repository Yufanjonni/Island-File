import { ArrowLeft, Ticket } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { roleLabels } from '../data/mockData'
import type { RegisterForm, Role } from '../types'

type LoginForm = {
  username: string
  password: string
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-12 items-center">
        {children}
      </div>
    </div>
  )
}

export function BrandSide() {
  return (
    <div className="hidden md:flex flex-col gap-6 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg">
        <Ticket className="h-8 w-8" />
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">TikTakTuk</h1>
        <p className="text-lg text-[var(--muted-foreground)] leading-relaxed max-w-md">
          Platform pemesanan tiket event terpercaya. Temukan dan pesan tiket acara favorit Anda dengan mudah.
        </p>
      </div>
    </div>
  )
}

type LoginPanelProps = {
  form: LoginForm
  onChange: (value: LoginForm) => void
  onSubmit: (event: React.FormEvent) => void
  onRegister: () => void
}

export function LoginPanel({ form, onChange, onSubmit, onRegister }: LoginPanelProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Masuk ke Akun</CardTitle>
        <CardDescription>Masukkan username dan password untuk login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username atau Email</Label>
            <Input
              id="username"
              required
              value={form.username}
              onChange={(e) => onChange({ ...form, username: e.target.value })}
              placeholder="Masukkan username atau email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              placeholder="Masukkan password"
            />
          </div>
          <Button type="submit" className="w-full">Masuk</Button>
        </form>
        <div className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Belum punya akun?{' '}
          <button type="button" onClick={onRegister} className="text-[var(--primary)] hover:underline font-medium">
            Daftar sekarang
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

type RolePanelProps = {
  onChoose: (role: Role) => void
  onLogin: () => void
}

export function RolePanel({ onChoose, onLogin }: RolePanelProps) {
  const roles = [
    { role: 'customer', title: 'Pelanggan', desc: 'Beli dan kelola tiket acara' },
    { role: 'organizer', title: 'Penyelenggara', desc: 'Buat dan kelola acara serta venue' },
    { role: 'admin', title: 'Admin', desc: 'Kelola data aplikasi' },
  ] as const

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Jenis Pengguna</CardTitle>
        <CardDescription>Pilih jenis akun yang Anda inginkan</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {roles.map((r) => (
          <Button
            key={r.role}
            variant="outline"
            className="h-auto py-4 justify-start text-left gap-2"
            onClick={() => onChoose(r.role)}
          >
            <div className="flex flex-col items-start">
              <span className="font-semibold">{r.title}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{r.desc}</span>
            </div>
          </Button>
        ))}
        <div className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Sudah punya akun?{' '}
          <button type="button" onClick={onLogin} className="text-[var(--primary)] hover:underline font-medium">
            Login di sini
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

type RegisterPanelProps = {
  form: RegisterForm
  role: Role
  onBack: () => void
  onChange: (value: RegisterForm) => void
  onLogin: () => void
  onSubmit: (event: React.FormEvent) => void
}

export function RegisterPanel({ form, role, onBack, onChange, onLogin, onSubmit }: RegisterPanelProps) {
  const nameLabel = role === 'organizer' ? 'Nama Penyelenggara' : role === 'admin' ? 'Nama Admin' : 'Nama Lengkap'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <Button variant="ghost" size="sm" onClick={onBack} className="w-fit -ml-2 gap-1">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <CardTitle className="text-2xl">Daftar sebagai {roleLabels[role]}</CardTitle>
        <CardDescription>Isi data di bawah untuk membuat akun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{nameLabel}</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder={`Masukkan ${nameLabel.toLowerCase()}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              required
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              placeholder="Masukkan email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
              placeholder="Masukkan nomor telepon"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              required
              value={form.username}
              onChange={(e) => onChange({ ...form, username: e.target.value })}
              placeholder="Pilih username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              minLength={6}
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              required
              minLength={6}
              type="password"
              value={form.confirmPassword}
              onChange={(e) => onChange({ ...form, confirmPassword: e.target.value })}
              placeholder="Konfirmasi password"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="agree"
              type="checkbox"
              checked={form.agree}
              onChange={(e) => onChange({ ...form, agree: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <label htmlFor="agree" className="text-sm text-[var(--muted-foreground)]">
              Saya setuju dengan Syarat & Ketentuan
            </label>
          </div>
          <Button type="submit" className="w-full">Daftar</Button>
        </form>
        <div className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Sudah punya akun?{' '}
          <button type="button" onClick={onLogin} className="text-[var(--primary)] hover:underline font-medium">
            Login di sini
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
