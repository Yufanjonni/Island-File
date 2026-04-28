import type { RegisterForm, User } from '../types'

export function validateRegister(form: RegisterForm, users: User[]) {
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
