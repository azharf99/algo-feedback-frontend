import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User as UserIcon, Lock, Key, Smartphone, Save, ShieldCheck } from 'lucide-react'
import { profileApi } from '../../api/services'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().optional(),
  whatsapp_api_key: z.string().optional(),
  whatsapp_device_id: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const Profile: React.FC = () => {
  const { state: authState, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: authState.user?.name || '',
      whatsapp_api_key: authState.user?.whatsapp_api_key || '',
      whatsapp_device_id: authState.user?.whatsapp_device_id || '',
    }
  })

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    setLoading(true)
    try {
      const filteredData = { ...data }
      if (!filteredData.password) {
        delete filteredData.password
      }
      
      const updatedUser = await profileApi.updateProfile(filteredData)
      updateUser(updatedUser)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-blue-600" />
          My Profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and WhatsApp API configuration.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-200">
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Account Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Account Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('name')}
                      className={clsx(
                        "block w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all",
                        errors.name ? "border-red-300 ring-red-100 ring-2" : "border-gray-300 dark:border-gray-600"
                      )}
                      placeholder="Your full name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authState.user?.email || ''}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400 italic">Email cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      {...register('password')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Leave empty to keep current password.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <div className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 sm:text-sm capitalize">
                    {authState.user?.role}
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Integration Section */}
            <div>
              <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                <Smartphone className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">WhatsApp Integration</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('whatsapp_api_key')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="e.g. your-api-key"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp Device ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      {...register('whatsapp_device_id')}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <strong>Tip:</strong> These credentials are required to send automated feedback messages via WhatsApp. You can find them in your WA Gateway dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  "inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200",
                  loading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="-ml-1 mr-2 h-5 w-5" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
