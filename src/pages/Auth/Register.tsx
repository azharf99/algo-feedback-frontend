import React, { useEffect, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { RegisterCredentials } from '../../types/auth'
import clsx from 'clsx'
import ReCAPTCHA from 'react-google-recaptcha'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Tutor', 'Siswa']),
  captcha_token: z.string().min(1, 'Please complete the CAPTCHA'),
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { state: authState, register: registerUser, clearError } = useAuth()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'Tutor' }
  })

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [authState.isAuthenticated, navigate])

  const onCaptchaChange = (token: string | null) => {
    setValue('captcha_token', token || '')
    trigger('captcha_token')
  }

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    const loadingToast = toast.loading('Creating account...')
    try {
      await registerUser(data as RegisterCredentials)
      toast.success('Account created successfully!', { id: loadingToast })
    } catch {
      // Global interceptor handles the error toast
      toast.dismiss(loadingToast)
      recaptchaRef.current?.reset()
      setValue('captcha_token', '')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Algo Feedback System
        </h1>
        <h2 className="mt-2 text-center text-lg text-gray-600">
          Sign Up
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {authState.error && (
            <div className="rounded-md bg-red-50 p-4 mb-6 relative">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {authState.error}
                  </h3>
                </div>
                <button
                  onClick={clearError}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  disabled={authState.loading}
                  className={clsx(
                    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.name ? "border-red-300" : "border-gray-300"
                  )}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={authState.loading}
                  className={clsx(
                    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.email ? "border-red-300" : "border-gray-300"
                  )}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={authState.loading}
                  className={clsx(
                    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.password ? "border-red-300" : "border-gray-300"
                  )}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LcoVtosAAAAAOdJ6poBZy1Zst3mJOqN2-KIWvHB"
                onChange={onCaptchaChange}
              />
              {errors.captcha_token && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.captcha_token.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={authState.loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authState.loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <RouterLink to="/login" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
              Already have an account? Sign In
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
