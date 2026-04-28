import * as Label from '@radix-ui/react-label'
import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

type Role = 'admin' | 'organizer' | 'customer'
type Page = 'login' | 'registerRole' | 'registerForm' | 'dashboard' | 'profile'

type User = {
  id: number
  role: Role
  name: string
  email: string
  phone: string
  username: string
  password: string
}

type RegisterForm = {
  name: string
  email: string
  phone: string
  username: string
  password: string
  confirmPassword: string
  agree: boolean
}

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  organizer: 'Penyelenggara',
  customer: 'Pelanggan',
}

const initialUsers: User[] = [
  {
    id: 1,
    role: 'admin',
    name: 'Admin Tiketin',
    email: 'admin@gmail.com',
    phone: '081200000001',
    username: 'admin',
    password: 'admin123',
  },
  {
    id: 2,
    role: 'organizer',
    name: 'Nusantara Organizer',
    email: 'organizer@gmail.com',
    phone: '081200000002',
    username: 'organizer',
    password: 'organizer123',
  },
  {
    id: 3,
    role: 'customer',
    name: 'Ratna Kirana',
    email: 'customer@gmail.com',
    phone: '081200000003',
    username: 'customer',
    password: 'customer123',
  },
]

const emptyRegisterForm: RegisterForm = {
  name: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  agree: false,
}

function App() {
  const [page, setPage] = useState<Page>('login')
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [activeUserId, setActiveUserId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('customer')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegisterForm)
  const [message, setMessage] = useState('')

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId) ?? null,
    [activeUserId, users],
  )

  function navigate(nextPage: Page) {
    setPage(nextPage)
    setMessage('')
  }

  function chooseRole(role: Role) {
    setSelectedRole(role)
    setRegisterForm(emptyRegisterForm)
    navigate('registerForm')
  }

  function handleLogin(event: FormEvent) {
    event.preventDefault()
    const foundUser = users.find(
      (user) =>
        (user.username.toLowerCase() === loginForm.username.trim().toLowerCase() ||
          user.email.toLowerCase() === loginForm.username.trim().toLowerCase()) &&
        user.password === loginForm.password,
    )

    if (!foundUser) {
      setMessage('Email, username, atau password salah.')
      return
    }

    setActiveUserId(foundUser.id)
    setLoginForm({ username: '', password: '' })
    setPage('dashboard')
    setMessage('')
  }

  function handleRegister(event: FormEvent) {
    event.preventDefault()
    const validationMessage = validateRegister(registerForm, users)

    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: Date.now(),
        role: selectedRole,
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        phone: registerForm.phone.trim(),
        username: registerForm.username.trim(),
        password: registerForm.password,
      },
    ])
    setRegisterForm(emptyRegisterForm)
    setPage('login')
    setMessage('Akun berhasil dibuat. Silakan login.')
  }

  function logout() {
    setActiveUserId(null)
    setPage('login')
    setMessage('')
  }

  return (
    <main className="app-shell">
      <TopNav activeUser={activeUser} page={page} onNavigate={navigate} onLogout={logout} />

      <section className="page-area">
        {message && <p className={message.includes('berhasil') ? 'message success' : 'message error'}>{message}</p>}

        {!activeUser && page === 'login' && (
          <AuthLayout>
            <LoginPanel
              form={loginForm}
              onChange={setLoginForm}
              onSubmit={handleLogin}
              onRegister={() => navigate('registerRole')}
            />
          </AuthLayout>
        )}

        {!activeUser && page === 'registerRole' && (
          <AuthLayout>
            <RolePanel onChoose={chooseRole} onLogin={() => navigate('login')} />
          </AuthLayout>
        )}

        {!activeUser && page === 'registerForm' && (
          <AuthLayout>
            <RegisterPanel
              form={registerForm}
              role={selectedRole}
              onBack={() => navigate('registerRole')}
              onChange={setRegisterForm}
              onLogin={() => navigate('login')}
              onSubmit={handleRegister}
            />
          </AuthLayout>
        )}

        {activeUser && page === 'dashboard' && <Dashboard user={activeUser} onProfile={() => navigate('profile')} />}

        {activeUser && page === 'profile' && <Profile user={activeUser} onBack={() => navigate('dashboard')} />}
      </section>
    </main>
  )
}

function TopNav({
  activeUser,
  page,
  onNavigate,
  onLogout,
}: {
  activeUser: User | null
  page: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
}) {
  return (
    <header className="top-nav">
      <button className="nav-brand" type="button" onClick={() => onNavigate(activeUser ? 'dashboard' : 'login')}>
        Tiketin
      </button>

      <nav className="nav-menu" aria-label="Navigasi utama">
        {!activeUser ? (
          <>
            <button className={page === 'login' ? 'active' : ''} type="button" onClick={() => onNavigate('login')}>
              Login
            </button>
            <button
              className={page === 'registerRole' || page === 'registerForm' ? 'active' : ''}
              type="button"
              onClick={() => onNavigate('registerRole')}
            >
              Registrasi
            </button>
          </>
        ) : (
          <>
            <button className={page === 'dashboard' ? 'active' : ''} type="button" onClick={() => onNavigate('dashboard')}>
              Dashboard
            </button>
            <button className={page === 'profile' ? 'active' : ''} type="button" onClick={() => onNavigate('profile')}>
              Profile
            </button>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  )
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="brand-side" aria-label="Tiketin">
        <div className="app-logo">TT</div>
        <h1>Tiketin</h1>
      </div>
      {children}
    </div>
  )
}

function LoginPanel({
  form,
  onChange,
  onSubmit,
  onRegister,
}: {
  form: { username: string; password: string }
  onChange: (value: { username: string; password: string }) => void
  onSubmit: (event: FormEvent) => void
  onRegister: () => void
}) {
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

function RolePanel({ onChoose, onLogin }: { onChoose: (role: Role) => void; onLogin: () => void }) {
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
          <span>Kelola data sistem</span>
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

function RegisterPanel({
  form,
  role,
  onBack,
  onChange,
  onLogin,
  onSubmit,
}: {
  form: RegisterForm
  role: Role
  onBack: () => void
  onChange: (value: RegisterForm) => void
  onLogin: () => void
  onSubmit: (event: FormEvent) => void
}) {
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

function Dashboard({ user, onProfile }: { user: User; onProfile: () => void }) {
  return (
    <section className="dashboard-page">
      <div className="section-head">
        <div>
          <p>Dashboard {roleLabels[user.role]}</p>
          <h1>{user.name}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onProfile}>
          Profil Saya
        </button>
      </div>
      <ProfileInfo user={user} />
    </section>
  )
}

function Profile({ user, onBack }: { user: User; onBack: () => void }) {
  return (
    <section className="dashboard-page">
      <div className="section-head">
        <div>
          <p>Profile</p>
          <h1>{user.name}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onBack}>
          Dashboard
        </button>
      </div>
      <ProfileInfo user={user} />
    </section>
  )
}

function ProfileInfo({ user }: { user: User }) {
  return (
    <article className="profile-card">
      <dl>
        <div>
          <dt>Nama</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{roleLabels[user.role]}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Nomor Telepon</dt>
          <dd>{user.phone}</dd>
        </div>
        <div>
          <dt>Username</dt>
          <dd>{user.username}</dd>
        </div>
      </dl>
    </article>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <Label.Root>{label}</Label.Root>
      {children}
    </div>
  )
}

function validateRegister(form: RegisterForm, users: User[]) {
  if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.username.trim()) {
    return 'Seluruh field wajib diisi.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Email tidak valid.'
  }
  if (users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) {
    return 'Email sudah digunakan.'
  }
  if (users.some((user) => user.username.toLowerCase() === form.username.trim().toLowerCase())) {
    return 'Username sudah digunakan.'
  }
  if (form.password.length < 6) return 'Password minimal 6 karakter.'
  if (form.password !== form.confirmPassword) return 'Konfirmasi password tidak sama.'
  if (!form.agree) return 'Syarat & Ketentuan wajib disetujui.'
  return ''
}

export default App
