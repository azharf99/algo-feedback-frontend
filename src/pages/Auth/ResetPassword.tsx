import React, { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/services'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      navigate('/login')
    }
  }, [token, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) return

    setLoading(true)
    const loadingToast = toast.loading('Resetting password...')
    try {
      await authApi.resetPassword({
        token,
        new_password: data.new_password,
      })
      toast.success('Password successfully reset!', { id: loadingToast })
      setTimeout(() => navigate('/login'), 2000)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to reset password'
      toast.error(errorMessage, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Algo Feedback System
        </h1>
        <h2 className="mt-2 text-center text-lg text-gray-600 dark:text-gray-400">
          Set New Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-transparent dark:border-gray-700 transition-colors duration-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="new_password" disable-grammarly="true" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="new_password"
                  type="password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={clsx(
                    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors",
                    errors.new_password ? "border-red-300 dark:border-red-500" : "border-gray-300"
                  )}
                  {...register('new_password')}
                />
              </div>
              {errors.new_password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="new_password-error">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" disable-grammarly="true" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  disabled={loading}
                  className={clsx(
                    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors",
                    errors.confirm_password ? "border-red-300 dark:border-red-500" : "border-gray-300"
                  )}
                  {...register('confirm_password')}
                />
              </div>
              {errors.confirm_password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="confirm_password-error">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <RouterLink to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm transition-colors">
              Back to Sign In
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
