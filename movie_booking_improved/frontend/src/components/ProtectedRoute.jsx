import React from 'react'
import { Navigate } from 'react-router-dom'
import { hasRole, isAdmin } from '../utils/auth'

export default function ProtectedRoute({ children, requireAdmin = false, requireRole }){
  const token = localStorage.getItem('token')
  if(!token) return <Navigate to="/login" replace />
  if(requireAdmin && !isAdmin()) return <Navigate to="/" replace />
  if(requireRole && !hasRole(requireRole)) return <Navigate to="/" replace />
  return children
}
