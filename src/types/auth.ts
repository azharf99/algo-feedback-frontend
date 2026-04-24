export interface User {
  id: number
  fullname: string
  email: string
  role: 'admin' | 'tutor'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  fullname: string
  email: string
  password: string
  role: 'admin' | 'tutor'
}

export interface AuthResponse {
  message: string
  data: {
    user: User
    access_token: string
    refresh_token: string
  }
}

export interface RefreshTokenResponse {
  message: string
  data: {
    access_token: string
  }
}
