import React, { useEffect, useState } from 'react'
import api from '../api'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'

const EMPTY_FORM = { movie: '', theater: '', startTime: '', endTime: '', price: '', totalSeats: '', status: 'SCHEDULED' }

export default function OwnerDashboard() {
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [shows, setShows] = useState([])
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0, confirmedBookings: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showFilter, setShowFilter] = useState('ALL')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [mRes, tRes, sRes, bRes] = await Promise.all([
        api.get('/mba/api/v1/movies'),
        api.get('/mba/api/v1/theaters'),
        api.get('/mba/api/v1/shows'),
        api.get('/mba/api/v1/bookings'),
      ])
      setMovies(mRes.data.data || mRes.data || [])
      setTheaters(tRes.data.data || tRes.data || [])
      setShows(sRes.data.data || sRes.data || [])
      const bookings = bRes.data.data || bRes.data || []
      setStats({
        totalBookings: bookings.length,
        totalRevenue: bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalPrice, 0),
        pendingPayments: bookings.filter(b => b.paymentStatus === 'PENDING').length,
        confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
      })
    } catch (e) {
      toast.error(e.response?.data?.err || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM) }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.movie || !form.theater) { toast.error('Select a movie and theater'); return }
    if (!form.startTime || !form.endTime) { toast.error('Start and end times are required'); return }
    if (new Date(form.endTime) <= new Date(form.startTime)) { toast.error('End time must be after start time'); return }
    if (Number(form.price) < 0) { toast.error('Price cannot be negative'); return }
    if (Number(form.totalSeats) < 1) { toast.error('Must have at least 1 seat'); return }

    const payload = {
      movie: form.movie, theater: form.theater,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      price: Number(form.price), totalSeats: Number(form.totalSeats),
      status: form.status,
    }
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/mba/api/v1/shows/${editingId}`, payload)
        toast.success('Show updated!')
      } else {
        await api.post('/mba/api/v1/shows', payload)
        toast.success('Show created!')
      }
      resetForm()
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.err || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const editShow = (s) => {
    setEditingId(s._id || s.id)
    setForm({
      movie: s.movie?._id || s.movie || '',
      theater: s.theater?._id || s.theater || '',
      startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : '',
      endTime: s.endTime ? new Date(s.endTime).toISOString().slice(0, 16) : '',
      price: s.price ?? '', totalSeats: s.totalSeats ?? '', status: s.status || 'SCHEDULED',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeShow = async (id, name) => {
    if (!window.confirm(`Delete this show?`)) return
    setDeleting(id)
    try {
      await api.delete(`/mba/api/v1/shows/${id}`)
      toast.success('Show deleted')
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.err || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const filteredShows = showFilter === 'ALL' ? shows : shows.filter(s => s.status === showFilter)

  const StatCard = ({ label, value, icon, sub }) => (
    <div className="card stat-card-new">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub muted">{sub}</div>}
      </div>
    </div>
  )

  if (loading) return <div className="page"><Spinner text="Loading dashboard…" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Owner Dashboard</h2>
          <p className="muted">Manage shows and track performance.</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard icon="🎟️" label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon="💰" label="Revenue (Paid)" value={`₹${stats.totalRevenue.toLocaleString()}`} />
        <StatCard icon="✅" label="Confirmed" value={stats.confirmedBookings} />
        <StatCard icon="⏳" label="Pending Payments" value={stats.pendingPayments} />
      </div>

      {/* Show form */}
      <div className="dashboard-form-section">
        <div className="form-section-header">
          <h3>{editingId ? '✏️ Edit Show' : '+ Create Show'}</h3>
          {editingId && <button className="btn btn-ghost btn-sm" onClick={resetForm}>Cancel Edit</button>}
        </div>

        <form className="form" onSubmit={submit}>
          <div className="form-grid-2">
            <div className="field">
              <label>Movie <span className="required">*</span></label>
              <select value={form.movie} onChange={e => update('movie', e.target.value)} required>
                <option value="">Select movie…</option>
                {movies.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Theater <span className="required">*</span></label>
              <select value={form.theater} onChange={e => update('theater', e.target.value)} required>
                <option value="">Select theater…</option>
                {theaters.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.name} — {t.city}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Start Time <span className="required">*</span></label>
              <input type="datetime-local" value={form.startTime} onChange={e => update('startTime', e.target.value)} required />
            </div>
            <div className="field">
              <label>End Time <span className="required">*</span></label>
              <input type="datetime-local" value={form.endTime} onChange={e => update('endTime', e.target.value)} required />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="field">
              <label>Price (₹) <span className="required">*</span></label>
              <input type="number" min="0" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 250" required />
            </div>
            <div className="field">
              <label>Total Seats <span className="required">*</span></label>
              <input type="number" min="1" value={form.totalSeats} onChange={e => update('totalSeats', e.target.value)} placeholder="e.g. 100" required />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="inline-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? <span className="btn-spinner" /> : null}
              {saving ? 'Saving…' : editingId ? 'Update Show' : 'Create Show'}
            </button>
          </div>
        </form>
      </div>

      {/* Shows list */}
      <div className="shows-section">
        <div className="shows-section-header">
          <h3>All Shows ({shows.length})</h3>
          <div className="status-tabs">
            {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} className={`status-tab ${showFilter === s ? 'active' : ''}`} onClick={() => setShowFilter(s)}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredShows.length === 0 ? (
          <p className="muted">No {showFilter !== 'ALL' ? showFilter.toLowerCase() : ''} shows.</p>
        ) : (
          <div className="shows-table">
            {filteredShows.map(s => {
              const sid = s._id || s.id
              const bookedPct = s.totalSeats ? Math.round((s.bookedSeats?.length || 0) / s.totalSeats * 100) : 0
              return (
                <div key={sid} className="show-row-card">
                  <div className="show-row-main">
                    <div>
                      <strong>{s.movie?.name || 'Movie'}</strong>
                      <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>{s.theater?.name}</p>
                    </div>
                    <div className="show-row-times">
                      <span>📅 {s.startTime ? new Date(s.startTime).toLocaleDateString() : '—'}</span>
                      <span className="muted">
                        {s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} →{' '}
                        {s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="show-row-stats">
                      <span>₹{s.price}</span>
                      <div className="occupancy">
                        <div className="occ-bar"><div className="occ-fill" style={{ width: `${bookedPct}%` }} /></div>
                        <span className="muted" style={{ fontSize: '0.75rem' }}>
                          {s.bookedSeats?.length || 0}/{s.totalSeats} seats
                        </span>
                      </div>
                    </div>
                    <span className={`badge status-${s.status?.toLowerCase()}`}>{s.status}</span>
                  </div>
                  <div className="show-row-actions">
                    <button className="btn btn-light btn-sm" onClick={() => editShow(s)}>Edit</button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeShow(sid)}
                      disabled={deleting === sid}
                    >
                      {deleting === sid ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
