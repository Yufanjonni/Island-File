import type { FormEvent, ReactNode } from 'react'
import { BrandPanel } from '../components/BrandPanel'
import { Field } from '../components/Field'
import { roleLabels } from '../data/mockData'
import type { RegisterForm, Role } from '../types'

type LoginForm = {
  username: string
  password: string
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <BrandPanel />
      {children}
    </div>
  )
}

type LoginPanelProps = {
  form: LoginForm
  onChange: (value: LoginForm) => void
  onSubmit: (event: FormEvent) => void
  onRegister: () => void
}

export function LoginPanel({ form, onChange, onSubmit, onRegister }: LoginPanelProps) {
  return (
    <section className="auth-card">
      <h2>Masuk ke Akun Anda</h2>
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label="Username atau Email">
          <input
            required
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
            placeholder="Masukkan username atau email"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
            placeholder="Masukkan password"
          />
        </Field>
        <button className="primary-button" type="submit">
          Masuk
        </button>
      </form>
      <p className="switch-text">
        Belum punya akun?{' '}
        <button type="button" onClick={onRegister}>
          Daftar sekarang
        </button>
      </p>
    </section>
  )
}

type RolePanelProps = {
  onChoose: (role: Role) => void
  onLogin: () => void
}

export function RolePanel({ onChoose, onLogin }: RolePanelProps) {
  return (
    <section className="auth-card">
      <h2>Jenis Pengguna</h2>
      <div className="role-list">
        <button type="button" onClick={() => onChoose('customer')}>
          <strong>Pelanggan</strong>
          <span>Beli dan kelola tiket acara</span>
        </button>
        <button type="button" onClick={() => onChoose('organizer')}>
          <strong>Penyelenggara</strong>
          <span>Buat dan kelola acara serta venue</span>
        </button>
        <button type="button" onClick={() => onChoose('admin')}>
          <strong>Admin</strong>
          <span>Kelola data aplikasi</span>
        </button>
      </div>
      <p className="switch-text">
        Sudah punya akun?{' '}
        <button type="button" onClick={onLogin}>
          Login di sini
        </button>
      </p>
    </section>
  )
}

type RegisterPanelProps = {
  form: RegisterForm
  role: Role
  onBack: () => void
  onChange: (value: RegisterForm) => void
  onLogin: () => void
  onSubmit: (event: FormEvent) => void
}

export function RegisterPanel({ form, role, onBack, onChange, onLogin, onSubmit }: RegisterPanelProps) {
  return (
    <section className="auth-card register-card">
      <button className="back-button" type="button" onClick={onBack}>
        Kembali
      </button>
      <h2>Daftar sebagai {roleLabels[role]}</h2>
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label={role === 'organizer' ? 'Nama Penyelenggara' : 'Nama Lengkap'}>
          <input
            required
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder={role === 'organizer' ? 'Masukkan nama penyelenggara' : 'Masukkan nama lengkap'}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
            placeholder="Masukkan email"
          />
        </Field>
        <Field label="Nomor Telepon">
          <input
            required
            value={form.phone}
            onChange={(event) => onChange({ ...form, phone: event.target.value })}
            placeholder="Masukkan nomor telepon"
          />
        </Field>
        <Field label="Username">
          <input
            required
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
            placeholder="Pilih username"
          />
        </Field>
        <Field label="Password">
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
            placeholder="Minimal 6 karakter"
          />
        </Field>
        <Field label="Konfirmasi Password">
          <input
            required
            minLength={6}
            type="password"
            value={form.confirmPassword}
            onChange={(event) => onChange({ ...form, confirmPassword: event.target.value })}
            placeholder="Konfirmasi password"
          />
        </Field>
        <label className="checkbox-row">
          <input
            checked={form.agree}
            type="checkbox"
            onChange={(event) => onChange({ ...form, agree: event.target.checked })}
          />
          <span>Saya setuju dengan Syarat & Ketentuan</span>
        </label>
        <button className="primary-button" type="submit">
          Daftar
        </button>
      </form>
      <p className="switch-text">
        Sudah punya akun?{' '}
        <button type="button" onClick={onLogin}>
          Login di sini
        </button>
      </p>
    </section>
  )
}
