import React, { useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userApi } from '../../api/services'
import { User } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  role: z.enum(['Admin', 'Tutor', 'Siswa']),
})

type UserFormData = z.infer<typeof userSchema>

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortField, setSortField] = useState('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'Tutor' }
  })

  useEffect(() => {
    fetchUsers(1)
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchUsers(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const fetchUsers = async (page: number, limit: number = pagination.limit) => {
    setLoading(true)
    try {
      const response = await userApi.getUsers({ 
        page, 
        limit,
        search: debouncedSearch,
        sort_by: sortField,
        sort_dir: sortDir
      })
      setUsers(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        total_pages: response.total_pages
      })
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      if (editingUser) {
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        await userApi.updateUser(editingUser.id, updateData)
        toast.success('User updated successfully')
      } else {
        if (!data.password) {
          toast.error('Password is required for new users')
          return
        }
        await userApi.createUser(data as any)
        toast.success('User created successfully')
      }
      fetchUsers(pagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(id)
        toast.success('User deleted successfully')
        fetchUsers(pagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingUser(null)
    reset({ role: 'Tutor' })
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    return sortDir === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {search && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('email')}>
                  <div className="flex items-center gap-1">Email {renderSortIcon('email')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={clsx(
                        "px-2 py-1 text-xs font-semibold rounded-full",
                        user.role === 'Admin' ? "bg-purple-100 text-purple-800" : user.role === 'Tutor' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded-md hover:bg-blue-50" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))} disabled={pagination.page >= pagination.total_pages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + (users.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(pagination.page - 1) * pagination.limit + users.length}</span> of <span className="font-medium">{pagination.total}</span> results</p>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">Page {pagination.page} of {Math.max(1, pagination.total_pages)}</span>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))} disabled={pagination.page >= pagination.total_pages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      <Modal open={dialogOpen} onClose={handleCloseDialog} title={editingUser ? 'Edit User' : 'Add User'} maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" {...register('name')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.name ? "border-red-300" : "border-gray-300")} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" {...register('email')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.email ? "border-red-300" : "border-gray-300")} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select {...register('role')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.role ? "border-red-300" : "border-gray-300")}>
                <option value="Admin">Admin</option>
                <option value="Tutor">Tutor</option>
                <option value="Siswa">Siswa</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" {...register('password')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.password ? "border-red-300" : "border-gray-300")} />
              <p className="mt-1 text-xs text-gray-500">{editingUser ? 'Leave empty to keep current password' : 'Required for new users'}</p>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">{editingUser ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users
