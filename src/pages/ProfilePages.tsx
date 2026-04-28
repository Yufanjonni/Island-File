import type { FormEvent } from 'react'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { roleLabels } from '../data/mockData'
import type { Role, User } from '../types'

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
  onProfile: () => void
}

export function DashboardPage({ user, onProfile }: DashboardPageProps) {
  return (
    <section className="content-page">
      <PageHeader
        eyebrow={`Dashboard ${roleLabels[user.role]}`}
        title={user.name}
        action={
          <button className="secondary-button" type="button" onClick={onProfile}>
            Profil Saya
          </button>
        }
      />
      <ProfileInfo user={user} />
    </section>
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
    <section className="content-page">
      <PageHeader
        eyebrow="Profile"
        title={user.name}
        action={
          <button className="secondary-button" type="button" onClick={onBack}>
            Dashboard
          </button>
        }
      />
      <div className="profile-layout">
        <ProfileInfo user={user} />
        <section className="panel-card">
          <h2>Edit Profil</h2>
          <form className="form-stack" onSubmit={onSubmit}>
            <ProfileFields role={user.role} form={form} onChange={onFormChange} />
            <Field label="Username">
              <input disabled value={user.username} />
            </Field>
            <div className="action-row">
              <button className="primary-button" type="submit">
                Simpan
              </button>
              <button className="secondary-button" type="button" onClick={onOpenPassword}>
                Update Password
              </button>
            </div>
          </form>
        </section>
      </div>

      {passwordOpen && (
        <Modal title="Update Password" onClose={onClosePassword}>
          <form className="form-stack" onSubmit={onPasswordSubmit}>
            <Field label="Password Saat Ini">
              <input
                required
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => onPasswordChange({ ...passwordForm, currentPassword: event.target.value })}
              />
            </Field>
            <Field label="Password Baru">
              <input
                required
                minLength={6}
                type="password"
                value={passwordForm.nextPassword}
                onChange={(event) => onPasswordChange({ ...passwordForm, nextPassword: event.target.value })}
              />
            </Field>
            <Field label="Konfirmasi Password">
              <input
                required
                minLength={6}
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => onPasswordChange({ ...passwordForm, confirmPassword: event.target.value })}
              />
            </Field>
            <button className="primary-button" type="submit">
              Simpan Password
            </button>
          </form>
        </Modal>
      )}
    </section>
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
        <Field label="Nama Penyelenggara">
          <input required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Email Kontak">
          <input
            required
            type="email"
            value={form.contactEmail}
            onChange={(event) => onChange({ ...form, contactEmail: event.target.value })}
          />
        </Field>
      </>
    )
  }

  if (role === 'customer') {
    return (
      <>
        <Field label="Nama Lengkap">
          <input required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Nomor Telepon">
          <input required value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
        </Field>
      </>
    )
  }

  return (
    <>
      <Field label="Nama Admin">
        <input required value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} />
      </Field>
      <Field label="Nomor Telepon">
        <input required value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
      </Field>
    </>
  )
}

function ProfileInfo({ user }: { user: User }) {
  return (
    <article className="profile-card">
      <dl>
        <Info label="Nama" value={user.name} />
        <Info label="Role" value={roleLabels[user.role]} />
        <Info label="Email" value={user.email} />
        <Info label="Nomor Telepon" value={user.phone} />
        <Info label="Username" value={user.username} />
        {user.contactEmail && <Info label="Email Kontak" value={user.contactEmail} />}
      </dl>
    </article>
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
