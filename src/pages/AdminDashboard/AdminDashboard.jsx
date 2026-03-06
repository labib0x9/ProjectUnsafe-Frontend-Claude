import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/api'
import AdminTable from '../../components/AdminTable/AdminTable'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  const [containers, setContainers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [terminatingId, setTerminatingId] = useState(null)
  const [tab, setTab] = useState('containers')
  const [error, setError] = useState('')

  if (!isAdmin) return <Navigate to="/" replace />

  useEffect(() => {
    Promise.all([
      adminService.getContainers(),
      adminService.getUsers(),
    ]).then(([c, u]) => {
      setContainers(c)
      setUsers(u)
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleTerminate = async (containerId) => {
    setTerminatingId(containerId)
    try {
      await adminService.terminateContainer(containerId)
      setContainers(prev => prev.filter(c => c.id !== containerId))
    } catch (e) {
      setError(e.message)
    } finally {
      setTerminatingId(null)
    }
  }

  const stats = {
    containers: containers.length,
    users: users.length,
    anon: users.filter(u => u.username?.startsWith('anon_')).length || 0,
    admins: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="page-wrapper admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">
            <span className="admin-title-icon">⚡</span> Admin Dashboard
          </h1>
          <p className="text-secondary" style={{marginTop:4,fontSize:13}}>
            Container and user management
          </p>
        </div>
        <span className="admin-badge">ADMIN ACCESS</span>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span className="stat-value text-green">{stats.containers}</span>
          <span className="stat-label text-muted">Active Containers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.users}</span>
          <span className="stat-label text-muted">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-blue">{stats.anon}</span>
          <span className="stat-label text-muted">Anonymous Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-orange">{stats.admins}</span>
          <span className="stat-label text-muted">Admins</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'containers' ? 'active' : ''}`} onClick={() => setTab('containers')}>
          Containers <span className="tab-count">{containers.length}</span>
        </button>
        <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Users <span className="tab-count">{users.length}</span>
        </button>
      </div>

      {loading && (
        <div style={{display:'flex',alignItems:'center',gap:12,padding:40}}>
          <span className="spinner"></span>
          <span className="text-muted">Loading admin data...</span>
        </div>
      )}

      {!loading && tab === 'containers' && (
        <AdminTable
          containers={containers}
          onTerminate={handleTerminate}
          terminatingId={terminatingId}
        />
      )}

      {!loading && tab === 'users' && (
        <div className="users-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{color:'var(--text-primary)'}}>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? '' : 'badge-blue'}`}
                      style={u.role === 'admin' ? {color:'var(--accent-orange)',border:'1px solid var(--accent-orange)',background:'rgba(255,140,0,0.08)',padding:'2px 8px',fontSize:11,borderRadius:2} : {}}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="text-muted">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
