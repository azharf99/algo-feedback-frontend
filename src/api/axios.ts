import axios from 'axios'
import toast from 'react-hot-toast'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and global error messaging
api.interceptors.response.use(
  (response) => {
    // Show success message if the response contains one
    const successMsg = response.data?.message || response.data?.data?.message
    if (successMsg && response.config.method !== 'get') {
      toast.success(successMsg)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle Token Refresh (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if we are already on the login or refresh endpoints
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token } = response.data.data
          localStorage.setItem('accessToken', access_token)

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Global Error Handling
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
    } else {
      const status = error.response.status
      const errorMsg = error.response.data?.error || error.response.data?.message || 'Something went wrong'
      
      // Specifically avoid double toast for 401 as it's handled by refresh logic or redirect
      if (status !== 401) {
        toast.error(errorMsg)
      }
    }

    return Promise.reject(error)
  }
)

export default api
