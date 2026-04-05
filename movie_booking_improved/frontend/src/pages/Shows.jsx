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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const navigate = useNavigate()

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

  // Generate next 7 days for the date selector
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push({
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate()
    })
  }

  // Filter shows by selected date
  const filteredShows = (shows || []).filter(s => {
    const showDate = new Date(s.startTime).toISOString().split('T')[0]
    return showDate === selectedDate
  })

  const groupedShows = filteredShows.reduce((acc, s) => {
    const tId = s.theater?._id || s.theater?.id || 'unknown'
    if (!acc[tId]) {
      acc[tId] = {
        theater: s.theater || { name: 'Unknown Theater' },
        shows: []
      }
    }
    acc[tId].shows.push(s)
    return acc
  }, {})

  const theatersList = Object.values(groupedShows)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Available Showtimes</h2>
          <p className="muted">Book your tickets for the selected date.</p>
        </div>
        {movieId && <Link to="/movies" className="link">Back to movies</Link>}
      </div>

      <div className="date-selector">
        {dates.map(d => (
          <div
            key={d.full}
            className={`date-tab ${selectedDate === d.full ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.full)}
          >
            <span className="day">{d.day}</span>
            <span className="date">{d.date}</span>
          </div>
        ))}
      </div>

      {err && <div className="error">{err}</div>}

      {loading ? (
        <div className="empty-state">Loading showtimes...</div>
      ) : (
        <div className="theater-group-grid">
          {theatersList.length ? theatersList.map(({ theater, shows: theaterShows }) => {
            const tId = theater._id || theater.id

            return (
              <div key={tId} className="card theater-group-card">
                <div className="theater-card-content">
                  <div className="theater-info-section">
                    <div className="theater-header">
                      <h3>{theater.name}</h3>
                      {typeof theater.rating === 'number' && <span className="rating-badge">★ {theater.rating}</span>}
                    </div>
                    <p className="muted small-text">{theater.address}, {theater.city}</p>
                  </div>

                  <div className="showtimes-section">
                    <p className="section-label">Showtimes for {new Date(selectedDate).toLocaleDateString()}</p>
                    <div className="showtime-chips">
                      {theaterShows.map(s => {
                        const sid = s._id || s.id
                        return (
                          <button
                            key={sid}
                            className="showtime-chip"
                            onClick={() => navigate(`/booking/${sid}`)}
                          >
                            <span className="time">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="price">₹{s.price}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          }) : (
            <div className="empty-state">No shows available for the selected date.</div>
          )}
        </div>
      )}
    </div>
  )
}
