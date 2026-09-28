import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'

const EMPTY_SHOW_FORM = { movie: '', theater: '', startTime: '', endTime: '', price: '', totalSeats: '', status: 'SCHEDULED' }
const GENRES = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCI-FI', 'ROMANCE', 'THRILLER', 'ANIMATION', 'DOCUMENTARY']
const LANGUAGES = ['ENG', 'HIN', 'TAM', 'TEL', 'MAL', 'KAN', 'BEN', 'MAR']
const EMPTY_MOVIE_FORM = {
  name: '', description: '', director: '', releaseDate: '',
  trailerURL: '', posterURL: '', casts: '', releaseStatus: 'RELEASED',
  genre: [], language: ['ENG'],
}

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('shows')

  // ── Shows state ──────────────────────────────────────────────────────────
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [shows, setShows] = useState([])
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0, confirmedBookings: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_SHOW_FORM)
  const [showFilter, setShowFilter] = useState('ALL')

  // ── Movies state ─────────────────────────────────────────────────────────
  const [movieForm, setMovieForm] = useState(EMPTY_MOVIE_FORM)
  const [editingMovieId, setEditingMovieId] = useState(null)
  const [savingMovie, setSavingMovie] = useState(false)
  const [deletingMovie, setDeletingMovie] = useState(null)

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

  // ── Show helpers ──────────────────────────────────────────────────────────
  const updateShow = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const resetShowForm = () => { setEditingId(null); setForm(EMPTY_SHOW_FORM) }

  const submitShow = async (e) => {
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
      resetShowForm()
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

  const removeShow = async (id) => {
    if (!window.confirm('Delete this show?')) return
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

  // ── Movie helpers ─────────────────────────────────────────────────────────
  const updateMovie = (k, v) => setMovieForm(f => ({ ...f, [k]: v }))
  const toggleArr = (key, val) => {
    setMovieForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }
  const resetMovieForm = () => { setEditingMovieId(null); setMovieForm(EMPTY_MOVIE_FORM) }

  const editMovie = (m) => {
    setEditingMovieId(m._id || m.id)
    setMovieForm({
      name: m.name || '',
      description: m.description || '',
      director: m.director || '',
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '',
      trailerURL: m.trailerURL || '',
      posterURL: m.posterURL || '',
      casts: (m.casts || []).join(', '),
      releaseStatus: m.releaseStatus || 'RELEASED',
      genre: m.genre || [],
      language: m.language || ['ENG'],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitMovie = async (e) => {
    e.preventDefault()
    if (!movieForm.name.trim()) { toast.error('Movie name is required'); return }
    if (!movieForm.description.trim()) { toast.error('Description is required'); return }
    if (!movieForm.director.trim()) { toast.error('Director is required'); return }
    if (!movieForm.releaseDate) { toast.error('Release date is required'); return }
    if (movieForm.genre.length === 0) { toast.error('Select at least one genre'); return }

    const payload = {
      name: movieForm.name.trim(),
      description: movieForm.description.trim(),
      director: movieForm.director.trim(),
      releaseDate: movieForm.releaseDate,
      trailerURL: movieForm.trailerURL.trim() || undefined,
      posterURL: movieForm.posterURL.trim() || undefined,
      casts: movieForm.casts.split(',').map(s => s.trim()).filter(Boolean),
      releaseStatus: movieForm.releaseStatus,
      genre: movieForm.genre,
      language: movieForm.language.length ? movieForm.language : ['ENG'],
    }

    setSavingMovie(true)
    try {
      if (editingMovieId) {
        await api.put(`/mba/api/v1/movies/${editingMovieId}`, payload)
        toast.success('Movie updated!')
      } else {
        await api.post('/mba/api/v1/movies', payload)
        toast.success('Movie added!')
      }
      resetMovieForm()
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.err || 'Save failed')
    } finally {
      setSavingMovie(false)
    }
  }

  const removeMovie = async (id) => {
    if (!window.confirm('Delete this movie? This cannot be undone.')) return
    setDeletingMovie(id)
    try {
      await api.delete(`/mba/api/v1/movies/${id}`)
      toast.success('Movie deleted')
      fetchAll()
    } catch (e) {
      toast.error(e.response?.data?.err || 'Delete failed')
    } finally {
      setDeletingMovie(null)
    }
  }

  const filteredShows = showFilter === 'ALL' ? shows : shows.filter(s => s.status === showFilter)

  const StatCard = ({ label, value, icon }) => (
    <div className="card stat-card-new">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )

  if (loading) return <div className="page"><Spinner text="Loading dashboard…" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Owner Dashboard</h2>
          <p className="muted">Manage movies, shows and track performance.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <StatCard icon="🎟️" label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon="💰" label="Revenue (Paid)" value={`₹${stats.totalRevenue.toLocaleString()}`} />
        <StatCard icon="✅" label="Confirmed" value={stats.confirmedBookings} />
        <StatCard icon="⏳" label="Pending Payments" value={stats.pendingPayments} />
      </div>

      {/* Tabs */}
      <div className="status-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`status-tab ${activeTab === 'shows' ? 'active' : ''}`}
          onClick={() => { setActiveTab('shows'); resetShowForm() }}
        >
          🎬 Manage Shows
        </button>
        <button
          className={`status-tab ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => { setActiveTab('movies'); resetMovieForm() }}
        >
          🎥 Manage Movies
        </button>
      </div>

      {/* ── SHOWS TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'shows' && (
        <>
          <div className="dashboard-form-section">
            <div className="form-section-header">
              <h3>{editingId ? '✏️ Edit Show' : '+ Create Show'}</h3>
              {editingId && <button className="btn btn-ghost btn-sm" onClick={resetShowForm}>Cancel Edit</button>}
            </div>

            <form className="form" onSubmit={submitShow}>
              <div className="form-grid-2">
                <div className="field">
                  <label>Movie <span className="required">*</span></label>
                  <select value={form.movie} onChange={e => updateShow('movie', e.target.value)} required>
                    <option value="">Select movie…</option>
                    {movies.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Theater <span className="required">*</span></label>
                  <select value={form.theater} onChange={e => updateShow('theater', e.target.value)} required>
                    <option value="">Select theater…</option>
                    {theaters.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.name} — {t.city}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="field">
                  <label>Start Time <span className="required">*</span></label>
                  <input type="datetime-local" value={form.startTime} onChange={e => updateShow('startTime', e.target.value)} required />
                </div>
                <div className="field">
                  <label>End Time <span className="required">*</span></label>
                  <input type="datetime-local" value={form.endTime} onChange={e => updateShow('endTime', e.target.value)} required />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="field">
                  <label>Price (₹) <span className="required">*</span></label>
                  <input type="number" min="0" value={form.price} onChange={e => updateShow('price', e.target.value)} placeholder="e.g. 250" required />
                </div>
                <div className="field">
                  <label>Total Seats <span className="required">*</span></label>
                  <input type="number" min="1" value={form.totalSeats} onChange={e => updateShow('totalSeats', e.target.value)} placeholder="e.g. 100" required />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => updateShow('status', e.target.value)}>
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
        </>
      )}

      {/* ── MOVIES TAB ──────────────────────────────────────────────────────── */}
      {activeTab === 'movies' && (
        <>
          <div className="dashboard-form-section">
            <div className="form-section-header">
              <h3>{editingMovieId ? '✏️ Edit Movie' : '+ Add Movie'}</h3>
              {editingMovieId && <button className="btn btn-ghost btn-sm" onClick={resetMovieForm}>Cancel Edit</button>}
            </div>

            <form className="form movie-form" onSubmit={submitMovie}>
              <div className="form-grid-2">
                <div className="field">
                  <label>Movie Title <span className="required">*</span></label>
                  <input value={movieForm.name} onChange={e => updateMovie('name', e.target.value)} placeholder="e.g. Inception" required />
                </div>
                <div className="field">
                  <label>Director <span className="required">*</span></label>
                  <input value={movieForm.director} onChange={e => updateMovie('director', e.target.value)} placeholder="e.g. Christopher Nolan" required />
                </div>
              </div>

              <div className="field">
                <label>Description <span className="required">*</span></label>
                <textarea value={movieForm.description} onChange={e => updateMovie('description', e.target.value)} placeholder="Brief synopsis…" rows={3} required />
              </div>

              <div className="form-grid-2">
                <div className="field">
                  <label>Release Date <span className="required">*</span></label>
                  <input type="date" value={movieForm.releaseDate} onChange={e => updateMovie('releaseDate', e.target.value)} required />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={movieForm.releaseStatus} onChange={e => updateMovie('releaseStatus', e.target.value)}>
                    <option value="RELEASED">Released</option>
                    <option value="UPCOMING">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Cast Members <span className="hint">(comma-separated)</span></label>
                <input value={movieForm.casts} onChange={e => updateMovie('casts', e.target.value)} placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt" />
              </div>

              <div className="field">
                <label>Genre <span className="required">*</span></label>
                <div className="chip-group">
                  {GENRES.map(g => (
                    <button key={g} type="button"
                      className={`chip ${movieForm.genre.includes(g) ? 'chip-active' : ''}`}
                      onClick={() => toggleArr('genre', g)}
                    >
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Language</label>
                <div className="chip-group">
                  {LANGUAGES.map(l => (
                    <button key={l} type="button"
                      className={`chip ${movieForm.language.includes(l) ? 'chip-active' : ''}`}
                      onClick={() => toggleArr('language', l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid-2">
                <div className="field">
                  <label>Poster URL</label>
                  <input value={movieForm.posterURL} onChange={e => updateMovie('posterURL', e.target.value)} placeholder="https://…" />
                </div>
                <div className="field">
                  <label>Trailer URL</label>
                  <input value={movieForm.trailerURL} onChange={e => updateMovie('trailerURL', e.target.value)} placeholder="https://youtube.com/…" />
                </div>
              </div>

              {movieForm.posterURL && (
                <div className="poster-preview">
                  <img src={movieForm.posterURL} alt="Poster preview" onError={e => e.target.style.display = 'none'} />
                </div>
              )}

              <div className="inline-actions">
                <button className="btn" type="submit" disabled={savingMovie}>
                  {savingMovie ? <span className="btn-spinner" /> : null}
                  {savingMovie ? 'Saving…' : editingMovieId ? 'Update Movie' : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>

          {/* Movies list */}
          <div className="shows-section">
            <div className="shows-section-header">
              <h3>All Movies ({movies.length})</h3>
            </div>

            {movies.length === 0 ? (
              <p className="muted">No movies found. Add your first movie above.</p>
            ) : (
              <div className="shows-table">
                {movies.map(m => {
                  const mid = m._id || m.id
                  return (
                    <div key={mid} className="show-row-card">
                      <div className="show-row-main">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {m.posterURL && (
                            <img
                              src={m.posterURL}
                              alt={m.name}
                              style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                              onError={e => e.target.style.display = 'none'}
                            />
                          )}
                          <div>
                            <strong>{m.name}</strong>
                            <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
                              {m.director} · {m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {(m.genre || []).map(g => (
                            <span key={g} className="badge" style={{ fontSize: '0.7rem' }}>{g}</span>
                          ))}
                        </div>
                        <span className={`badge status-${m.releaseStatus?.toLowerCase()}`}>
                          {m.releaseStatus}
                        </span>
                      </div>
                      <div className="show-row-actions">
                        <button className="btn btn-light btn-sm" onClick={() => { editMovie(m); setActiveTab('movies') }}>Edit</button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeMovie(mid)}
                          disabled={deletingMovie === mid}
                        >
                          {deletingMovie === mid ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
