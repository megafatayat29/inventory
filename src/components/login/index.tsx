import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile, loginAdmin } from '../../services/authService'
import { supabase } from '../../lib/supabase'
import Swal from 'sweetalert2'
import kaiLogo from '../../assets/kai.png';
import lrtLogo from '../../assets/lrt.png';

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await loginAdmin(email, password)

      const profile = await getMyProfile()

      if (!profile) {
        throw new Error('Akun berhasil login, tetapi profile admin belum dibuat.')
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Akun admin ini sudah dinonaktifkan.')
      }

      localStorage.setItem('userRole', profile.role)
      navigate('/admin/dashboard')
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error instanceof Error ? error.message
          : 'Login gagal. Silakan coba lagi.',
        confirmButtonColor: '#ef4444',
      })
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
          <h2 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>RakFat SIGAPQ</h2>
          <p style={{ marginTop: '8px', color: '#64748b' }}>Sign in to start your session</p>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: '12px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>
                Email
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
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 8 8 6 8-6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
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
                />
              </div>
            </label>

            <label style={{ display: 'block', marginBottom: '16px' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#334155' }}>
                Password
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
                  placeholder="Password"
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
                />
              </div>
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
                Forgot password?
              </a>
            </div>

            {errorMessage ? (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '14px',
                }}
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                background: isSubmitting ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isSubmitting ? 'wait' : 'pointer',
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <p style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>
                I forgot my password
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
