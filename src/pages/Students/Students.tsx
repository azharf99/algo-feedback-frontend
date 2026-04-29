import React, { useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
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
import { useDropzone } from 'react-dropzone'
import { studentApi } from '../../api/services'
import { Student } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const studentSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  surname: z.string().min(1, 'Surname is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  parent_name: z.string().min(1, 'Parent name is required'),
  parent_contact: z.string().min(1, 'Parent contact is required'),
  is_active: z.boolean().default(true),
})

type StudentFormData = z.infer<typeof studentSchema>

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortField, setSortField] = useState('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { is_active: true }
  })

  useEffect(() => {
    fetchStudents(1) // Reset to page 1 on search or sort change
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchStudents(pagination.page, pagination.limit)
  }, [pagination.page, pagination.limit])

  const fetchStudents = async (page: number, limit: number = pagination.limit) => {
    setLoading(true)
    try {
      const response = await studentApi.getStudents({ 
        page, 
        limit,
        search: debouncedSearch,
        sort_by: sortField,
        sort_dir: sortDir
      })
      setStudents(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        total_pages: response.total_pages
      })
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<StudentFormData> = async (data) => {
    try {
      if (editingStudent) {
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        await studentApi.updateStudent(editingStudent.id, updateData)
        toast.success('Student updated successfully')
      } else {
        if (!data.password) {
          toast.error('Password is required for new students')
          return
        }
        await studentApi.createStudent(data)
        toast.success('Student created successfully')
      }
      fetchStudents(pagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentApi.deleteStudent(id)
        toast.success('Student deleted successfully')
        fetchStudents(pagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    reset({
      ...student,
      password: '' // Don't populate password
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingStudent(null)
    reset({ is_active: true })
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Importing students...')
    try {
      const result = await studentApi.importStudents(formData)
      let message = `Import completed: ${result.created} created, ${result.updated} updated`
      if (result.errors && result.errors.length > 0) {
        message += `, ${result.errors.length} errors`
      }
      toast.success(message, { id: loadingToast })
      fetchStudents(1)
      setImportDialogOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Import failed', { id: loadingToast })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  })

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
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
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
            onClick={() => setImportDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UploadCloud className="-ml-1 mr-2 h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('fullname')}
                >
                  <div className="flex items-center gap-1">Full Name {renderSortIcon('fullname')}</div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('username')}
                >
                  <div className="flex items-center gap-1">Username {renderSortIcon('username')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Info
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
                      <div className="text-sm text-gray-500">{student.surname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.parent_name}</div>
                      <div className="text-sm text-gray-500">{student.parent_contact}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        student.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded-md hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + (students.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(pagination.page - 1) * pagination.limit + students.length}</span> of <span className="font-medium">{pagination.total}</span> results
              </p>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                className="ml-2 block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page} of {Math.max(1, pagination.total_pages)}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" {...register('fullname')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.fullname ? "border-red-300" : "border-gray-300")} />
                {errors.fullname && <p className="mt-1 text-sm text-red-600">{errors.fullname.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Surname</label>
                <input type="text" {...register('surname')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.surname ? "border-red-300" : "border-gray-300")} />
                {errors.surname && <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" {...register('username')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.username ? "border-red-300" : "border-gray-300")} />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="text" {...register('phone_number')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.phone_number ? "border-red-300" : "border-gray-300")} />
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                <input type="text" {...register('parent_name')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.parent_name ? "border-red-300" : "border-gray-300")} />
                {errors.parent_name && <p className="mt-1 text-sm text-red-600">{errors.parent_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Contact</label>
                <input type="text" {...register('parent_contact')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.parent_contact ? "border-red-300" : "border-gray-300")} />
                {errors.parent_contact && <p className="mt-1 text-sm text-red-600">{errors.parent_contact.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" {...register('password')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.password ? "border-red-300" : "border-gray-300")} />
                <p className="mt-1 text-xs text-gray-500">{editingStudent ? 'Leave empty to keep current password' : 'Required for new students'}</p>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div className="flex items-center mt-6">
                <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Active Student</label>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
              {editingStudent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title="Import Students from CSV"
        maxWidth="sm"
      >
        <div className="px-6 py-4">
          <div
            {...getRootProps()}
            className={clsx(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              CSV headers: id, fullname, surname, username, password, phone_number, parent_name, parent_contact, is_active
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button type="button" onClick={() => setImportDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Students
