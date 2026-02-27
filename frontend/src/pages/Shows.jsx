import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'
import { isAuthenticated } from '../utils/auth'
import SeatMap from '../components/SeatMap'
import { useNavigate } from 'react-router-dom'

export default function Shows() {
  const [searchParams] = useSearchParams()
  const movieId = searchParams.get('movie')
  const theaterId = searchParams.get('theater')
  const [shows, setShows] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeShowId, setActiveShowId] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState({})
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const authed = isAuthenticated()

  const fetchShows = async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await api.get('/mba/api/v1/shows', {
        params: {
          movie: movieId || undefined,
          theater: theaterId || undefined
        }
      })
      setShows(res.data.data || res.data)
    } catch (e) {
      setErr(e.response?.data?.err || e.message)
      setShows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchShows() }, [movieId])

  const book = async (showId) => {
    setErr('')
    setMessage('')
    const seats = selectedSeats[showId] || []
    if (!seats.length) {
      setErr('Please select seats from the map.')
      return
    }
    try {
      const res = await api.post('/mba/api/v1/bookings', { showId, seats })
      setMessage(`Booking created! Redirecting to payment...`)
      setSelectedSeats({ ...selectedSeats, [showId]: [] })
      setTimeout(() => navigate(`/payment/${res.data?.data?._id || res.data._id}`), 1500)
    } catch (e) {
      setErr(e.response?.data?.err || e.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Showtimes</h2>
          <p className="muted">Pick a showtime and book seats.</p>
        </div>
        {movieId && <Link to="/movies" className="link">Back to movies</Link>}
      </div>

      {err && <div className="error">{err}</div>}
      {message && <div className="card success">{message}</div>}

      {loading ? (
        <div className="empty-state">Loading shows...</div>
      ) : (
        <div className="shows-grid">
          {shows && shows.length ? shows.map(s => {
            const id = s._id || s.id
            const isActive = activeShowId === id
            const movie = s.movie || {}
            const theater = s.theater || {}
            const available = typeof s.totalSeats === 'number' ? Math.max(s.totalSeats - (s.bookedSeats || []).length, 0) : null

            return (
              <div key={id} className={`card show-card ${isActive ? 'active' : ''}`}>
                <div className="show-info">
                  <div className="show-title-row">
                    <h3>{movie.name || 'Movie'}</h3>
                    <div className={`badge status-${s.status?.toLowerCase()}`}>{s.status}</div>
                  </div>
                  <div className="muted">{theater.name || 'Theater'}</div>

                  <div className="show-meta-simple">
                    <span>🕒 {s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    <span>💰 ₹{s.price}</span>
                    <span>🪑 {available} left</span>
                  </div>
                </div>

                {!isActive ? (
                  <div className="item-actions">
                    <button className="btn btn-outline btn-block" onClick={() => setActiveShowId(id)}>
                      Select Seats
                    </button>
                  </div>
                ) : (
                  <div className="show-booking-panel fade-in">
                    <hr className="divider" />
                    {authed ? (
                      <div className="show-booking-flow">
                        <SeatMap
                          totalSeats={s.totalSeats}
                          bookedSeats={s.bookedSeats}
                          selectedSeats={selectedSeats[id] || []}
                          onSelect={(seats) => setSelectedSeats({ ...selectedSeats, [id]: seats })}
                        />
                        <div className="booking-summary">
                          <div>Selected: {(selectedSeats[id] || []).length} seats</div>
                          <div>Total: ₹{(selectedSeats[id] || []).length * s.price}</div>
                        </div>
                        <div className="inline-actions">
                          <button className="btn btn-block" onClick={() => book(id)} disabled={(selectedSeats[id] || []).length === 0}>
                            Book & Pay
                          </button>
                          <button className="btn btn-ghost" onClick={() => setActiveShowId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="login-prompt">
                        <Link to="/login" className="btn btn-block">Login to book</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }) : (
            <div className="empty-state">No shows available.</div>
          )}
        </div>
      )}
    </div>
  )
}
