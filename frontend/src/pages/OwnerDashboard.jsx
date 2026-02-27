import React, { useEffect, useState } from 'react'
import api from '../api'

export default function OwnerDashboard() {
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [shows, setShows] = useState([])
  const [err, setErr] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    movie: '',
    theater: '',
    startTime: '',
    endTime: '',
    price: '',
    totalSeats: '',
    status: 'SCHEDULED'
  })
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0 })

  const fetchBase = async () => {
    setErr('')
    try {
      const [mRes, tRes, sRes] = await Promise.all([
        api.get('/mba/api/v1/movies'),
        api.get('/mba/api/v1/theaters'),
        api.get('/mba/api/v1/shows')
      ])
      setMovies(mRes.data.data || mRes.data)
      setTheaters(tRes.data.data || tRes.data)
      setShows(sRes.data.data || sRes.data)

      // Basic Stats Calculation
      const allBookingsRes = await api.get('/mba/api/v1/bookings')
      const allBookings = allBookingsRes.data.data || allBookingsRes.data
      const stats = {
        totalBookings: allBookings.length,
        totalRevenue: allBookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0),
        pendingPayments: allBookings.filter(b => b.paymentStatus === 'PENDING').length
      }
      setStats(stats)
    } catch (e) {
      setErr(e.response?.data?.err || e.message)
    }
  }

  useEffect(() => { fetchBase() }, [])

  const updateForm = (patch) => setForm({ ...form, ...patch })

  const resetForm = () => {
    setEditingId(null)
    setForm({
      movie: '',
      theater: '',
      startTime: '',
      endTime: '',
      price: '',
      totalSeats: '',
      status: 'SCHEDULED'
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setMessage('')
    try {
      const payload = {
        movie: form.movie,
        theater: form.theater,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
        price: Number(form.price),
        totalSeats: Number(form.totalSeats),
        status: form.status
      }

      if (editingId) {
        await api.put(`/mba/api/v1/shows/${editingId}`, payload)
        setMessage('Show updated.')
      } else {
        await api.post('/mba/api/v1/shows', payload)
        setMessage('Show created.')
      }
      resetForm()
      fetchBase()
    } catch (e) {
      setErr(e.response?.data?.err || e.message)
    }
  }

  const editShow = (s) => {
    setEditingId(s._id || s.id)
    setForm({
      movie: s.movie?._id || s.movie,
      theater: s.theater?._id || s.theater,
      startTime: s.startTime ? new Date(s.startTime).toISOString().slice(0, 16) : '',
      endTime: s.endTime ? new Date(s.endTime).toISOString().slice(0, 16) : '',
      price: s.price || '',
      totalSeats: s.totalSeats || '',
      status: s.status || 'SCHEDULED'
    })
  }

  const removeShow = async (id) => {
    if (!window.confirm('Delete show?')) return
    setErr('')
    setMessage('')
    try {
      await api.delete(`/mba/api/v1/shows/${id}`)
      setMessage('Show deleted.')
      fetchBase()
    } catch (e) {
      setErr(e.response?.data?.err || e.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Theater Owner Dashboard</h2>
          <p className="muted">Manage running movies and show timings.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <div className="label">Total Bookings</div>
          <div className="value">{stats.totalBookings}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Total Revenue</div>
          <div className="value">₹{stats.totalRevenue}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Pending Payments</div>
          <div className="value">{stats.pendingPayments}</div>
        </div>
      </div>

      {err && <div className="error">{err}</div>}
      {message && <div className="card success">{message}</div>}

      <form className="form panel" onSubmit={submit}>
        <label>Movie</label>
        <select value={form.movie} onChange={e => updateForm({ movie: e.target.value })} required>
          <option value="">Select movie</option>
          {movies.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>)}
        </select>

        <label>Theater</label>
        <select value={form.theater} onChange={e => updateForm({ theater: e.target.value })} required>
          <option value="">Select theater</option>
          {theaters.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>)}
        </select>

        <div className="form-row">
          <div>
            <label>Start Time</label>
            <input type="datetime-local" value={form.startTime} onChange={e => updateForm({ startTime: e.target.value })} required />
          </div>
          <div>
            <label>End Time</label>
            <input type="datetime-local" value={form.endTime} onChange={e => updateForm({ endTime: e.target.value })} required />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Price</label>
            <input type="number" min="0" value={form.price} onChange={e => updateForm({ price: e.target.value })} required />
          </div>
          <div>
            <label>Total Seats</label>
            <input type="number" min="1" value={form.totalSeats} onChange={e => updateForm({ totalSeats: e.target.value })} required />
          </div>
        </div>

        <label>Status</label>
        <select value={form.status} onChange={e => updateForm({ status: e.target.value })}>
          <option value="SCHEDULED">Scheduled</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="inline-actions">
          <button className="btn" type="submit">{editingId ? 'Update Show' : 'Create Show'}</button>
          {editingId && <button className="btn btn-ghost" type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="shows-grid">
        {shows && shows.length ? shows.map(s => {
          const id = s._id || s.id
          return (
            <div key={id} className="card show-card">
              <div>
                <h3>{s.movie?.name || 'Movie'}</h3>
                <div className="muted">{s.theater?.name || 'Theater'}</div>
              </div>
              <div className="show-meta">
                <div>Start: {s.startTime ? new Date(s.startTime).toLocaleString() : '-'}</div>
                <div>End: {s.endTime ? new Date(s.endTime).toLocaleString() : '-'}</div>
                <div>Price: {s.price}</div>
                <div>Seats: {s.totalSeats}</div>
                <div>Status: {s.status}</div>
              </div>
              <div className="item-actions">
                <button className="btn btn-light" onClick={() => editShow(s)}>Edit</button>
                <button className="btn btn-outline" onClick={() => removeShow(id)}>Delete</button>
              </div>
            </div>
          )
        }) : (
          <div className="empty-state">No shows created yet.</div>
        )}
      </div>
    </div>
  )
}
