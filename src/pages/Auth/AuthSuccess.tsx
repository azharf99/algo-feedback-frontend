import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const userStr = params.get('user')

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))

        // Force a reload or update context state
        // Since useAuth initializeAuth only runs on mount, 
        // we might need a way to trigger it or just redirect to / which will re-mount App
        window.location.href = '/'
      } catch (error) {
        console.error('Error parsing user data:', error)
        toast.error('Failed to process login data')
        navigate('/login')
      }
    } else {
      toast.error('Missing authentication tokens')
      navigate('/login')
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Completing sign-in...</p>
      </div>
    </div>
  )
}

export default AuthSuccess
