import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function Login() {
  const { login, loginAnonymous } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [anonLoading, setAnonLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAnon = async () => {
    setAnonLoading(true)
    try {
      await loginAnonymous()
      navigate('/labs')
    } catch (err) {
      setError(err.message)
    } finally {
      setAnonLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span style={{color:'var(--text-muted)'}}>[</span>
            <span>PROJECT</span>
            <span style={{color:'var(--accent-green)'}}>UNSAFE</span>
            <span style={{color:'var(--text-muted)'}}>]</span>
          </Link>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub text-secondary">Access your labs and track progress</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="your_username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="auth-forgot">
            <Link to="/reset-password" className="text-secondary" style={{fontSize:12}}>
              Forgot password?
            </Link>
          </div>
          <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="btn btn-ghost auth-anon-btn" onClick={handleAnon} disabled={anonLoading}>
          {anonLoading ? <span className="spinner"></span> : '⚡ Play Anonymously (30 min session)'}
        </button>

        <p className="auth-switch text-secondary">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </p>

        <div className="auth-hint text-muted">
          <span>Demo: </span>
          <code>admin / admin</code>
          <span> or any username/password</span>
        </div>
      </div>
    </div>
  )
}
