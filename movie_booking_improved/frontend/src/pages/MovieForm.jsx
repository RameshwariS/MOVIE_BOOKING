import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'
import { toast } from '../utils/toast'

const GENRES = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCI-FI', 'ROMANCE', 'THRILLER', 'ANIMATION', 'DOCUMENTARY']
const LANGUAGES = ['ENG', 'HIN', 'TAM', 'TEL', 'MAL', 'KAN', 'BEN', 'MAR']

export default function MovieForm({ edit }) {
  const [form, setForm] = useState({
    name: '', description: '', director: '', releaseDate: '',
    trailerURL: '', posterURL: '', casts: '', releaseStatus: 'RELEASED',
    genre: [], language: ['ENG'],
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(edit)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    if (!edit || !id) return
    api.get(`/mba/api/v1/movies/${id}`)
      .then(res => {
        const m = res.data.data || res.data
        setForm({
          name: m.name || '',
          description: m.description || '',
          director: m.director || '',
          releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '',
          trailerURL: m.trailerURL || '',
          posterURL: m.posterURL || '',
          casts: (m.casts || []).join(', '),
          releaseStatus: m.releaseStatus || 'RELEASED',
          genre: m.genre || [],
          language: m.language || ['ENG'],
        })
      })
      .catch(() => toast.error('Failed to load movie'))
      .finally(() => setFetching(false))
  }, [edit, id])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleArr = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Movie name is required'); return }
    if (!form.description.trim()) { toast.error('Description is required'); return }
    if (!form.director.trim()) { toast.error('Director is required'); return }
    if (!form.releaseDate) { toast.error('Release date is required'); return }
    if (form.genre.length === 0) { toast.error('Select at least one genre'); return }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      director: form.director.trim(),
      releaseDate: form.releaseDate,
      trailerURL: form.trailerURL.trim() || undefined,
      posterURL: form.posterURL.trim() || undefined,
      casts: form.casts.split(',').map(s => s.trim()).filter(Boolean),
      releaseStatus: form.releaseStatus,
      genre: form.genre,
      language: form.language.length ? form.language : ['ENG'],
    }

    setLoading(true)
    try {
      if (edit) {
        await api.put(`/mba/api/v1/movies/${id}`, payload)
        toast.success('Movie updated!')
      } else {
        await api.post('/mba/api/v1/movies', payload)
        toast.success('Movie created!')
      }
      navigate('/movies')
    } catch (err) {
      toast.error(err.response?.data?.err || err.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="page"><div className="spinner-wrapper"><div className="spinner" /></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{edit ? 'Edit Movie' : 'Add New Movie'}</h2>
          <p className="muted">{edit ? 'Update movie information' : 'Fill in the details to add a new title'}</p>
        </div>
        <Link to="/movies" className="btn btn-ghost btn-sm">← Cancel</Link>
      </div>

      <form className="form movie-form" onSubmit={submit}>
        <div className="form-section">
          <h3 className="form-section-title">Basic Info</h3>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="name">Movie Title <span className="required">*</span></label>
              <input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Inception" required />
            </div>
            <div className="field">
              <label htmlFor="director">Director <span className="required">*</span></label>
              <input id="director" value={form.director} onChange={e => update('director', e.target.value)} placeholder="e.g. Christopher Nolan" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description <span className="required">*</span></label>
            <textarea id="description" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief synopsis…" rows={4} required />
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="releaseDate">Release Date <span className="required">*</span></label>
              <input id="releaseDate" type="date" value={form.releaseDate} onChange={e => update('releaseDate', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="releaseStatus">Status</label>
              <select id="releaseStatus" value={form.releaseStatus} onChange={e => update('releaseStatus', e.target.value)}>
                <option value="RELEASED">Released</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Cast Members <span className="hint">(comma-separated)</span></label>
            <input value={form.casts} onChange={e => update('casts', e.target.value)} placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt" />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Genre & Language</h3>
          <div className="field">
            <label>Genre <span className="required">*</span></label>
            <div className="chip-group">
              {GENRES.map(g => (
                <button
                  key={g} type="button"
                  className={`chip ${form.genre.includes(g) ? 'chip-active' : ''}`}
                  onClick={() => toggleArr('genre', g)}
                >
                  {g.charAt(0) + g.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Language</label>
            <div className="chip-group">
              {LANGUAGES.map(l => (
                <button
                  key={l} type="button"
                  className={`chip ${form.language.includes(l) ? 'chip-active' : ''}`}
                  onClick={() => toggleArr('language', l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Media</h3>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="posterURL">Poster URL</label>
              <input id="posterURL" value={form.posterURL} onChange={e => update('posterURL', e.target.value)} placeholder="https://…" />
            </div>
            <div className="field">
              <label htmlFor="trailerURL">Trailer URL</label>
              <input id="trailerURL" value={form.trailerURL} onChange={e => update('trailerURL', e.target.value)} placeholder="https://youtube.com/…" />
            </div>
          </div>
          {form.posterURL && (
            <div className="poster-preview">
              <img src={form.posterURL} alt="Poster preview" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {loading ? 'Saving…' : edit ? 'Update Movie' : 'Create Movie'}
          </button>
          <Link to="/movies" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
