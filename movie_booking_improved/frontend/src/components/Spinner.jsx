import React from 'react'

export default function Spinner({ size = 'md', text = '' }) {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  )
}
