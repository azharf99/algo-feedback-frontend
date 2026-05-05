export interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Tutor' | 'Siswa'
}

export interface LoginCredentials {
  email: string
  password: string
  captcha_token: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  role: 'Admin' | 'Tutor' | 'Siswa'
  captcha_token: string
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
