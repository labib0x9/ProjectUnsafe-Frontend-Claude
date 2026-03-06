import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { labService } from '../../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const { user, role, isAnonymous } = useAuth()
  const [container, setContainer] = useState(null)
  const [recentLabs, setRecentLabs] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock container state
  useEffect(() => {
    const stored = sessionStorage.getItem('pu_container')
    if (stored) {
      try { setContainer(JSON.parse(stored)) } catch {}
    }
    // Mock recent labs
    setRecentLabs([
      { id: 'lab-ssh-basics', title: 'SSH Basics', difficulty: 'easy', lastSeen: '2h ago', status: 'in-progress' },
      { id: 'lab-network-scanning', title: 'Network Scanning', difficulty: 'medium', lastSeen: '1d ago', status: 'completed' },
    ])
  }, [])

  const handleTerminate = async () => {
    if (!container) return
    setLoading(true)
    try {
      await labService.terminateLab(container.containerId)
      sessionStorage.removeItem('pu_container')
      setContainer(null)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!container) return
    setLoading(true)
    try {
      await labService.resetLab(container.containerId)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Dashboard
          </h1>
          <p className="text-secondary" style={{marginTop:4}}>
            Welcome back, <span className="text-green">{user?.username}</span>
            {isAnonymous && <span className="badge badge-blue" style={{marginLeft:8}}>anonymous</span>}
          </p>
        </div>
        {isAnonymous && (
          <div className="alert alert-warn anon-warning">
            ⚠ Anonymous session — progress is not saved. <Link to="/signup">Create an account</Link> to keep it.
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Account Info */}
        <div className="card account-card">
          <p className="section-title" style={{marginBottom:16}}>account</p>
          <div className="account-rows">
            <div className="account-row">
              <span className="account-key text-muted">username</span>
              <span className="account-val">{user?.username}</span>
            </div>
            <div className="account-row">
              <span className="account-key text-muted">role</span>
              <span className={`account-val ${role === 'admin' ? 'text-orange' : 'text-green'}`}>{role}</span>
            </div>
            {user?.email && (
              <div className="account-row">
                <span className="account-key text-muted">email</span>
                <span className="account-val text-secondary">{user.email}</span>
              </div>
            )}
            {isAnonymous && (
              <div className="account-row">
                <span className="account-key text-muted">expires</span>
                <span className="account-val text-orange">in ~30 min</span>
              </div>
            )}
          </div>
        </div>

        {/* Container Status */}
        <div className="card container-card">
          <p className="section-title" style={{marginBottom:16}}>container status</p>
          {container ? (
            <>
              <div className="container-status-row">
                <span className="status-dot running"></span>
                <span className="text-green">Running</span>
                <span className="text-muted" style={{marginLeft:'auto', fontSize:12}}>{container.containerId}</span>
              </div>
              <div className="container-lab-name">{container.labTitle || 'Active Lab'}</div>
              <div className="container-actions">
                <Link to={`/labs/${container.labId}`} className="btn btn-primary btn-sm">
                  Resume Lab
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={loading}>
                  Reset
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleTerminate} disabled={loading}>
                  {loading ? <span className="spinner" style={{width:12,height:12}}></span> : 'Terminate'}
                </button>
              </div>
            </>
          ) : (
            <div className="no-container">
              <span className="status-dot stopped"></span>
              <span className="text-muted">No active container</span>
              <Link to="/labs" className="btn btn-outline-green btn-sm" style={{marginTop:12}}>
                Browse Labs
              </Link>
            </div>
          )}
        </div>

        {/* Recent Labs */}
        <div className="card recent-labs-card">
          <p className="section-title" style={{marginBottom:16}}>recent labs</p>
          {recentLabs.length > 0 ? (
            <div className="recent-labs-list">
              {recentLabs.map(lab => (
                <div key={lab.id} className="recent-lab-item">
                  <div className="recent-lab-info">
                    <span className={`badge badge-${lab.difficulty}`}>{lab.difficulty}</span>
                    <span className="recent-lab-title">{lab.title}</span>
                  </div>
                  <div className="recent-lab-meta">
                    <span className={`recent-lab-status status-${lab.status}`}>
                      {lab.status === 'completed' ? '✓ done' : '◌ in progress'}
                    </span>
                    <span className="text-muted" style={{fontSize:11}}>{lab.lastSeen}</span>
                    <Link to={`/labs/${lab.id}`} className="btn btn-ghost btn-sm">
                      {lab.status === 'completed' ? 'Replay' : 'Continue'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{fontSize:13}}>No labs started yet. <Link to="/labs">Browse labs →</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}
