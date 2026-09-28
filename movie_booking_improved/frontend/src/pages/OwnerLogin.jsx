import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'

export default function OwnerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const navigate = useNavigate()

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

      // Validate the user actually has an owner/admin role
      const role = user?.role
      if (role !== 'THEATER_OWNER' && role !== 'OWNER' && role !== 'ADMIN') {
        toast.error('This account does not have Theater Owner access.')
        return
      }

      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      toast.success(`Welcome back, ${user?.name || 'Owner'}!`)
      navigate('/owner')
    } catch (err) {
      toast.error(err.response?.data?.err || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🎭</div>
          <h2>Theater Owner Sign In</h2>
          <p className="muted">Access your dashboard to manage movies and shows.</p>
        </div>

        {/* Role badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--surface-2, #f1f5f9)', borderRadius: '8px',
          padding: '0.6rem 1rem', marginBottom: '1rem',
          border: '1px solid var(--border, #e2e8f0)'
        }}>
          <span style={{ fontSize: '1.1rem' }}>🏟️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Theater Owner Portal</div>
            <div className="muted" style={{ fontSize: '0.75rem' }}>
              Manage movies, shows, and view performance analytics.
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@theater.com"
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
            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="auth-footer">
          New theater owner?{' '}
          <Link to="/owner-register" className="link">Create Owner Account</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.25rem' }}>
          Regular user?{' '}
          <Link to="/login" className="link">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
