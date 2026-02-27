import React, { useState } from 'react'
import api from '../api'
import { isAdmin } from '../utils/auth'

export default function TheatersList(){
  const [theaters, setTheaters] = useState([])
  const [searchName, setSearchName] = useState('')
  const [searchCity, setSearchCity] = useState('')
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [theaterShows, setTheaterShows] = useState({})
  const [theaterLoading, setTheaterLoading] = useState({})
  const [theaterShowErr, setTheaterShowErr] = useState({})
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [err, setErr] = useState('')
  const admin = isAdmin()

  const create = async ()=>{
    try{
      const res = await api.post('/mba/api/v1/theaters', { name, address, city, pinCode })
      const created = res.data.data || res.data
      setTheaters([created, ...theaters])
      setName('')
      setAddress('')
      setCity('')
      setPinCode('')
    }catch(e){
      setErr(e.response?.data?.err || e.message)
    }
  }

  const search = async (e) => {
    if (e) e.preventDefault()
    setSearching(true)
    setSearched(true)
    setErr('')
    try{
      const res = await api.get('/mba/api/v1/theaters', {
        params: {
          name: searchName || undefined,
          city: searchCity || undefined
        }
      })
      setTheaters(res.data.data || res.data)
    }catch(e){
      setErr(e.response?.data?.err || e.message)
      setTheaters([])
    }finally{
      setSearching(false)
    }
  }

  const loadTheaterShows = async (theaterId) => {
    setTheaterLoading((prev)=>({ ...prev, [theaterId]: true }))
    setTheaterShowErr((prev)=>({ ...prev, [theaterId]: '' }))
    try{
      const res = await api.get('/mba/api/v1/shows', {
        params: { theater: theaterId, status: 'SCHEDULED' }
      })
      setTheaterShows((prev)=>({ ...prev, [theaterId]: res.data.data || res.data }))
    }catch(e){
      setTheaterShowErr((prev)=>({ ...prev, [theaterId]: e.response?.data?.err || e.message }))
      setTheaterShows((prev)=>({ ...prev, [theaterId]: [] }))
    }finally{
      setTheaterLoading((prev)=>({ ...prev, [theaterId]: false }))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Theaters</h2>
          <p className="muted">Search theaters by name or city.</p>
        </div>
      </div>
      {err && <div className="error">{err}</div>}
      <form className="search-form" onSubmit={search}>
        <input
          value={searchName}
          onChange={e=>setSearchName(e.target.value)}
          placeholder="Theater name"
        />
        <input
          value={searchCity}
          onChange={e=>setSearchCity(e.target.value)}
          placeholder="City (optional)"
        />
        <button className="btn" disabled={searching}>{searching ? 'Searching...' : 'Search'}</button>
      </form>

      {searched && (
        <div className="theater-grid">
          {theaters && theaters.length ? theaters.map(t => (
            <div key={t._id || t.id} className="card theater-card">
              <h3>{t.name}</h3>
              <div className="muted">{t.address}</div>
              <div className="muted">{t.city} {t.pinCode ? `• ${t.pinCode}` : ''}</div>
              {typeof t.rating === 'number' && <div className="badge rating">Rating {t.rating}</div>}
              <div className="item-actions">
                <button className="btn btn-light" onClick={()=>loadTheaterShows(t._id || t.id)}>
                  {theaterLoading[t._id || t.id] ? 'Loading...' : 'View Movies'}
                </button>
              </div>
              {theaterShowErr[t._id || t.id] && <div className="error">{theaterShowErr[t._id || t.id]}</div>}
              {theaterShows[t._id || t.id] && (
                <div className="theater-shows">
                  {theaterShows[t._id || t.id].length ? theaterShows[t._id || t.id].map(s => (
                    <div key={s._id || s.id} className="show-line">
                      <strong>{s.movie?.name || 'Movie'}</strong>
                      <span className="muted">{s.startTime ? new Date(s.startTime).toLocaleString() : '-'}</span>
                    </div>
                  )) : (
                    <div className="empty-state">No running shows.</div>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="empty-state">No theaters found.</div>
          )}
        </div>
      )}

      {admin && (
        <div className="form panel">
          <label>Create new theater</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address" />
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" />
          <input value={pinCode} onChange={e=>setPinCode(e.target.value)} placeholder="Pin code" />
          <button className="btn" onClick={create}>Create</button>
        </div>
      )}
    </div>
  )
}
