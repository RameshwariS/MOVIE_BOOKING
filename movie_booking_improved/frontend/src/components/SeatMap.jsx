import React from 'react'

const COLS = 10

export default function SeatMap({ totalSeats, bookedSeats = [], selectedSeats = [], onSelect }) {
  const seats = Array.from({ length: totalSeats }, (_, i) => (i + 1).toString())

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return
    onSelect(selectedSeats.includes(seat)
      ? selectedSeats.filter(s => s !== seat)
      : [...selectedSeats, seat]
    )
  }

  const rows = Math.ceil(totalSeats / COLS)

  return (
    <div className="seat-map-container">
      <div className="screen-indicator" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: rows }).map((_, rowIdx) => {
          const rowSeats = seats.slice(rowIdx * COLS, (rowIdx + 1) * COLS)
          const rowLabel = String.fromCharCode(65 + rowIdx)
          return (
            <div key={rowIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                {rowLabel}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 6 }}>
                {rowSeats.map(seat => {
                  const isBooked = bookedSeats.includes(seat)
                  const isSelected = selectedSeats.includes(seat)
                  return (
                    <div
                      key={seat}
                      className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSeat(seat)}
                      title={isBooked ? `Seat ${seat} — booked` : `Seat ${seat}`}
                    >
                      {seat}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="seat-legend">
        <div className="legend-item"><div className="seat" /> Available</div>
        <div className="legend-item"><div className="seat selected" /> Selected</div>
        <div className="legend-item"><div className="seat booked" /> Booked</div>
      </div>
    </div>
  )
}
