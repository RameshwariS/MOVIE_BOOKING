import React, { useEffect, useState } from 'react'
import api from '../api'

export default function MyBookings() {
    const [bookings, setBookings] = useState([])
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)

    const fetchBookings = async () => {
        setLoading(true)
        setErr('')
        try {
            const res = await api.get('/mba/api/v1/bookings')
            setBookings(res.data.data || res.data)
        } catch (e) {
            setErr(e.response?.data?.err || e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchBookings() }, [])

    const cancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return
        setErr('')
        try {
            await api.patch(`/mba/api/v1/bookings/${id}/cancel`)
            fetchBookings()
        } catch (e) {
            setErr(e.response?.data?.err || e.message)
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>My Bookings</h2>
                    <p className="muted">Manage your tickets and booking history.</p>
                </div>
            </div>

            {err && <div className="error">{err}</div>}

            {loading ? (
                <div className="empty-state">Loading your bookings...</div>
            ) : (
                <div className="bookings-grid">
                    {bookings && bookings.length ? bookings.map(b => (
                        <div key={b._id || b.id} className="card booking-card">
                            <div className="booking-header">
                                <div>
                                    <h3>{b.movie?.name || 'Movie'}</h3>
                                    <div className="muted">{b.theater?.name || 'Theater'}</div>
                                </div>
                                <div className={`badge status-${b.status?.toLowerCase()}`}>{b.status}</div>
                            </div>

                            <div className="booking-details">
                                <div className="detail-item">
                                    <span className="label">Seats:</span>
                                    <span className="value">{b.seats?.join(', ')}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Price:</span>
                                    <span className="value">₹{b.totalPrice}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Payment:</span>
                                    <span className="value">{b.paymentStatus}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Date:</span>
                                    <span className="value">{new Date(b.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {b.status === 'CREATED' && (
                                <div className="item-actions">
                                    <button className="btn btn-outline" onClick={() => cancel(b._id || b.id)}>Cancel Booking</button>
                                    {b.paymentStatus === 'PENDING' && (
                                        <button className="btn" onClick={() => alert('Payment flow coming soon!')}>Pay Now</button>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="empty-state">You haven't made any bookings yet.</div>
                    )}
                </div>
            )}
        </div>
    )
}
