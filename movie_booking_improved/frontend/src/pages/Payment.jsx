import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'
import Spinner from '../components/Spinner'

export default function Payment() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [step, setStep] = useState('summary') // summary | processing | done
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/mba/api/v1/bookings/${bookingId}`)
      .then(res => setBooking(res.data.data || res.data))
      .catch(() => toast.error('Could not load booking'))
      .finally(() => setLoading(false))
  }, [bookingId])

  const handlePay = async () => {
    setPaying(true)
    setStep('processing')
    try {
      // Simulate processing delay for UX
      await new Promise(r => setTimeout(r, 1800))
      await api.patch(`/mba/api/v1/bookings/${bookingId}/pay`)
      setStep('done')
      toast.success('Payment successful! Enjoy the show 🎉')
      setTimeout(() => navigate('/my-bookings'), 2500)
    } catch (e) {
      toast.error(e.response?.data?.err || 'Payment failed. Please try again.')
      setStep('summary')
      setPaying(false)
    }
  }

  if (loading) return <div className="page"><Spinner text="Loading checkout…" /></div>
  if (!booking) return (
    <div className="page">
      <div className="error">Booking not found.</div>
      <Link to="/my-bookings" className="btn btn-ghost" style={{ marginTop: '1rem', display: 'inline-flex' }}>← My Bookings</Link>
    </div>
  )

  if (step === 'processing') return (
    <div className="checkout-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
        <h2>Processing Payment</h2>
        <p className="muted">Please wait, do not close this page…</p>
        <div className="spinner-wrapper" style={{ marginTop: '1.5rem' }}>
          <div className="spinner" />
        </div>
      </div>
    </div>
  )

  if (step === 'done') return (
    <div className="checkout-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2>Payment Successful!</h2>
        <p className="muted">Your tickets are confirmed. Redirecting to your bookings…</p>
      </div>
    </div>
  )

  const show = booking.show
  const showDate = show?.startTime ? new Date(show.startTime) : null

  return (
    <div className="checkout-page">
      <div className="checkout-card card">
        <div className="checkout-header">
          <h2>Checkout</h2>
          <p className="muted">Review and confirm your booking</p>
        </div>

        <div className="checkout-movie-info">
          <div className="checkout-movie-title">🎬 {booking.movie?.name}</div>
          <div className="checkout-movie-meta muted">{booking.theater?.name}</div>
          {showDate && (
            <div className="checkout-movie-meta muted">
              {showDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {showDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <div className="payment-summary">
          <div className="summary-row">
            <span>Seats</span>
            <strong>{booking.seats?.join(', ')}</strong>
          </div>
          <div className="summary-row">
            <span>Price per seat</span>
            <strong>₹{show?.price || '—'}</strong>
          </div>
          <div className="summary-row">
            <span>Number of seats</span>
            <strong>{booking.seats?.length}</strong>
          </div>
          <div className="summary-row total">
            <span>Total Amount</span>
            <strong>₹{booking.totalPrice}</strong>
          </div>
        </div>

        <div className="info-box">
          <strong>🔒 Simulated Payment</strong>
          <p>This is a demo payment gateway. Clicking Pay will confirm your booking instantly.</p>
        </div>

        <button className="btn btn-block btn-large" onClick={handlePay} disabled={paying}>
          {`Pay ₹${booking.totalPrice}`}
        </button>

        <Link to="/my-bookings" className="cancel-link muted">← Back to my bookings</Link>
      </div>
    </div>
  )
}
