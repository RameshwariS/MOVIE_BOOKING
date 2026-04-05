import React, { useState, useCallback, useEffect } from 'react'
import { _register } from '../utils/toast'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const add = useCallback((t) => {
    setToasts(prev => [...prev, t])
    setTimeout(() => remove(t.id), t.duration || 3500)
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  useEffect(() => { _register(add) }, [add])

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
          <span className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
