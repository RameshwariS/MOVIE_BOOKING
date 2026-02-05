import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div>
      <h1>Welcome to Movie Booking</h1>
      <p>Browse movies and theaters, register and login to manage your account.</p>
      <p>
        <Link to="/movies">View Movies</Link>
      </p>
    </div>
  )
}