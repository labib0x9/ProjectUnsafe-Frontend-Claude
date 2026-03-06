import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, role, isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-bracket">[</span>
          <span className="logo-text">PROJECT</span>
          <span className="logo-unsafe">UNSAFE</span>
          <span className="logo-bracket">]</span>
        </Link>

        <div className="navbar-links">
          <Link to="/labs" className={`nav-link ${isActive('/labs') ? 'active' : ''}`}>
            <span className="nav-link-prefix">~/</span>labs
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <span className="nav-link-prefix">~/</span>dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`nav-link nav-link-admin ${isActive('/admin') ? 'active' : ''}`}>
              <span className="nav-link-prefix">~/</span>admin
            </Link>
          )}
        </div>

        <div className="navbar-auth">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <div className="navbar-user-menu">
              <div className="navbar-user-info">
                <span className="user-role-badge">
                  {role === 'anonymous' ? '👤 anon' : role === 'admin' ? '⚡ admin' : '●'}
                </span>
                <span className="user-name">{user?.username}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
