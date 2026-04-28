import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { TopNav } from './components/TopNav'
import { emptyRegisterForm, initialData, initialUsers } from './data/mockData'
import { AuthLayout, LoginPanel, RegisterPanel, RolePanel } from './pages/AuthPages'
import { CheckoutPage } from './pages/CheckoutPage'
import { FeaturePage } from './pages/FeaturePages'
import { DashboardPage, ProfilePage, type PasswordForm, type ProfileForm } from './pages/ProfilePages'
import type { AppData, EventItem, Page, RegisterForm, Role, Toast, User } from './types'
import { validateRegister } from './utils/validation'

type ResourceKind = keyof AppData

const emptyPasswordForm: PasswordForm = {
  currentPassword: '',
  nextPassword: '',
  confirmPassword: '',
}

function App() {
  const [page, setPage] = useState<Page>('login')
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [appData, setAppData] = useState<AppData>(initialData)
  const [activeUserId, setActiveUserId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>('customer')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegisterForm)
  const [profileForm, setProfileForm] = useState<ProfileForm>({ name: '', phone: '', contactEmail: '' })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null)
  const [checkoutQuantity, setCheckoutQuantity] = useState(1)
  const [toast, setToast] = useState<Toast | null>(null)

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId) ?? null,
    [activeUserId, users],
  )

  useEffect(() => {
    if (!activeUser) return
    setProfileForm({
      name: activeUser.name,
      phone: activeUser.phone,
      contactEmail: activeUser.contactEmail ?? activeUser.email,
    })
  }, [activeUser])

  function navigate(nextPage: Page) {
    setPage(nextPage)
    setToast(null)
  }

  function showToast(type: Toast['type'], text: string) {
    setToast({ type, text })
  }

  function chooseRole(role: Role) {
    setSelectedRole(role)
    setRegisterForm(emptyRegisterForm)
    navigate('registerForm')
  }

  function handleLogin(event: FormEvent) {
    event.preventDefault()
    const identity = loginForm.username.trim().toLowerCase()
    const foundUser = users.find(
      (user) =>
        (user.username.toLowerCase() === identity || user.email.toLowerCase() === identity) &&
        user.password === loginForm.password,
    )

    if (!foundUser) {
      showToast('error', 'Email, username, atau password salah.')
      return
    }

    setActiveUserId(foundUser.id)
    setLoginForm({ username: '', password: '' })
    setPage('dashboard')
    setToast(null)
  }

  function handleRegister(event: FormEvent) {
    event.preventDefault()
    const validationMessage = validateRegister(registerForm, users)

    if (validationMessage) {
      showToast('error', validationMessage)
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
        contactEmail: selectedRole === 'organizer' ? registerForm.email.trim() : undefined,
      },
    ])
    setRegisterForm(emptyRegisterForm)
    setPage('login')
    showToast('success', 'Akun berhasil dibuat. Silakan login.')
  }

  function logout() {
    setActiveUserId(null)
    setCheckoutEvent(null)
    setPage('login')
    setToast(null)
  }

  function handleProfileSubmit(event: FormEvent) {
    event.preventDefault()
    if (!activeUser) return

    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== activeUser.id) return user
        if (user.role === 'organizer') {
          return { ...user, name: profileForm.name.trim(), contactEmail: profileForm.contactEmail.trim() }
        }
        if (user.role === 'customer') {
          return { ...user, name: profileForm.name.trim(), phone: profileForm.phone.trim() }
        }
        return { ...user, name: profileForm.name.trim(), phone: profileForm.phone.trim() }
      }),
    )
    showToast('success', 'Profil berhasil diperbarui.')
  }

  function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    if (!activeUser) return

    if (passwordForm.currentPassword !== activeUser.password) {
      showToast('error', 'Password saat ini salah.')
      return
    }
    if (passwordForm.nextPassword.length < 6) {
      showToast('error', 'Password baru minimal 6 karakter.')
      return
    }
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      showToast('error', 'Konfirmasi password tidak sama.')
      return
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === activeUser.id ? { ...user, password: passwordForm.nextPassword } : user,
      ),
    )
    setPasswordOpen(false)
    setPasswordForm(emptyPasswordForm)
    showToast('success', 'Password berhasil diperbarui.')
  }

  function openCheckout(eventItem: EventItem) {
    setCheckoutEvent(eventItem)
    setCheckoutQuantity(1)
    navigate('checkout')
  }

  function submitCheckout(event: FormEvent) {
    event.preventDefault()
    if (!activeUser || !checkoutEvent) return
    const quantity = Math.max(1, checkoutQuantity)

    if (quantity > checkoutEvent.quota) {
      showToast('error', 'Jumlah tiket melebihi kuota.')
      return
    }

    const orderId = Date.now()
    setAppData((currentData) => ({
      ...currentData,
      events: currentData.events.map((item) =>
        item.id === checkoutEvent.id ? { ...item, quota: item.quota - quantity } : item,
      ),
      orders: [
        ...currentData.orders,
        {
          id: orderId,
          code: `ORD-${String(orderId).slice(-4)}`,
          customer: activeUser.name,
          event: checkoutEvent.title,
          quantity,
          total: checkoutEvent.price * quantity,
          status: 'Dibayar',
        },
      ],
      tickets: [
        ...currentData.tickets,
        {
          id: orderId,
          code: `TKT-${String(orderId).slice(-4)}`,
          customer: activeUser.name,
          event: checkoutEvent.title,
          status: 'Aktif',
        },
      ],
    }))
    setCheckoutEvent(null)
    setPage('myOrders')
    showToast('success', 'Pesanan berhasil dibuat.')
  }

  function addResource(kind: ResourceKind) {
    setAppData((currentData) => {
      const nextId = Date.now()
      if (kind === 'venues') {
        return {
          ...currentData,
          venues: [
            ...currentData.venues,
            {
              id: nextId,
              name: 'Venue Baru',
              city: 'Jakarta',
              address: 'Alamat venue baru',
              capacity: 400,
              seatingType: 'Campuran',
            },
          ],
        }
      }
      if (kind === 'events') {
        return {
          ...currentData,
          events: [
            ...currentData.events,
            {
              id: nextId,
              organizerId: activeUser?.id ?? 2,
              title: 'Event Baru',
              artist: 'Artis Baru',
              venue: currentData.venues[0]?.name ?? 'Venue Baru',
              date: '10 Juni 2026',
              price: 150000,
              quota: 100,
            },
          ],
        }
      }
      if (kind === 'artists') {
        return {
          ...currentData,
          artists: [...currentData.artists, { id: nextId, name: 'Artis Baru', genre: 'Pop', country: 'Indonesia' }],
        }
      }
      if (kind === 'seats') {
        return {
          ...currentData,
          seats: [
            ...currentData.seats,
            { id: nextId, venue: currentData.venues[0]?.name ?? 'Venue Baru', code: 'C-01', section: 'C', status: 'Tersedia' },
          ],
        }
      }
      if (kind === 'ticketCategories') {
        return {
          ...currentData,
          ticketCategories: [
            ...currentData.ticketCategories,
            { id: nextId, event: currentData.events[0]?.title ?? 'Event Baru', name: 'Regular', price: 150000, quota: 100 },
          ],
        }
      }
      if (kind === 'tickets') {
        return {
          ...currentData,
          tickets: [
            ...currentData.tickets,
            {
              id: nextId,
              code: `TKT-${String(nextId).slice(-4)}`,
              event: currentData.events[0]?.title ?? 'Event Baru',
              customer: 'Customer Baru',
              status: 'Aktif',
            },
          ],
        }
      }
      if (kind === 'orders') {
        return {
          ...currentData,
          orders: [
            ...currentData.orders,
            {
              id: nextId,
              code: `ORD-${String(nextId).slice(-4)}`,
              customer: 'Customer Baru',
              event: currentData.events[0]?.title ?? 'Event Baru',
              quantity: 1,
              total: 150000,
              status: 'Menunggu',
            },
          ],
        }
      }
      return {
        ...currentData,
        promotions: [
          ...currentData.promotions,
          { id: nextId, code: 'PROMO', title: 'Promosi Baru', discountType: 'Nominal', value: 'Rp25.000' },
        ],
      }
    })
    showToast('success', 'Data berhasil ditambahkan.')
  }

  function updateResource(kind: ResourceKind, id: number) {
    setAppData((currentData) => {
      if (kind === 'venues') {
        return { ...currentData, venues: currentData.venues.map((item) => (item.id === id ? { ...item, capacity: item.capacity + 25 } : item)) }
      }
      if (kind === 'events') {
        return { ...currentData, events: currentData.events.map((item) => (item.id === id ? { ...item, quota: item.quota + 10 } : item)) }
      }
      if (kind === 'artists') {
        return { ...currentData, artists: currentData.artists.map((item) => (item.id === id ? { ...item, genre: 'Pop Alternatif' } : item)) }
      }
      if (kind === 'seats') {
        return {
          ...currentData,
          seats: currentData.seats.map((item) =>
            item.id === id ? { ...item, status: item.status === 'Tersedia' ? 'Terisi' : 'Tersedia' } : item,
          ),
        }
      }
      if (kind === 'ticketCategories') {
        return {
          ...currentData,
          ticketCategories: currentData.ticketCategories.map((item) =>
            item.id === id ? { ...item, price: item.price + 25000 } : item,
          ),
        }
      }
      if (kind === 'tickets') {
        return {
          ...currentData,
          tickets: currentData.tickets.map((item) =>
            item.id === id ? { ...item, status: item.status === 'Aktif' ? 'Dipakai' : 'Aktif' } : item,
          ),
        }
      }
      if (kind === 'orders') {
        return {
          ...currentData,
          orders: currentData.orders.map((item) =>
            item.id === id ? { ...item, status: item.status === 'Menunggu' ? 'Dibayar' : 'Menunggu' } : item,
          ),
        }
      }
      return {
        ...currentData,
        promotions: currentData.promotions.map((item) => (item.id === id ? { ...item, value: 'Rp75.000' } : item)),
      }
    })
    showToast('success', 'Data berhasil diperbarui.')
  }

  function deleteResource(kind: ResourceKind, id: number) {
    setAppData((currentData) => ({
      ...currentData,
      [kind]: currentData[kind].filter((item) => item.id !== id),
    }))
    showToast('success', 'Data berhasil dihapus.')
  }

  return (
    <main className="app-shell">
      <TopNav activeUser={activeUser} page={page} onNavigate={navigate} onLogout={logout} />

      <section className="page-area">
        {toast && <p className={`message ${toast.type}`}>{toast.text}</p>}

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

        {activeUser && page === 'dashboard' && <DashboardPage user={activeUser} onProfile={() => navigate('profile')} />}

        {activeUser && page === 'profile' && (
          <ProfilePage
            user={activeUser}
            form={profileForm}
            passwordForm={passwordForm}
            passwordOpen={passwordOpen}
            onBack={() => navigate('dashboard')}
            onFormChange={setProfileForm}
            onPasswordChange={setPasswordForm}
            onSubmit={handleProfileSubmit}
            onPasswordSubmit={handlePasswordSubmit}
            onOpenPassword={() => setPasswordOpen(true)}
            onClosePassword={() => setPasswordOpen(false)}
          />
        )}

        {activeUser && page === 'checkout' && checkoutEvent && (
          <CheckoutPage
            event={checkoutEvent}
            quantity={checkoutQuantity}
            onQuantityChange={setCheckoutQuantity}
            onSubmit={submitCheckout}
            onBack={() => navigate('events')}
          />
        )}

        {activeUser && page !== 'dashboard' && page !== 'profile' && page !== 'checkout' && (
          <FeaturePage
            page={page}
            data={appData}
            user={activeUser}
            onAdd={addResource}
            onUpdate={updateResource}
            onDelete={deleteResource}
            onCheckout={openCheckout}
          />
        )}
      </section>
    </main>
  )
}

export default App
