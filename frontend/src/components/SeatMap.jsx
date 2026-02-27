import React from 'react'

export default function SeatMap({ totalSeats, bookedSeats = [], selectedSeats = [], onSelect }) {
    const rows = Math.ceil(totalSeats / 10)
    const seats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString())

    const toggleSeat = (seat) => {
        if (bookedSeats.includes(seat)) return
        if (selectedSeats.includes(seat)) {
            onSelect(selectedSeats.filter(s => s !== seat))
        } else {
            onSelect([...selectedSeats, seat])
        }
    }

    return (
        <div className="seat-map-container">
            <div className="screen-indicator">SCREEN</div>
            <div className="seat-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                {seats.map(seat => {
                    const isBooked = bookedSeats.includes(seat)
                    const isSelected = selectedSeats.includes(seat)
                    return (
                        <div
                            key={seat}
                            className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleSeat(seat)}
                        >
                            {seat}
                        </div>
                    )
                })}
            </div>
            <div className="seat-legend">
                <div className="legend-item"><div className="seat"></div> Available</div>
                <div className="legend-item"><div className="seat selected"></div> Selected</div>
                <div className="legend-item"><div className="seat booked"></div> Booked</div>
            </div>
        </div>
    )
}
