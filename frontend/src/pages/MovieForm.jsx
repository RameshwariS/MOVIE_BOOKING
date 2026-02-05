import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

export default function MovieForm({ edit }){
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [casts, setCasts] = useState('')
  const [trailerURL, setTrailerURL] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [director, setDirector] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const params = useParams()

  useEffect(()=>{
    if(edit && params.id){
      api.get(`/mba/api/v1/movies/${params.id}`)
      .then(res=>{
        const m = res.data.data || res.data
        setName(m.name || '')
        setDescription(m.description || '')
        setCasts((m.casts || []).join(', '))
        setTrailerURL(m.trailerURL || '')
        setReleaseDate(m.releaseDate ? m.releaseDate.split('T')[0] : '')
        setDirector(m.director || '')
      }).catch(e=> setErr(e.response?.data?.err || e.message))
    }
  }, [edit, params.id])

  const submit = async (e)=>{
    e.preventDefault()
    setErr('')
    const payload = {
      name, description, casts: casts.split(',').map(s=>s.trim()).filter(Boolean), trailerURL, releaseDate, director
    }
    try{
      if(edit){
        await api.put(`/mba/api/v1/movies/${params.id}`, payload)
      }else{
        await api.post('/mba/api/v1/movies', payload)
      }
      navigate('/movies')
    }catch(e){
      setErr(e.response?.data?.err || e.message)
    }
  }

  return (
    <div>
      <h2>{edit ? 'Edit Movie' : 'Create Movie'}</h2>
      {err && <div className="error">{err}</div>}
      <form className="form" onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} required />
        <label>Casts (comma separated)</label>
        <input value={casts} onChange={e=>setCasts(e.target.value)} />
        <label>Trailer URL</label>
        <input value={trailerURL} onChange={e=>setTrailerURL(e.target.value)} />
        <label>Release Date</label>
        <input type="date" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} />
        <label>Director</label>
        <input value={director} onChange={e=>setDirector(e.target.value)} />
        <button>{edit ? 'Update' : 'Create'}</button>
      </form>
    </div>
  )
}