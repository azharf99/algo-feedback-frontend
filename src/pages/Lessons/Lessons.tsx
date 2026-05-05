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
import { lessonApi, courseApi } from '../../api/services'
import { Lesson, Course } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const lessonSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  module: z.string().min(1, 'Module is required'),
  level: z.string().min(1, 'Level is required'),
  number: z.number().min(1, 'Number is required'),
  description: z.string().min(1, 'Description is required'),
  competency: z.string().optional(),
  is_active: z.boolean().default(true),
})

type LessonFormData = z.infer<typeof lessonSchema>

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lessonPagination, setLessonPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
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
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { is_active: true }
  })

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchData(lessonPagination.page, lessonPagination.limit)
  }, [lessonPagination.page, lessonPagination.limit])

  const fetchData = async (page: number, limit: number = lessonPagination.limit) => {
    setLoading(true)
    try {
      const [lessonsRes, coursesRes] = await Promise.all([
        lessonApi.getLessons({ 
          page, 
          limit,
          search: debouncedSearch,
          sort_by: sortField,
          sort_dir: sortDir
        }),
        courseApi.getCourses(),
      ])
      setLessons(lessonsRes.data)
      setLessonPagination({
        page: lessonsRes.page,
        limit: lessonsRes.limit,
        total: lessonsRes.total,
        total_pages: lessonsRes.total_pages
      })
      setCourses(coursesRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<LessonFormData> = async (data) => {
    try {
      if (editingLesson) {
        await lessonApi.updateLesson(editingLesson.id, data)
        toast.success('Lesson updated successfully')
      } else {
        await lessonApi.createLesson(data)
        toast.success('Lesson created successfully')
      }
      fetchData(lessonPagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonApi.deleteLesson(id)
        toast.success('Lesson deleted successfully')
        fetchData(lessonPagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    reset(lesson)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingLesson(null)
    reset({ is_active: true })
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Importing lessons...')
    try {
      const result = await lessonApi.importLessons(formData)
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
        <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search lessons..."
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
            Add Lesson
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('module')}
                >
                  <div className="flex items-center gap-1">Module {renderSortIcon('module')}</div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('level')}
                >
                  <div className="flex items-center gap-1">Level {renderSortIcon('level')}</div>
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
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No lessons found.
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                      <div className="text-sm text-gray-500">Number {lesson.number} - {lesson.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.course?.title || `Course ${lesson.course_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.module}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        lesson.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {lesson.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded-md hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
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
              onClick={() => setLessonPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={lessonPagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setLessonPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={lessonPagination.page >= lessonPagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(lessonPagination.page - 1) * lessonPagination.limit + (lessons.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(lessonPagination.page - 1) * lessonPagination.limit + lessons.length}</span> of <span className="font-medium">{lessonPagination.total}</span> results
              </p>
              <select
                value={lessonPagination.limit}
                onChange={(e) => setLessonPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
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
                  onClick={() => setLessonPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={lessonPagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {lessonPagination.page} of {Math.max(1, lessonPagination.total_pages)}
                </span>
                <button
                  onClick={() => setLessonPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={lessonPagination.page >= lessonPagination.total_pages}
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
        title={editingLesson ? 'Edit Lesson' : 'Add Lesson'}
        maxWidth="md"
      >

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
                </h3>
                <button type="button" onClick={handleCloseDialog} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course</label>
                  <select 
                    {...register('course_id', { valueAsNumber: true })} 
                    className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.course_id ? "border-red-300" : "border-gray-300")}
                  >
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>}
                </div>
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
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <input type="text" {...register('level')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.level ? "border-red-300" : "border-gray-300")} />
                  {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input type="text" {...register('category')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.category ? "border-red-300" : "border-gray-300")} />
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lesson Number</label>
                  <input type="number" {...register('number', { valueAsNumber: true })} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.number ? "border-red-300" : "border-gray-300")} />
                  {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Competency</label>
                  <textarea {...register('competency')} rows={2} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.competency ? "border-red-300" : "border-gray-300")}></textarea>
                  {errors.competency && <p className="mt-1 text-sm text-red-600">{errors.competency.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea {...register('description')} rows={3} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.description ? "border-red-300" : "border-gray-300")}></textarea>
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>
                <div className="sm:col-span-2 flex items-center mt-2">
                  <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Active Lesson</label>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                {editingLesson ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCloseDialog} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title={'Import Lessons from CSV'}
        maxWidth="sm"
      >

          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Import Lessons from CSV
              </h3>
              <button type="button" onClick={() => setImportDialogOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
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
                CSV headers: id, title, category, module, level, number, course_id, description, competency, is_active
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setImportDialogOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
      </Modal>
    </div>
  )
}

export default Lessons
