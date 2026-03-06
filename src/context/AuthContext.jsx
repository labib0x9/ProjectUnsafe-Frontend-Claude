import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // role: 'guest' | 'anonymous' | 'user' | 'admin'
  const [role, setRole] = useState('guest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('pu_session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        // Check expiry for anonymous
        if (session.role === 'anonymous') {
          const now = Date.now()
          if (now > session.expiresAt) {
            localStorage.removeItem('pu_session')
            setRole('guest')
          } else {
            setUser(session.user)
            setRole(session.role)
          }
        } else {
          setUser(session.user)
          setRole(session.role)
        }
      } catch {
        localStorage.removeItem('pu_session')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const data = await authService.login(username, password)
    const session = {
      user: data.user,
      role: data.user.isAdmin ? 'admin' : 'user',
      token: data.token
    }
    localStorage.setItem('pu_session', JSON.stringify(session))
    setUser(data.user)
    setRole(session.role)
    return data
  }

  const signup = async (username, email, password) => {
    const data = await authService.signup(username, email, password)
    const session = { user: data.user, role: 'user', token: data.token }
    localStorage.setItem('pu_session', JSON.stringify(session))
    setUser(data.user)
    setRole('user')
    return data
  }

  const loginAnonymous = async () => {
    const data = await authService.loginAnonymous()
    const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutes
    const session = { user: data.user, role: 'anonymous', expiresAt, token: data.token }
    localStorage.setItem('pu_session', JSON.stringify(session))
    setUser(data.user)
    setRole('anonymous')
    return data
  }

  const logout = () => {
    localStorage.removeItem('pu_session')
    setUser(null)
    setRole('guest')
  }

  const getToken = () => {
    const stored = localStorage.getItem('pu_session')
    if (!stored) return null
    try { return JSON.parse(stored).token } catch { return null }
  }

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      isGuest: role === 'guest',
      isAnonymous: role === 'anonymous',
      isUser: role === 'user' || role === 'admin',
      isAdmin: role === 'admin',
      isAuthenticated: role !== 'guest',
      login, signup, loginAnonymous, logout, getToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
