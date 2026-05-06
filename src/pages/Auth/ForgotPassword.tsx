import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink } from 'react-router-dom'
import { authApi } from '../../api/services'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setLoading(true)
    const loadingToast = toast.loading('Sending reset link...')
    try {
      await authApi.forgotPassword(data)
      toast.success('Reset link sent to your email!', { id: loadingToast })
      setIsSubmitted(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send reset link'
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
          Reset Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-transparent dark:border-gray-700 transition-colors duration-200">
          {!isSubmitted ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={loading}
                    className={clsx(
                      "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors",
                      errors.email ? "border-red-300 dark:border-red-500" : "border-gray-300"
                    )}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Email Sent</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please check your email for a link to reset your password.
              </p>
            </div>
          )}

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

export default ForgotPassword
