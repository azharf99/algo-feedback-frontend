import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthSuccess: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Tokens are now in the hash fragment for security
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
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
        window.location.href = '/dashboard'
      } catch (error) {
        console.error('Error parsing user data:', error)
        toast.error(t('login_process_failed'))
        navigate('/login')
      }
    } else {
      toast.error(t('missing_tokens'))
      navigate('/login')
    }
  }, [location, navigate, t])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{t('completing_signin')}</p>
      </div>
    </div>
  )
}

export default AuthSuccess
