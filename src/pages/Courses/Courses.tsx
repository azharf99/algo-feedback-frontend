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
import { courseApi } from '../../api/services'
import { Course } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  module: z.string().min(1, 'Module is required'),
  description: z.string().min(1, 'Description is required'),
  is_active: z.boolean().default(true),
})

type CourseFormData = z.infer<typeof courseSchema>

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursePagination, setCoursePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
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
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { is_active: true }
  })

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchData(coursePagination.page, coursePagination.limit)
  }, [coursePagination.page, coursePagination.limit])

  const fetchData = async (page: number, limit: number = coursePagination.limit) => {
    setLoading(true)
    try {
      const coursesRes = await courseApi.getCourses({ 
        page, 
        limit,
        search: debouncedSearch,
        sort_by: sortField,
        sort_dir: sortDir
      })
      setCourses(coursesRes.data)
      setCoursePagination({
        page: coursesRes.page,
        limit: coursesRes.limit,
        total: coursesRes.total,
        total_pages: coursesRes.total_pages
      })
    } catch (error) {
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<CourseFormData> = async (data) => {
    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, {
          ...data,
        } as Partial<Course>)
        toast.success('Course updated successfully')
      } else {
        await courseApi.createCourse({
          ...data,
        } as Omit<Course, 'id'>)
        toast.success('Course created successfully')
      }
      fetchData(coursePagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.deleteCourse(id)
        toast.success('Course deleted successfully')
        fetchData(coursePagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    reset(course)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCourse(null)
    reset({ is_active: true })
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Importing courses...')
    try {
      const result = await courseApi.importCourses(formData)
      let message = `Import completed: ${result.created} created, ${result.updated} updated`
      if (result.errors && result.errors.length > 0) {
        message += `, ${result.errors.length} errors`
      }
      toast.success(message, { id: loadingToast })
      fetchData(1)
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
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
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
            Add Course
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
                  onClick={() => toggleSort('title')}
                >
                  <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('module')}
                >
                  <div className="flex items-center gap-1">Module {renderSortIcon('module')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.module}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="truncate max-w-xs" title={course.description}>{course.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded-md hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
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
              onClick={() => setCoursePagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={coursePagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCoursePagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={coursePagination.page >= coursePagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(coursePagination.page - 1) * coursePagination.limit + (courses.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(coursePagination.page - 1) * coursePagination.limit + courses.length}</span> of <span className="font-medium">{coursePagination.total}</span> results
              </p>
              <select
                value={coursePagination.limit}
                onChange={(e) => setCoursePagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
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
                  onClick={() => setCoursePagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={coursePagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {coursePagination.page} of {Math.max(1, coursePagination.total_pages)}
                </span>
                <button
                  onClick={() => setCoursePagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={coursePagination.page >= coursePagination.total_pages}
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
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" {...register('title')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.title ? "border-red-300" : "border-gray-300")} />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Module</label>
              <input type="text" {...register('module')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.module ? "border-red-300" : "border-gray-300")} />
              {errors.module && <p className="mt-1 text-sm text-red-600">{errors.module.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea {...register('description')} rows={3} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.description ? "border-red-300" : "border-gray-300")}></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>
            <div className="flex items-center">
              <input id="c_is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="c_is_active" className="ml-2 block text-sm text-gray-900">Active Course</label>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">{editingCourse ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title="Import Courses from CSV"
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
              CSV headers: id, title, module, description, is_active
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button type="button" onClick={() => setImportDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}

export default Courses
