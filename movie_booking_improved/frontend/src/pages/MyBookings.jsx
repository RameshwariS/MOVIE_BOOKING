import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const STATUS_CONFIG = {
  CREATED:   { label: 'Pending',   color: 'status-created' },
  CONFIRMED: { label: 'Confirmed', color: 'status-confirmed' },
  CANCELLED: { label: 'Cancelled', color: 'status-cancelled' },
}

const PAYMENT_CONFIG = {
  PENDING:  { label: 'Payment due', color: 'pay-pending' },
  PAID:     { label: 'Paid',        color: 'pay-paid' },
  FAILED:   { label: 'Failed',      color: 'pay-failed' },
  REFUNDED: { label: 'Refunded',    color: 'pay-refunded' },
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [cancelling, setCancelling] = useState(null)
  const navigate = useNavigate()

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mba/api/v1/bookings')
      const data = res.data.data || res.data || []
      setBookings(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (e) {
      toast.error(e.response?.data?.err || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking? Any paid amount will be refunded.')) return
    setCancelling(id)
    try {
      await api.patch(`/mba/api/v1/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (e) {
      toast.error(e.response?.data?.err || 'Cancellation failed')
    } finally {
      setCancelling(null)
    }
  }

  const tabs = ['ALL', 'CREATED', 'CONFIRMED', 'CANCELLED']
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>My Bookings</h2>
          <p className="muted">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="status-tabs">
        {tabs.map(t => (
          <button key={t} className={`status-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'ALL' ? 'All' : STATUS_CONFIG[t]?.label || t}
            {t !== 'ALL' && (
              <span className="tab-count">
                {bookings.filter(b => b.status === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner text="Loading your bookings…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title={filter === 'ALL' ? "No bookings yet" : `No ${filter.toLowerCase()} bookings`}
          subtitle={filter === 'ALL' ? "Browse movies and book your first show!" : "Switch filters to see other bookings"}
          action={filter === 'ALL' && <Link to="/movies" className="btn">Browse Movies</Link>}
        />
      ) : (
        <div className="bookings-grid">
          {filtered.map(b => {
            const statusCfg = STATUS_CONFIG[b.status] || { label: b.status, color: '' }
            const payCfg = PAYMENT_CONFIG[b.paymentStatus] || { label: b.paymentStatus, color: '' }
            const showDate = b.show?.startTime ? new Date(b.show.startTime) : null

            return (
              <div key={b._id || b.id} className="card booking-card">
                <div className="booking-card-header">
                  <div className="booking-movie-info">
                    <h3 className="booking-movie-title">{b.movie?.name || 'Movie'}</h3>
                    <p className="muted booking-theater">{b.theater?.name || 'Theater'}</p>
                    {showDate && (
                      <p className="booking-showtime">
                        📅 {showDate.toLocaleDateString()} · {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <div className="booking-badges">
                    <span className={`badge ${statusCfg.color}`}>{statusCfg.label}</span>
                  </div>
                </div>

                <div className="booking-details-grid">
                  <div className="detail-item">
                    <span className="label">Seats</span>
                    <span className="value seats-value">{b.seats?.join(', ') || '—'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total</span>
                    <span className="value price-value">₹{b.totalPrice}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment</span>
                    <span className={`value ${payCfg.color}`}>{payCfg.label}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booked on</span>
                    <span className="value">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {(b.status === 'CREATED' || b.paymentStatus === 'PENDING') && (
                  <div className="booking-actions">
                    {b.paymentStatus === 'PENDING' && b.status !== 'CANCELLED' && (
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/payment/${b._id || b.id}`)}
                      >
                        Pay Now
                      </button>
                    )}
                    {b.status === 'CREATED' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => cancel(b._id || b.id)}
                        disabled={cancelling === (b._id || b.id)}
                      >
                        {cancelling === (b._id || b.id) ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
