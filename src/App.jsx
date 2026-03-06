import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'

// Pages
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import Signup from './pages/Signup/Signup'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import Labs from './pages/Labs/Labs'
import LabPage from './pages/LabPage/LabPage'
import Dashboard from './pages/Dashboard/Dashboard'
import Playground from './pages/Playground/Playground'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'

// Route guards
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}><span className="spinner"></span></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />
  return children
}

function GuestRedirect({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth */}
        <Route path="/login"          element={<GuestRedirect><Login /></GuestRedirect>} />
        <Route path="/signup"         element={<GuestRedirect><Signup /></GuestRedirect>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public */}
        <Route path="/labs"      element={<Labs />} />
        <Route path="/labs/:labId" element={<LabPage />} />

        {/* Playground — auth required */}
        <Route path="/playground" element={
          <ProtectedRoute><Playground /></ProtectedRoute>
        } />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
