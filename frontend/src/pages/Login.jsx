import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try{
      const res = await api.post('/mba/api/v1/users/login', { email, password })
      const { token } = res.data.data || res.data // service returns token in data or directly
      // handle both shapes
      const tok = token || (res.data && res.data.token) || (res.data && res.data.data && res.data.data.token)
      if (!tok) {
        // fallback: some responses wrap differently
        // try to get token from res.data
        throw new Error('Login failed: token missing')
      }
      localStorage.setItem('token', tok)
      navigate('/')
    }catch(err){
      setErr(err.response?.data?.err || err.message)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {err && <div className="error">{err}</div>}
      <form onSubmit={submit} className="form">
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button>Login</button>
      </form>
    </div>
  )
}