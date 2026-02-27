import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Payment() {
    const { bookingId } = useParams()
    const [booking, setBooking] = useState(null)
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/mba/api/v1/bookings/${bookingId}`)
                setBooking(res.data.data || res.data)
            } catch (e) {
                setErr('Could not find booking.')
            } finally {
                setLoading(false)
            }
        }
        fetchBooking()
    }, [bookingId])

    const handlePay = async () => {
        setPaying(true)
        try {
            await api.patch(`/mba/api/v1/bookings/${bookingId}/pay`) // Assuming payment endpoint exists based on earlier analysis
            alert('Payment Successful!')
            navigate('/my-bookings')
        } catch (e) {
            setErr('Payment failed.')
        } finally {
            setPaying(false)
        }
    }

    if (loading) return <div className="page"><div className="empty-state">Loading checkout...</div></div>
    if (err) return <div className="page"><div className="error">{err}</div></div>
    if (!booking) return <div className="page"><div className="error">Booking not found.</div></div>

    return (
        <div className="page checkout-page">
            <div className="card checkout-card">
                <h2>Checkout</h2>
                <div className="payment-summary">
                    <div className="summary-row">
                        <span>Movie</span>
                        <strong>{booking.movie?.name}</strong>
                    </div>
                    <div className="summary-row">
                        <span>Seats</span>
                        <strong>{booking.seats?.join(', ')}</strong>
                    </div>
                    <div className="summary-row total">
                        <span>Amount to Pay</span>
                        <strong>₹{booking.totalPrice}</strong>
                    </div>
                </div>

                <div className="card info-box">
                    <p>This is a simulated payment gateway. Clicking "Pay" will confirm your booking immediately.</p>
                </div>

                <button className="btn btn-block btn-large" onClick={handlePay} disabled={paying}>
                    {paying ? 'Processing...' : `Pay ₹${booking.totalPrice}`}
                </button>
            </div>
        </div>
    )
}
