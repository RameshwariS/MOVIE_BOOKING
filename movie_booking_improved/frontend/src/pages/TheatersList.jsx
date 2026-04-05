import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { isAdmin } from '../utils/auth'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

export default function TheatersList() {
  const [theaters, setTheaters] = useState([])
  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expandedShows, setExpandedShows] = useState({})
  const [showsLoading, setShowsLoading] = useState({})
  const [showsData, setShowsData] = useState({})
  // Create theater form
  const [form, setForm] = useState({ name: '', address: '', city: '', pinCode: '' })
  const [creating, setCreating] = useState(false)
  const admin = isAdmin()

  const search = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const res = await api.get('/mba/api/v1/theaters', {
        params: { name: searchName || undefined, city: searchCity || undefined }
      })
      setTheaters(res.data.data || res.data || [])
    } catch (e) {
      toast.error(e.response?.data?.err || 'Search failed')
      setTheaters([])
    } finally {
      setLoading(false)
    }
  }

  const toggleShows = async (theaterId) => {
    if (expandedShows[theaterId]) {
      setExpandedShows(p => ({ ...p, [theaterId]: false }))
      return
    }
    setShowsLoading(p => ({ ...p, [theaterId]: true }))
    try {
      const res = await api.get('/mba/api/v1/shows', { params: { theater: theaterId, status: 'SCHEDULED' } })
      setShowsData(p => ({ ...p, [theaterId]: res.data.data || res.data || [] }))
      setExpandedShows(p => ({ ...p, [theaterId]: true }))
    } catch (e) {
      toast.error('Could not load shows')
    } finally {
      setShowsLoading(p => ({ ...p, [theaterId]: false }))
    }
  }

  const create = async (e) => {
    e.preventDefault()
    if (!form.name || !form.address || !form.city || !form.pinCode) {
      toast.error('All fields are required'); return
    }
    setCreating(true)
    try {
      const res = await api.post('/mba/api/v1/theaters', form)
      const created = res.data.data || res.data
      setTheaters(p => [created, ...p])
      setForm({ name: '', address: '', city: '', pinCode: '' })
      setSearched(true)
      toast.success(`Theater "${created.name}" created!`)
    } catch (e) {
      toast.error(e.response?.data?.err || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Theaters</h2>
          <p className="muted">Search theaters near you by name or city.</p>
        </div>
      </div>

      <form className="search-form-row" onSubmit={search}>
        <div className="search-field">
          <span className="search-icon">🏛️</span>
          <input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Theater name…"
          />
        </div>
        <div className="search-field">
          <span className="search-icon">📍</span>
          <input
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            placeholder="City…"
          />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {loading ? (
        <Spinner text="Searching theaters…" />
      ) : searched && theaters.length === 0 ? (
        <EmptyState icon="🏛️" title="No theaters found" subtitle="Try a different name or city" />
      ) : (
        <div className="theater-grid">
          {theaters.map(t => {
            const tid = t._id || t.id
            const shows = showsData[tid] || []
            return (
              <div key={tid} className="card theater-card-full">
                <div className="theater-top">
                  <div>
                    <h3 className="theater-name">{t.name}</h3>
                    <p className="muted theater-addr">📍 {t.address}, {t.city}{t.pinCode ? ` — ${t.pinCode}` : ''}</p>
                    {typeof t.rating === 'number' && (
                      <span className="rating-chip">⭐ {t.rating}</span>
                    )}
                  </div>
                  <span className={`theater-status ${t.isopen ? 'open' : 'closed'}`}>
                    {t.isopen !== false ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="theater-actions">
                  <button
                    className="btn btn-light btn-sm"
                    onClick={() => toggleShows(tid)}
                    disabled={showsLoading[tid]}
                  >
                    {showsLoading[tid] ? '…' : expandedShows[tid] ? 'Hide Shows' : 'View Shows'}
                  </button>
                  <Link to={`/shows?theater=${tid}`} className="btn btn-ghost btn-sm">
                    All Showtimes
                  </Link>
                </div>

                {expandedShows[tid] && (
                  <div className="theater-shows-panel">
                    {shows.length === 0 ? (
                      <p className="muted" style={{ fontSize: '0.875rem' }}>No scheduled shows right now.</p>
                    ) : (
                      shows.map(s => (
                        <Link
                          key={s._id || s.id}
                          to={`/booking/${s._id || s.id}`}
                          className="show-row"
                        >
                          <div>
                            <strong>{s.movie?.name || 'Movie'}</strong>
                            <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
                              {s.startTime ? new Date(s.startTime).toLocaleString() : '—'}
                            </p>
                          </div>
                          <span className="show-price">₹{s.price}</span>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {admin && (
        <div className="admin-section">
          <h3>Create Theater</h3>
          <form className="form" onSubmit={create} style={{ maxWidth: 560 }}>
            <div className="form-grid-2">
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Theater name" required />
              </div>
              <div className="field">
                <label>City</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" required />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="field">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" required />
              </div>
              <div className="field">
                <label>Pin Code</label>
                <input value={form.pinCode} onChange={e => setForm(f => ({ ...f, pinCode: e.target.value }))} placeholder="e.g. 400001" required />
              </div>
            </div>
            <button className="btn" type="submit" disabled={creating}>
              {creating ? 'Creating…' : '+ Create Theater'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
