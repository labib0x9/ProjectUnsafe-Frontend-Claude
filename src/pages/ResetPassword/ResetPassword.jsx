import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/api'
import '../Login/Auth.css'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-sub text-secondary">We'll send a reset link to your email</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {sent && <div className="alert alert-success">Reset link sent! Check your inbox.</div>}

        {!sent ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <Link to="/login" className="btn btn-primary auth-submit-btn">
            Back to Login
          </Link>
        )}

        <p className="auth-switch text-secondary">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
