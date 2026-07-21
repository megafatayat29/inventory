import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../services/authService'
import Swal from 'sweetalert2'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updatePassword(password)
      await Swal.fire({
        icon: 'success',
        title: 'Password berhasil diubah',
        confirmButtonColor: '#2563eb',
      })
      navigate('/login')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error instanceof Error ? error.message : 'Gagal mengubah password.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password baru"
        required
        minLength={6}
      />
      <button type="submit" disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Password Baru'}
      </button>
    </form>
  )
}
