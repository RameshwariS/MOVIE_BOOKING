import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MoviesList from './pages/MoviesList'
import MovieForm from './pages/MovieForm'
import TheatersList from './pages/TheatersList'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />

          <Route path="/movies" element={<MoviesList/>} />
          <Route path="/movies/new" element={<ProtectedRoute><MovieForm/></ProtectedRoute>} />
          <Route path="/movies/edit/:id" element={<ProtectedRoute><MovieForm edit/></ProtectedRoute>} />

          <Route path="/theaters" element={<TheatersList/>} />
        </Routes>
      </div>
    </div>
  )
}