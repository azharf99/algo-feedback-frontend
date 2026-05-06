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
import { groupApi, studentApi, courseApi } from '../../api/services'
import { Group, Student, Course } from '../../types/data'
import { sanitizePhoneNumber } from '../../utils/phone'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const groupSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(['Group', 'Private']),
  description: z.string().min(1, 'Description is required'),
  group_phone: z.string().min(1, 'Group phone is required'),
  meeting_link: z.string().url().optional().or(z.literal('')),
  recordings_link: z.string().url().optional().or(z.literal('')),
  first_lesson_date: z.string().min(1, 'First lesson date is required'),
  first_lesson_time: z.string().min(1, 'First lesson time is required'),
  is_active: z.boolean().default(true),
  student_ids: z.array(z.number()).optional(),
})

type GroupFormData = z.infer<typeof groupSchema>

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [studentsList, setStudentsList] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [groupPagination, setGroupPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
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
    watch,
    setValue,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: { is_active: true }
  })

  const selectedStudents = watch('student_ids') || []

  useEffect(() => {
    fetchData(1) // Reset to page 1 on search or sort change
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchData(groupPagination.page, groupPagination.limit)
  }, [groupPagination.page, groupPagination.limit])

  const fetchData = async (page: number, limit: number = groupPagination.limit) => {
    setLoading(true)
    try {
      const [groupsRes, studentsRes, coursesRes] = await Promise.all([
        groupApi.getGroups({
          page,
          limit,
          search: debouncedSearch,
          sort_by: sortField,
          sort_dir: sortDir
        }),
        studentApi.getStudents(),
        courseApi.getCourses(),
      ])
      setGroups(groupsRes.data)
      setGroupPagination({
        page: groupsRes.page,
        limit: groupsRes.limit,
        total: groupsRes.total,
        total_pages: groupsRes.total_pages
      })
      setStudentsList(studentsRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<GroupFormData> = async (data) => {
    // Sanitize group phone before sending to backend
    const sanitizedData = {
      ...data,
      group_phone: sanitizePhoneNumber(data.group_phone)
    }

    try {
      if (editingGroup) {
        await groupApi.updateGroup(editingGroup.id, {
          ...sanitizedData,
          meeting_link: sanitizedData.meeting_link || '',
          recordings_link: sanitizedData.recordings_link || '',
        } as Partial<Group>)
        toast.success('Group updated successfully')
      } else {
        await groupApi.createGroup({
          ...sanitizedData,
          meeting_link: sanitizedData.meeting_link || '',
          recordings_link: sanitizedData.recordings_link || '',
        } as Omit<Group, 'id'>)
        toast.success('Group created successfully')
      }
      fetchData(groupPagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupApi.deleteGroup(id)
        toast.success('Group deleted successfully')
        fetchData(groupPagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)

    const formattedDate = group.first_lesson_date
      ? new Date(group.first_lesson_date).toISOString().split('T')[0]
      : ''

    let formattedTime = group.first_lesson_time?.substring(0, 5) || ''

    reset({
      ...group,
      first_lesson_date: formattedDate,
      first_lesson_time: formattedTime,
      student_ids: group.students?.map(s => s.id) || group.student_ids || [],
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingGroup(null)
    reset({ is_active: true, student_ids: [] })
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const loadingToast = toast.loading('Importing groups...')
    try {
      const result = await groupApi.importGroups(formData)
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

  const toggleStudent = (studentId: number) => {
    const current = watch('student_ids') || []
    if (current.includes(studentId)) {
      setValue('student_ids', current.filter(id => id !== studentId))
    } else {
      setValue('student_ids', [...current, studentId])
    }
  }

  return (
    <div className="transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
            {search && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setImportDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <UploadCloud className="-ml-1 mr-2 h-4 w-4" />
            Import CSV
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Group
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => toggleSort('type')}
                >
                  <div className="flex items-center gap-1">Type {renderSortIcon('type')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Group Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    No groups found.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{group.course?.title || `Course ${group.course_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={group.description}>{group.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.group_phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.students?.length || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        group.is_active 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mx-2 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 transition-colors duration-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setGroupPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={groupPagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setGroupPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={groupPagination.page >= groupPagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(groupPagination.page - 1) * groupPagination.limit + (groups.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(groupPagination.page - 1) * groupPagination.limit + groups.length}</span> of <span className="font-medium">{groupPagination.total}</span> results
              </p>
              <select
                value={groupPagination.limit}
                onChange={(e) => setGroupPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                className="ml-2 block w-full pl-3 pr-10 py-1 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md transition-colors"
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
                  onClick={() => setGroupPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={groupPagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {groupPagination.page} of {Math.max(1, groupPagination.total_pages)}
                </span>
                <button
                  onClick={() => setGroupPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={groupPagination.page >= groupPagination.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
        title={editingGroup ? 'Edit Group' : 'Add Group'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                <select
                  {...register('course_id', { valueAsNumber: true })}
                  className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors", errors.course_id ? "border-red-300" : "border-gray-300")}
                >
                  <option value="">Select a course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</label>
                <input type="text" {...register('name')} placeholder="e.g. Group A" className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.name ? "border-red-300" : "border-gray-300")} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select
                  {...register('type')}
                  className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors", errors.type ? "border-red-300" : "border-gray-300")}
                >
                  <option value="Group">Group</option>
                  <option value="Private">Private</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group Phone</label>
                <input type="text" {...register('group_phone')} placeholder="+62..." className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.group_phone ? "border-red-300" : "border-gray-300")} />
                {errors.group_phone && <p className="mt-1 text-sm text-red-600">{errors.group_phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea {...register('description')} rows={2} placeholder="Brief description of the group" className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.description ? "border-red-300" : "border-gray-300")}></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Link</label>
                <input type="text" {...register('meeting_link')} placeholder="https://..." className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.meeting_link ? "border-red-300" : "border-gray-300")} />
                {errors.meeting_link && <p className="mt-1 text-sm text-red-600">{errors.meeting_link.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Recordings Link</label>
                <input type="text" {...register('recordings_link')} placeholder="https://..." className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.recordings_link ? "border-red-300" : "border-gray-300")} />
                {errors.recordings_link && <p className="mt-1 text-sm text-red-600">{errors.recordings_link.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Lesson Date</label>
                <input type="date" {...register('first_lesson_date')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors", errors.first_lesson_date ? "border-red-300" : "border-gray-300")} />
                {errors.first_lesson_date && <p className="mt-1 text-sm text-red-600">{errors.first_lesson_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Lesson Time</label>
                <input type="time" {...register('first_lesson_time')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors", errors.first_lesson_time ? "border-red-300" : "border-gray-300")} />
                {errors.first_lesson_time && <p className="mt-1 text-sm text-red-600">{errors.first_lesson_time.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Students</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 transition-colors">
                  {studentsList.map(student => (
                    <div key={student.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                      />
                      <label htmlFor={`student-${student.id}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                        {student.fullname} {student.surname}
                      </label>
                    </div>
                  ))}
                  {studentsList.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No students available.</p>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedStudents.map(id => {
                    const student = studentsList.find(s => s.id === id)
                    if (!student) return null
                    return (
                      <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {student.fullname}
                        <button type="button" onClick={() => toggleStudent(id)} className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input id="is_active" type="checkbox" {...register('is_active')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded" />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Active Group</label>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-all">
              {editingGroup ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title={'Import Groups from CSV'}
        maxWidth="sm"
      >
        <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
          <div
            {...getRootProps()}
            className={clsx(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
              isDragActive 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            )}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CSV headers: id, course_id, name, type, description, group_phone, meeting_link, recordings_link, first_lesson_date, first_lesson_time, is_active
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <button type="button" onClick={() => setImportDialogOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Groups
