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

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App
