export const getStoredUser = () => {
  const raw = localStorage.getItem('user')
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch (e) {
      // ignore malformed user data
    }
  }

  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const decoded = atob(padded)
    const parsed = JSON.parse(decoded)
    return { id: parsed.id, role: parsed.role }
  } catch (e) {
    return null
  }
}

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'))
}

export const isAdmin = () => {
  const user = getStoredUser()
  return user && user.role === 'ADMIN'
}

export const isTheaterOwner = () => {
  const user = getStoredUser()
  return user && (user.role === 'THEATER_OWNER' || user.role === 'OWNER')
}

export const isAdminOrOwner = () => {
  return isAdmin() || isTheaterOwner()
}

export const hasRole = (roles) => {
  if (!roles) return true
  const user = getStoredUser()
  if (!user) return false
  const list = Array.isArray(roles) ? roles : [roles]
  return list.includes(user.role)
}
