import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MoviesList from './pages/MoviesList'
import MovieForm from './pages/MovieForm'
import TheatersList from './pages/TheatersList'
import Shows from './pages/Shows'
import OwnerDashboard from './pages/OwnerDashboard'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import MyBookings from './pages/MyBookings'
import Payment from './pages/Payment'
import Booking from './pages/Booking'
import ToastContainer from './components/Toast'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/movies" element={<MoviesList />} />
          <Route path="/movies/new" element={<ProtectedRoute requireAdmin><MovieForm /></ProtectedRoute>} />
          <Route path="/movies/edit/:id" element={<ProtectedRoute requireAdmin><MovieForm edit /></ProtectedRoute>} />

          <Route path="/theaters" element={<TheatersList />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/booking/:showId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute requireRole={['THEATER_OWNER', 'OWNER', 'ADMIN']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-icon">404</div>
      <h2>Page Not Found</h2>
      <p className="muted">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Go Home</a>
    </div>
  )
}
