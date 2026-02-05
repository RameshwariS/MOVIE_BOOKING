import React, { useState } from 'react'
import api from '../api'

export default function TheatersList(){
  const [id, setId] = useState('')
  const [theater, setTheater] = useState(null)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const fetchById = async ()=>{
    try{
      const res = await api.get(`/mba/api/v1/theaters/${id}`)
      setTheater(res.data.data || res.data)
    }catch(e){
      setErr(e.response?.data?.err || e.message)
    }
  }

  const create = async ()=>{
    try{
      const res = await api.post('/mba/api/v1/theaters', { name })
      setTheater(res.data.data || res.data)
    }catch(e){
      setErr(e.response?.data?.err || e.message)
    }
  }

  return (
    <div>
      <h2>Theaters</h2>
      {err && <div className="error">{err}</div>}
      <div className="form">
        <label>Create new theater</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
        <button onClick={create}>Create</button>
      </div>

      <div style={{marginTop:20}} className="form">
        <label>Fetch theater by id</label>
        <input value={id} onChange={e=>setId(e.target.value)} placeholder="id" />
        <button onClick={fetchById}>Fetch</button>
      </div>

      {theater && (
        <div className="card">
          <h3>{theater.name}</h3>
          <div>Movies: {theater.movies ? theater.movies.length : 0}</div>
        </div>
      )}
    </div>
  )
}