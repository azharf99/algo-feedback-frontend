import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard/Dashboard'
import Students from './pages/Students/Students'
import Groups from './pages/Groups/Groups'
import Courses from './pages/Courses/Courses'
import Lessons from './pages/Lessons/Lessons'
import Sessions from './pages/Sessions/Sessions'
import Feedbacks from './pages/Feedbacks/Feedbacks'
import Users from './pages/Users/Users'
import AuthSuccess from './pages/Auth/AuthSuccess'
import Landing from './pages/Landing/Landing'
import { Toaster } from 'react-hot-toast'

function App() {
  const { state } = useAuth()
  const { isAuthenticated, loading } = state

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/sessions" element={<Sessions />} />
                  <Route path="/feedbacks" element={<Feedbacks />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  )
}

export default App
