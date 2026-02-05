import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar(){
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/">MovieBooking</Link>
      </div>
      <div className="nav-right">
        <Link to="/movies">Movies</Link>
        <Link to="/theaters">Theaters</Link>
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        {token && <button className="link-button" onClick={logout}>Logout</button>}
      </div>
    </nav>
  )
}