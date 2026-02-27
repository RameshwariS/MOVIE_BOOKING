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
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute requireRole={['THEATER_OWNER', 'OWNER', 'ADMIN']}><OwnerDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  )
}
