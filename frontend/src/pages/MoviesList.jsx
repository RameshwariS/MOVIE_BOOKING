import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { isAdmin, isAuthenticated } from '../utils/auth'
import { getPosterUrl } from '../utils/media'

export default function MoviesList(){
  const [movies, setMovies] = useState([])
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const admin = isAdmin()
  const authed = isAuthenticated()

  const fetch = async ()=>{
    try{
      const res = await api.get('/mba/api/v1/movies')
      const data = res.data.data || res.data
      setMovies(data)
    }catch(err){
      setErr(err.response?.data?.err || err.message)
    }
  }

  useEffect(()=>{ fetch() }, [])

  const deleteMovie = async (id)=>{
    if(!window.confirm('Delete movie?')) return
    try{
      await api.delete(`/mba/api/v1/movies/${id}`)
      setMovies(movies.filter(m=>m._id !== id && m.id !== id))
    }catch(err){
      setErr(err.response?.data?.err || err.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Movies</h2>
          <p className="muted">Manage titles, descriptions, and release dates.</p>
        </div>
        {admin && (
          <div className="actions">
            <Link to="/movies/new" className="btn">Add movie</Link>
          </div>
        )}
      </div>
      {err && <div className="error">{err}</div>}
      <ul className="list grid">
        {movies && movies.length ? movies.map(m => (
          <li key={m._id || m.id} className="card movie-card">
            <div className="movie-media">
              {getPosterUrl(m) ? (
                <img className="poster" src={getPosterUrl(m)} alt={`${m.name} poster`} />
              ) : (
                <div className="poster poster-fallback">
                  <span>{m.name ? m.name[0] : 'M'}</span>
                </div>
              )}
            </div>
            <div className="movie-body">
              <div className="movie-title">
                <strong>{m.name}</strong>
                <small>{new Date(m.releaseDate).toLocaleDateString()}</small>
              </div>
              <div className="muted">{m.description}</div>
              {authed && (
                <div className="item-actions">
                  <Link className="btn btn-ghost" to={`/shows?movie=${m._id || m.id}`}>Book</Link>
                </div>
              )}
            </div>
            {admin && (
              <div className="item-actions">
                <button className="btn btn-light" onClick={()=>navigate(`/movies/edit/${m._id || m.id}`)}>Edit</button>
                <button className="btn btn-outline" onClick={()=>deleteMovie(m._id || m.id)}>Delete</button>
              </div>
            )}
          </li>
        )) : <li>No movies found</li>}
      </ul>
    </div>
  )
}
