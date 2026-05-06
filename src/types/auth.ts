export interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Tutor' | 'Siswa'
  whatsapp_api_key?: string
  whatsapp_device_id?: string
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

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  new_password: string
}
