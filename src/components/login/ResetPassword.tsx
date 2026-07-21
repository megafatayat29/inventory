import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../services/authService'
import Swal from 'sweetalert2'
import kaiLogo from '../../assets/kai.png'
import lrtLogo from '../../assets/lrt.png'

type StrengthResult = {
  score: number // 0-4
  label: string
  color: string
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: '', color: '#e2e8f0' }
  }

  if (password.length < 6) {
    return { score: 1, label: 'Terlalu Pendek', color: '#dc2626' }
  }

  let points = 0
  if (password.length >= 8) points++
  if (password.length >= 12) points++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++
  if (/\d/.test(password)) points++
  if (/[^A-Za-z0-9]/.test(password)) points++

  if (points <= 1) return { score: 1, label: 'Lemah', color: '#dc2626' }
  if (points === 2) return { score: 2, label: 'Sedang', color: '#f59e0b' }
  if (points === 3) return { score: 3, label: 'Kuat', color: '#16a34a' }
  return { score: 4, label: 'Sangat Kuat', color: '#15803d' }
}

const MIN_STRENGTH_SCORE = 2

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const showMatchHint = confirmPassword.length > 0
  const passwordsMatch = password === confirmPassword
  const isFormValid =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    passwordsMatch &&
    strength.score >= MIN_STRENGTH_SCORE

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (strength.score < MIN_STRENGTH_SCORE) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Terlalu Lemah',
        text: 'Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    if (!passwordsMatch) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Tidak Sama',
        text: 'Konfirmasi password harus sama dengan password baru.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(password)
      await Swal.fire({
        icon: 'success',
        title: 'Password Berhasil Diubah',
        text: 'Silakan login kembali menggunakan password baru.',
        confirmButtonText: 'Ke Halaman Login',
        confirmButtonColor: '#2563eb',
      })
      navigate('/login')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text:
          error instanceof Error
            ? error.message
            : 'Gagal mengubah password. Link mungkin sudah kedaluwarsa.',
        confirmButtonColor: '#dc2626',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <img src={kaiLogo} alt="Logo KAI" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />
          <img src={lrtLogo} alt="Logo LRT Jabodebek" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div
          style={{
            padding: '32px 32px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #eef2f7',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '26px', color: '#111827' }}>Atur Ulang Password</h2>
          <p style={{ marginTop: '8px', color: '#64748b' }}>
            Masukkan password baru untuk akun RakFat SIGAPQ kamu
          </p>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>
                Password Baru
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #dbe2ea',
                  borderRadius: '10px',
                  padding: '0 12px',
                  background: '#f8fafc',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V8a4 4 0 1 1 8 0v2" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    padding: '12px 10px',
                    fontSize: '15px',
                    color: '#0f172a',
                  }}
                  required
                  minLength={6}
                />
              </div>
            </label>

            {password.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[0, 1, 2, 3].map((segmentIndex) => (
                    <div
                      key={segmentIndex}
                      style={{
                        height: '5px',
                        flex: 1,
                        borderRadius: '3px',
                        background: segmentIndex < strength.score ? strength.color : '#e2e8f0',
                        transition: 'background 0.2s ease',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: strength.color }}>
                  Kekuatan Password: {strength.label}
                </span>
              </div>
            )}

            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>
                Konfirmasi Password Baru
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: `1px solid ${showMatchHint ? (passwordsMatch ? '#16a34a' : '#dc2626') : '#dbe2ea'}`,
                  borderRadius: '10px',
                  padding: '0 12px',
                  background: '#f8fafc',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V8a4 4 0 1 1 8 0v2" />
                </svg>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi password baru"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    padding: '12px 10px',
                    fontSize: '15px',
                    color: '#0f172a',
                  }}
                  required
                  minLength={6}
                />
              </div>
            </label>

            {showMatchHint && (
              <p
                style={{
                  fontSize: '13px',
                  marginTop: 0,
                  marginBottom: '20px',
                  color: passwordsMatch ? '#16a34a' : '#dc2626',
                  fontWeight: 500,
                }}
              >
                {passwordsMatch ? '✓ Password cocok' : '✗ Password belum sama'}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                background: isSubmitting || !isFormValid ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isSubmitting || !isFormValid ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !isFormValid ? 0.8 : 1,
              }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword