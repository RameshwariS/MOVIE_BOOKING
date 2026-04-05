import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { isAdmin, isAuthenticated } from '../utils/auth'
import { getPosterUrl } from '../utils/media'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const GENRES = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCI-FI', 'ROMANCE', 'THRILLER', 'ANIMATION']
const STATUSES = [{ value: '', label: 'All' }, { value: 'RELEASED', label: 'Released' }, { value: 'UPCOMING', label: 'Upcoming' }]

export default function MoviesList() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()
  const admin = isAdmin()
  const authed = isAuthenticated()

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/mba/api/v1/movies', {
        params: {
          name: search || undefined,
          genre: genre || undefined,
          releaseStatus: status || undefined,
        }
      })
      setMovies(res.data.data || res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.err || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }, [search, genre, status])

  useEffect(() => {
    const t = setTimeout(fetchMovies, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchMovies, search])

  const deleteMovie = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    setDeleting(id)
    try {
      await api.delete(`/mba/api/v1/movies/${id}`)
      setMovies(prev => prev.filter(m => m._id !== id && m.id !== id))
      toast.success(`"${name}" deleted`)
    } catch (err) {
      toast.error(err.response?.data?.err || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Movies</h2>
          <p className="muted">{movies.length} title{movies.length !== 1 ? 's' : ''} found</p>
        </div>
        {admin && <Link to="/movies/new" className="btn">+ Add Movie</Link>}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-field">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search movies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {GENRES.map(g => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
        </select>

        <div className="status-tabs">
          {STATUSES.map(s => (
            <button
              key={s.value}
              className={`status-tab ${status === s.value ? 'active' : ''}`}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner text="Loading movies…" />
      ) : movies.length === 0 ? (
        <EmptyState
          icon="🎬"
          title="No movies found"
          subtitle={search || genre || status ? 'Try adjusting your filters' : 'No movies have been added yet'}
          action={admin && <Link to="/movies/new" className="btn">Add First Movie</Link>}
        />
      ) : (
        <div className="movies-grid">
          {movies.map((m, idx) => (
            <div key={m._id || m.id} className="card movie-card fade-in-up" style={{ '--delay': `${idx * 0.05}s` }}>
              <div className="movie-media">
                {getPosterUrl(m) ? (
                  <img className="poster" src={getPosterUrl(m)} alt={`${m.name} poster`} loading="lazy" />
                ) : (
                  <div className="poster poster-fallback">
                    <span>{m.name?.[0] || 'M'}</span>
                  </div>
                )}
                {m.releaseStatus === 'UPCOMING' && (
                  <div className="movie-badge">Coming Soon</div>
                )}
              </div>

              <div className="movie-body">
                <div>
                  <div className="movie-title-row">
                    <strong className="movie-name">{m.name}</strong>
                  </div>
                  <div className="movie-meta">
                    <span className="meta-item">🎬 {m.director}</span>
                    <span className="meta-item">📅 {m.releaseDate ? new Date(m.releaseDate).getFullYear() : '—'}</span>
                  </div>
                  {m.genre?.length > 0 && (
                    <div className="genre-tags">
                      {m.genre.slice(0, 2).map(g => (
                        <span key={g} className="genre-tag">{g}</span>
                      ))}
                    </div>
                  )}
                  <p className="movie-desc muted">{m.description}</p>
                </div>

                <div className="movie-actions">
                  {authed && (
                    <Link className="btn btn-sm" to={`/shows?movie=${m._id || m.id}`}>
                      Book Tickets
                    </Link>
                  )}
                  {!authed && (
                    <Link className="btn btn-ghost btn-sm" to="/login">Sign in to book</Link>
                  )}
                  {admin && (
                    <>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => navigate(`/movies/edit/${m._id || m.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteMovie(m._id || m.id, m.name)}
                        disabled={deleting === (m._id || m.id)}
                      >
                        {deleting === (m._id || m.id) ? '…' : 'Delete'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
