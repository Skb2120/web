import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminResourcePage from './pages/admin/AdminResourcePage'
import MessagesPage from './pages/admin/MessagesPage'
import ChatLeadsPage from './pages/admin/ChatLeadsPage'
import { AuthProvider } from './state/AuthContext.jsx'
import { useAuth } from './state/useAuth'

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-100">Authenticating admin console...</div>
  }

  return isAdmin ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="skills" element={<AdminResourcePage resource="skills" />} />
            <Route path="projects" element={<AdminResourcePage resource="projects" />} />
            <Route path="services" element={<AdminResourcePage resource="services" />} />
            <Route path="duty-exams" element={<AdminResourcePage resource="duty_exams" />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="chat-leads" element={<ChatLeadsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
