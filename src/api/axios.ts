import axios from 'axios'
import toast from 'react-hot-toast'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and language
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    const lang = localStorage.getItem('language') || 'Indonesia'
    config.headers['Accept-Language'] = lang

    // The instance default Content-Type is 'application/json'. When the body is a
    // FormData (file uploads), that default must NOT survive: axios v1's transformRequest
    // sees a JSON Content-Type + FormData data and actually JSON.stringifies the FormData
    // instead of sending it as multipart (a File has no own enumerable properties, so it
    // serializes to "{}" — the request silently turns into `{"file":{}}` and the backend
    // never sees an uploaded file). Deleting it here lets the browser set the correct
    // `multipart/form-data; boundary=...` header itself.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Response interceptor to handle token refresh and global error messaging
api.interceptors.response.use(
  (response) => {
    // Show success message if the response contains one
    const successMsg = response.data?.message || response.data?.data?.message
    const method = response.config.method?.toLowerCase()
    const isGetRequest = method === 'get'
    
    // Check for skip toast header (case-insensitive)
    const headers = response.config.headers
    const skipToast = headers && (
      (typeof headers.get === 'function' && headers.get('X-Skip-Toast') === 'true') ||
      headers['X-Skip-Toast'] === 'true' || 
      headers['x-skip-toast'] === 'true'
    )
    
    if (successMsg && !isGetRequest && !skipToast) {
      toast.success(successMsg)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const headers = originalRequest?.headers
    const skipToast = headers && (
      (typeof headers.get === 'function' && headers.get('X-Skip-Toast') === 'true') ||
      headers['X-Skip-Toast'] === 'true' || 
      headers['x-skip-toast'] === 'true'
    )

    // Handle Rate Limiting (429 Too Many Requests)
    if (error.response?.status === 429 && (!originalRequest._retryCount || originalRequest._retryCount < 3)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      const backoffDelay = Math.pow(2, originalRequest._retryCount) * 1000
      
      console.warn(`Rate limited. Retrying in ${backoffDelay}ms... (Attempt ${originalRequest._retryCount})`)
      await sleep(backoffDelay)
      return api(originalRequest)
    }

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
    if (!skipToast) {
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
    }

    return Promise.reject(error)
  }
)

export default api
