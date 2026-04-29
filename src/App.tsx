import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Modal } from './components/Modal'
import { ResourceDialog, type ResourceDialogState, type ResourceKind } from './components/ResourceDialog'
import { TopNav } from './components/TopNav'
import { emptyRegisterForm, initialData, initialUsers } from './data/mockData'
import { AuthLayout, LoginPanel, RegisterPanel, RolePanel } from './pages/AuthPages'
import { CheckoutPage } from './pages/CheckoutPage'
import { FeaturePage } from './pages/FeaturePages'
import { DashboardPage, ProfilePage, type PasswordForm, type ProfileForm } from './pages/ProfilePages'
import type { AppData, EventItem, Page, RegisterForm, Role, Toast, User } from './types'
import {
  applyResourceDraft,
  createDefaultDraft,
  createDraftFromData,
  deleteResource as deleteResourceFromData,
  getResourceName,
  validateResourceDraft,
} from './utils/resourceDrafts'
import { validateRegister } from './utils/validation'

const emptyPasswordForm: PasswordForm = {
  currentPassword: '',
  nextPassword: '',
  confirmPassword: '',
}

function getProfileForm(user: User): ProfileForm {
  return {
    name: user.name,
    phone: user.phone,
    contactEmail: user.contactEmail ?? user.email,
  }
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
  const [checkoutCategory, setCheckoutCategory] = useState('')
  const [checkoutPromo, setCheckoutPromo] = useState('')
  const [resourceDialog, setResourceDialog] = useState<ResourceDialogState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ kind: ResourceKind; id: number } | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const activeUser = useMemo(
    () => users.find((user) => user.id === activeUserId) ?? null,
    [activeUserId, users],
  )

  function navigate(nextPage: Page) {
    if (nextPage === 'profile' && activeUser) {
      setProfileForm(getProfileForm(activeUser))
    }
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
    setProfileForm(getProfileForm(foundUser))
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
    setCheckoutCategory(eventItem.category)
    setCheckoutPromo('')
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
    if (quantity > 10) {
      showToast('error', 'Maksimal 10 tiket per transaksi.')
      return
    }

    const orderId = Date.now()
    const selectedCategory = appData.ticketCategories.find(
      (category) => category.event === checkoutEvent.title && category.name === checkoutCategory,
    )
    const basePrice = selectedCategory?.price ?? checkoutEvent.price
    const promo = appData.promotions.find((item) => item.code.toLowerCase() === checkoutPromo.trim().toLowerCase())
    const subtotal = basePrice * quantity
    const discount =
      promo?.discountType === 'Persentase'
        ? Math.round((subtotal * Number.parseInt(promo.value, 10)) / 100)
        : promo
          ? Number.parseInt(promo.value.replace(/\D/g, ''), 10)
          : 0
    const total = Math.max(0, subtotal - discount)

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
          orderDate: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          customer: activeUser.name,
          event: checkoutEvent.title,
          ticketCategory: checkoutCategory,
          quantity,
          promoCode: promo?.code ?? '-',
          total,
          status: 'Menunggu',
        },
      ],
      tickets: [
        ...currentData.tickets,
        {
          id: orderId,
          code: `TKT-${String(orderId).slice(-4)}`,
          orderCode: `ORD-${String(orderId).slice(-4)}`,
          category: checkoutCategory,
          seatCode: '-',
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

  function openCreateResource(kind: ResourceKind) {
    setResourceDialog({ kind, mode: 'create', draft: createDefaultDraft(kind, appData) })
    setToast(null)
  }

  function openUpdateResource(kind: ResourceKind, id: number) {
    setResourceDialog({ kind, mode: 'update', id, draft: createDraftFromData(kind, appData, id) })
    setToast(null)
  }

  function requestDeleteResource(kind: ResourceKind, id: number) {
    if (kind === 'seats' && appData.seats.find((seat) => seat.id === id)?.status === 'Terisi') {
      showToast('error', 'Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus.')
      return
    }
    setPendingDelete({ kind, id })
    setToast(null)
  }

  function submitResourceDialog(event: FormEvent) {
    event.preventDefault()
    if (!resourceDialog) return

    const validationMessage = validateResourceDraft(resourceDialog, appData)
    if (validationMessage) {
      showToast('error', validationMessage)
      return
    }

    setAppData((currentData) => applyResourceDraft(resourceDialog, currentData, activeUser))
    setResourceDialog(null)
    showToast('success', resourceDialog.mode === 'create' ? 'Data berhasil ditambahkan.' : 'Data berhasil diperbarui.')
  }

  function confirmDeleteResource() {
    if (!pendingDelete) return
    setAppData((currentData) => deleteResourceFromData(pendingDelete.kind, pendingDelete.id, currentData))
    setPendingDelete(null)
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
            categories={appData.ticketCategories.filter((category) => category.event === checkoutEvent.title)}
            promotions={appData.promotions}
            quantity={checkoutQuantity}
            category={checkoutCategory}
            promoCode={checkoutPromo}
            onQuantityChange={setCheckoutQuantity}
            onCategoryChange={setCheckoutCategory}
            onPromoChange={setCheckoutPromo}
            onSubmit={submitCheckout}
            onBack={() => navigate('events')}
          />
        )}

        {activeUser && page !== 'dashboard' && page !== 'profile' && page !== 'checkout' && (
          <FeaturePage
            page={page}
            data={appData}
            user={activeUser}
            onAdd={openCreateResource}
            onUpdate={openUpdateResource}
            onDelete={requestDeleteResource}
            onCheckout={openCheckout}
          />
        )}

        {resourceDialog && (
          <ResourceDialog
            state={resourceDialog}
            data={appData}
            onDraftChange={(draft) => setResourceDialog({ ...resourceDialog, draft })}
            onClose={() => setResourceDialog(null)}
            onSubmit={submitResourceDialog}
          />
        )}

        {pendingDelete && (
          <Modal title="Konfirmasi Penghapusan" onClose={() => setPendingDelete(null)}>
            <div className="delete-confirmation">
              <p>
                Hapus {getResourceName(pendingDelete.kind, pendingDelete.id, appData)}?
              </p>
              <div className="action-row">
                <button className="danger-button" type="button" onClick={confirmDeleteResource}>
                  Hapus
                </button>
                <button className="secondary-button" type="button" onClick={() => setPendingDelete(null)}>
                  Batal
                </button>
              </div>
            </div>
          </Modal>
        )}
      </section>
    </main>
  )
}

export default App
