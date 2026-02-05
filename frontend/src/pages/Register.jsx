import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try{
      await api.post('/mba/api/v1/users/register', { name, email, password })
      navigate('/login')
    }catch(err){
      setErr(err.response?.data?.err || err.message)
    }
  }

  return (
    <div>
      <h2>Register</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit} className="form">
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button>Register</button>
      </form>
    </div>
  )
}