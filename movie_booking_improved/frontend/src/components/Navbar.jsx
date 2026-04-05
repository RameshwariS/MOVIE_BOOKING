import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { isAdminOrOwner } from '../utils/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const owner = isAdminOrOwner()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setMenuOpen(false)
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const NavLink = ({ to, children, className = '' }) => (
    <Link
      to={to}
      className={`nav-link ${isActive(to) ? 'nav-link-active' : ''} ${className}`}
      onClick={() => setMenuOpen(false)}
    >
      {children}
    </Link>
  )

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🎬</span>
          <span>CinéBook</span>
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="nav-center">
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/theaters">Theaters</NavLink>
        <NavLink to="/shows">Shows</NavLink>
      </div>

      <div className="nav-right">
        {token && <NavLink to="/my-bookings">My Bookings</NavLink>}
        {owner && <NavLink to="/owner" className="nav-pill">Dashboard</NavLink>}
        {!token && <NavLink to="/login">Sign In</NavLink>}
        {!token && (
          <Link to="/register" className="btn btn-sm" onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        )}
        {token && (
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign Out
          </button>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
        <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-mobile">
          <NavLink to="/movies">Movies</NavLink>
          <NavLink to="/theaters">Theaters</NavLink>
          <NavLink to="/shows">Shows</NavLink>
          {token && <NavLink to="/my-bookings">My Bookings</NavLink>}
          {owner && <NavLink to="/owner">Owner Dashboard</NavLink>}
          {!token && <NavLink to="/login">Sign In</NavLink>}
          {!token && <NavLink to="/register">Register</NavLink>}
          {token && <button className="link-button" onClick={logout}>Sign Out</button>}
        </div>
      )}
    </nav>
  )
}
