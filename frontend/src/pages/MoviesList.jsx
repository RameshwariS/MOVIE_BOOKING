import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function MoviesList(){
  const [movies, setMovies] = useState([])
  const [err, setErr] = useState('')
  const navigate = useNavigate()

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
    <div>
      <h2>Movies</h2>
      <div className="actions">
        <Link to="/movies/new" className="btn">Add movie</Link>
      </div>
      {err && <div className="error">{err}</div>}
      <ul className="list">
        {movies && movies.length ? movies.map(m => (
          <li key={m._id || m.id}>
            <div>
              <strong>{m.name}</strong> <small>({new Date(m.releaseDate).toLocaleDateString()})</small>
              <div>{m.description}</div>
            </div>
            <div className="item-actions">
              <button onClick={()=>navigate(`/movies/edit/${m._id || m.id}`)}>Edit</button>
              <button onClick={()=>deleteMovie(m._id || m.id)}>Delete</button>
            </div>
          </li>
        )) : <li>No movies found</li>}
      </ul>
    </div>
  )
}