import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { getPosterUrl } from '../utils/media'
import { isAuthenticated } from '../utils/auth'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [movieErr, setMovieErr] = useState('')
  const [theaterName, setTheaterName] = useState('')
  const [theaterCity, setTheaterCity] = useState('')
  const [theaters, setTheaters] = useState([])
  const [theaterErr, setTheaterErr] = useState('')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [theaterShows, setTheaterShows] = useState({})
  const [theaterLoading, setTheaterLoading] = useState({})
  const [theaterShowErr, setTheaterShowErr] = useState({})
  const [movieSearch, setMovieSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const authed = isAuthenticated()

  const fetchMovies = async () => {
    try {
      const res = await api.get('/mba/api/v1/movies', {
        params: {
          name: movieSearch || undefined,
          genre: selectedGenre || undefined
        }
      })
      setMovies(res.data.data || res.data)
    } catch (err) {
      setMovieErr(err.response?.data?.err || err.message)
    }
  }

  useEffect(() => { fetchMovies() }, [movieSearch, selectedGenre])

  const searchTheaters = async (e) => {
    if (e) e.preventDefault()
    setSearching(true)
    setSearched(true)
    setTheaterErr('')
    try {
      const res = await api.get('/mba/api/v1/theaters', {
        params: {
          name: theaterName || undefined,
          city: theaterCity || undefined
        }
      })
      setTheaters(res.data.data || res.data)
    } catch (err) {
      setTheaterErr(err.response?.data?.err || err.message)
      setTheaters([])
    } finally {
      setSearching(false)
    }
  }

  const loadTheaterShows = async (theaterId) => {
    setTheaterLoading((prev) => ({ ...prev, [theaterId]: true }))
    setTheaterShowErr((prev) => ({ ...prev, [theaterId]: '' }))
    try {
      const res = await api.get('/mba/api/v1/shows', {
        params: { theater: theaterId, status: 'SCHEDULED' }
      })
      setTheaterShows((prev) => ({ ...prev, [theaterId]: res.data.data || res.data }))
    } catch (err) {
      setTheaterShowErr((prev) => ({ ...prev, [theaterId]: err.response?.data?.err || err.message }))
      setTheaterShows((prev) => ({ ...prev, [theaterId]: [] }))
    } finally {
      setTheaterLoading((prev) => ({ ...prev, [theaterId]: false }))
    }
  }

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <p className="eyebrow">Now showing in your city</p>
          <h1>Book movies faster with a clean, modern flow.</h1>
          <p className="hero-subtitle">
            Explore what’s playing, preview details, and manage your movie list with a sharp, minimal interface.
          </p>
          <div className="hero-actions">
            <Link to="/movies" className="btn">View Movies</Link>
            <Link to="/register" className="btn btn-ghost">Create Account</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top">
            <span>Tonight</span>
            <span className="badge">New</span>
          </div>
          <h3>Neighborhood Premiere</h3>
          <p>Pick a theater, check showtimes, and save your favorites.</p>
          <div className="hero-card-actions">
            <Link to="/theaters" className="link">Find Theaters</Link>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Now Playing</h2>
            <p className="muted">Browse movies without logging in.</p>
          </div>
          <div className="filters">
            <input
              className="search-input"
              placeholder="Search movies..."
              value={movieSearch}
              onChange={e => setMovieSearch(e.target.value)}
            />
            <select
              className="genre-select"
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              <option value="ACTION">Action</option>
              <option value="COMEDY">Comedy</option>
              <option value="DRAMA">Drama</option>
              <option value="HORROR">Horror</option>
              <option value="SCI-FI">Sci-Fi</option>
            </select>
          </div>
          <Link to="/movies" className="link">See all</Link>
        </div>
        {movieErr && <div className="error">{movieErr}</div>}
        <div className="movies-grid">
          {movies && movies.length ? movies.map((m, idx) => (
            <div key={m._id || m.id} className="card movie-card fade-in-up" style={{ '--delay': `${idx * 0.1}s` }}>
              <div className="movie-media">
                {getPosterUrl(m) ? (
                  <img className="poster" src={getPosterUrl(m)} alt={`${m.name} poster`} />
                ) : (
                  <div className="poster poster-fallback">
                    <span>{m.name ? m.name[0] : 'M'}</span>
                  </div>
                )}
              </div>
              <div className="movie-body">
                <div className="movie-title">
                  <strong>{m.name}</strong>
                  <small>{new Date(m.releaseDate).toLocaleDateString()}</small>
                </div>
                <div className="muted">{m.description}</div>
                {authed && (
                  <div className="item-actions">
                    <Link className="btn btn-ghost" to={`/shows?movie=${m._id || m.id}`}>Book</Link>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="empty-state">No movies available yet.</div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Search Theaters</h2>
            <p className="muted">Find theaters by name or city.</p>
          </div>
        </div>
        <form className="search-form" onSubmit={searchTheaters}>
          <input
            value={theaterName}
            onChange={e => setTheaterName(e.target.value)}
            placeholder="Theater name"
          />
          <input
            value={theaterCity}
            onChange={e => setTheaterCity(e.target.value)}
            placeholder="City (optional)"
          />
          <button className="btn" disabled={searching}>{searching ? 'Searching...' : 'Search'}</button>
        </form>
        {theaterErr && <div className="error">{theaterErr}</div>}
        {searched && (
          <div className="theater-grid">
            {theaters && theaters.length ? theaters.map(t => (
              <div key={t._id || t.id} className="card theater-card">
                <h3>{t.name}</h3>
                <div className="muted">{t.address}</div>
                <div className="muted">{t.city} {t.pinCode ? `• ${t.pinCode}` : ''}</div>
                {typeof t.rating === 'number' && <div className="badge rating">Rating {t.rating}</div>}
                <div className="item-actions">
                  <button className="btn btn-light" onClick={() => loadTheaterShows(t._id || t.id)}>
                    {theaterLoading[t._id || t.id] ? 'Loading...' : 'View Movies'}
                  </button>
                </div>
                {theaterShowErr[t._id || t.id] && <div className="error">{theaterShowErr[t._id || t.id]}</div>}
                {theaterShows[t._id || t.id] && (
                  <div className="theater-shows">
                    {theaterShows[t._id || t.id].length ? theaterShows[t._id || t.id].map(s => (
                      <div key={s._id || s.id} className="show-line">
                        <strong>{s.movie?.name || 'Movie'}</strong>
                        <span className="muted">{s.startTime ? new Date(s.startTime).toLocaleString() : '-'}</span>
                      </div>
                    )) : (
                      <div className="empty-state">No running shows.</div>
                    )}
                  </div>
                )}
              </div>
            )) : (
              <div className="empty-state">No theaters found.</div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
