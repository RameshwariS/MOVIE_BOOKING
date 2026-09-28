import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'

export default function OwnerRegister() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await api.post('/mba/api/v1/users/register', {
        name,
        email,
        password,
        role: 'THEATER_OWNER',
      })
      toast.success('Theater owner account created! Please sign in.')
      navigate('/owner-login')
    } catch (err) {
      toast.error(err.response?.data?.err || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e']

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🎭</div>
          <h2>Theater Owner Sign Up</h2>
          <p className="muted">Register your theater and start managing shows.</p>
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
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Theater Owner Account</div>
            <div className="muted" style={{ fontSize: '0.75rem' }}>
              You'll get access to the Owner Dashboard to manage movies, shows & analytics.
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="form">
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </div>

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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
            {password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="strength-segment"
                      style={{ background: i <= strength ? strengthColor[strength] : '#e2e8f0' }}
                    />
                  ))}
                </div>
                <span style={{ color: strengthColor[strength], fontSize: '0.75rem' }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <button className="btn btn-block" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Creating account…' : 'Create Theater Owner Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/owner-login" className="link">Sign in as Theater Owner</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.25rem' }}>
          Regular user?{' '}
          <Link to="/login" className="link">Sign in here</Link>
        </p>
      </div>
    </div>
  )
}
