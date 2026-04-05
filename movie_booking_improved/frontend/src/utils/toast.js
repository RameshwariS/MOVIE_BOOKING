/**
 * Lightweight toast notification system.
 * Usage: import { toast } from '../utils/toast'
 *        toast.success('Booking confirmed!')
 *        toast.error('Something went wrong')
 */

let _render = null

export const _register = (fn) => { _render = fn }

const push = (message, type = 'info', duration = 3500) => {
  if (_render) _render({ message, type, duration, id: Date.now() + Math.random() })
}

export const toast = {
  success: (msg, dur) => push(msg, 'success', dur),
  error:   (msg, dur) => push(msg, 'error',   dur ?? 5000),
  info:    (msg, dur) => push(msg, 'info',    dur),
}
