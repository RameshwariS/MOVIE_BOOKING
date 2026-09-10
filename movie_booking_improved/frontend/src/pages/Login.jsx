import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const googleBtnRef = useRef(null)
  const navigate = useNavigate()

  // ── Google Sign-In setup ───────────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes('your_google')) return

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          width: googleBtnRef.current.offsetWidth || 400,
          text: 'continue_with',
          logo_alignment: 'left',
        })
      }
    }

    // GIS script may already be loaded or still loading
    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      // Poll briefly until GIS loads (it's async defer in index.html)
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGoogle()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  // ── Google credential callback ─────────────────────────────────────────────
  const handleGoogleCredential = async (response) => {
    setGoogleLoading(true)
    try {
      const res = await api.post('/mba/api/v1/users/google-auth', {
        idToken: response.credential,
      })
      const d = res.data?.data || res.data
      const token = d?.token
      const user = d?.user
      if (!token) throw new Error('No token received')
      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      toast.success(`Welcome, ${user?.name || 'there'}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.err || err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  // ── Email/password submit ──────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const res = await api.post('/mba/api/v1/users/login', { email, password })
      const d = res.data?.data || res.data
      const token = d?.token
      const user = d?.user
      if (!token) throw new Error('No token received')
      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.err || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const googleConfigured = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('your_google')

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🎬</div>
          <h2>Sign In</h2>
          <p className="muted">Welcome back! Pick up where you left off.</p>
        </div>

        {/* ── Google Sign-In Button ── */}
        {googleConfigured ? (
          <div className="google-auth-section">
            <div
              ref={googleBtnRef}
              id="google-signin-btn"
              className="google-btn-wrapper"
              style={{ opacity: googleLoading ? 0.6 : 1, pointerEvents: googleLoading ? 'none' : 'auto' }}
            />
            {googleLoading && (
              <div className="google-loading">
                <span className="btn-spinner" style={{ borderTopColor: '#4285f4' }} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Signing in with Google…
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="google-unconfigured">
            <div className="google-unconfigured-inner">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Google Sign-In not configured</span>
            </div>
            <p className="google-unconfigured-hint">
              Add <code>VITE_GOOGLE_CLIENT_ID</code> to <code>frontend/.env</code> to enable
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {/* ── Email/Password Form ── */}
        <form onSubmit={submit} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button className="btn btn-block" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="link">Create one</Link>
        </p>
      </div>
    </div>
  )
}
