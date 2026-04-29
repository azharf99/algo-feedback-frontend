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

function App() {
  const { state } = useAuth()
  const { isAuthenticated, loading } = state

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/feedbacks" element={<Feedbacks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
