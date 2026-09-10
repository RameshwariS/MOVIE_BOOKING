import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import SeatMap from '../components/SeatMap'
import { toast } from '../utils/toast'
import { isAuthenticated } from '../utils/auth'

export default function Booking() {
    const { showId } = useParams()
    const navigate = useNavigate()
    const [show, setShow] = useState(null)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [message, setMessage] = useState('')
    const [selectedSeats, setSelectedSeats] = useState([])
    const authed = isAuthenticated()

    useEffect(() => {
        if (!authed) {
            navigate('/login')
            return
        }
        fetchShowDetails()
    }, [showId])

    const fetchShowDetails = async () => {
        setLoading(true)
        setErr('')
        try {
            const res = await api.get(`/mba/api/v1/shows/${showId}`)
            setShow(res.data.data || res.data)
        } catch (e) {
            toast.error(e.response?.data?.err || e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleBooking = async () => {
        setErr('')
        setMessage('')
        if (!selectedSeats.length) {
            toast.error('Please select at least one seat.')
            return
        }
        try {
            const res = await api.post('/mba/api/v1/bookings', { showId, seats: selectedSeats })
            toast.success('Booking created! Redirecting to payment…')
            setTimeout(() => navigate(`/payment/${res.data?.data?._id || res.data._id}`), 1500)
        } catch (e) {
            toast.error(e.response?.data?.err || e.message)
        }
    }

    if (loading) return <div className="page"><div className="empty-state">Loading show details...</div></div>
    if (err) return <div className="page"><div className="error">{err}</div><Link to="/shows" className="btn btn-ghost mt-12">Back to Shows</Link></div>
    if (!show) return <div className="page"><div className="empty-state">Show not found.</div></div>

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>Select Your Seats</h2>
                    <p className="muted">{show.movie?.name} @ {show.theater?.name}</p>
                    <p className="small-text muted">{show.startTime ? new Date(show.startTime).toLocaleString() : '—'}</p>
                </div>
                <Link to={`/shows?movie=${show.movie?._id || show.movie?.id}`} className="link">Back to showtimes</Link>
            </div>

            {message && <div className="card success mb-12">{message}</div>}

            <div className="booking-layout">
                <div className="seat-selection-section card">
                    <SeatMap
                        totalSeats={show.totalSeats}
                        bookedSeats={show.bookedSeats}
                        selectedSeats={selectedSeats}
                        onSelect={setSelectedSeats}
                    />
                </div>

                <div className="booking-sidebar card">
                    <h3>Booking Summary</h3>
                    <hr className="divider" />
                    <div className="summary-details">
                        <div className="summary-item">
                            <span className="label">Movie</span>
                            <span className="value">{show.movie?.name}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Theater</span>
                            <span className="value">{show.theater?.name}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Price per seat</span>
                            <span className="value">₹{show.price}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Selected Seats</span>
                            <span className="value">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span>
                        </div>
                    </div>
                    <hr className="divider" />
                    <div className="summary-total">
                        <span className="label">Total Amount</span>
                        <span className="value">₹{selectedSeats.length * show.price}</span>
                    </div>
                    <button
                        className="btn btn-block mt-12"
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0}
                    >
                        Confirm & Pay
                    </button>
                </div>
            </div>
        </div>
    )
}
