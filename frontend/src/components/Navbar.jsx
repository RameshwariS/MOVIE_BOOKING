import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdminOrOwner } from '../utils/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const owner = isAdminOrOwner()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">MovieBooking</Link>
      </div>
      <div className="nav-right">
        <Link to="/movies">Movies</Link>
        <Link to="/theaters">Theaters</Link>
        <Link to="/shows">Shows</Link>
        {token && <Link to="/my-bookings">My Bookings</Link>}
        {owner && <Link to="/owner" className="pill">Owner</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register" className="pill">Register</Link>}
        {token && <button className="link-button" onClick={logout}>Logout</button>}
      </div>
    </nav>
  )
}
