import React, { useEffect, useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
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
import { sessionApi, groupApi, lessonApi } from '../../api/services'
import { Session, Group, Lesson } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const sessionSchema = z.object({
  group_id: z.number().min(1, 'Group is required'),
  lesson_id: z.number().min(1, 'Lesson is required'),
  date_start: z.string().min(1, 'Date is required'),
  time_start: z.string().min(1, 'Time is required'),
  is_done: z.boolean().default(false),
})

type SessionFormData = z.infer<typeof sessionSchema>

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [sessionPagination, setSessionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortField, setSortField] = useState('date_start')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { is_done: false }
  })

  const selectedGroupId = watch('group_id')

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchData(sessionPagination.page, sessionPagination.limit)
  }, [sessionPagination.page, sessionPagination.limit])

  useEffect(() => {
    const fetchFilteredLessons = async () => {
      if (!selectedGroupId) {
        setFilteredLessons([])
        return
      }

      const selectedGroup = groups.find(g => g.id === selectedGroupId)
      if (!selectedGroup?.course_id) {
        setFilteredLessons([])
        return
      }

      try {
        setLoadingLessons(true)
        const lessons = await lessonApi.getLessonsByCourse(selectedGroup.course_id)
        setFilteredLessons(lessons)
      } catch (error) {
        toast.error('Failed to fetch lessons')
        setFilteredLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }

    fetchFilteredLessons()
  }, [selectedGroupId, groups])

  const fetchData = async (page: number, limit: number = sessionPagination.limit) => {
    setLoading(true)
    try {
      const [sessionsRes, groupsRes, lessonsRes] = await Promise.all([
        sessionApi.getSessions({ 
          page, 
          limit,
          search: debouncedSearch,
          sort_by: sortField,
          sort_dir: sortDir
        }),
        groupApi.getGroups(),
        lessonApi.getLessons(),
      ])
      setSessions(sessionsRes.data)
      setSessionPagination({
        page: sessionsRes.page,
        limit: sessionsRes.limit,
        total: sessionsRes.total,
        total_pages: sessionsRes.total_pages
      })
      setGroups(groupsRes.data)
      setFilteredLessons(lessonsRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<SessionFormData> = async (data) => {
    try {
      if (editingSession) {
        await sessionApi.updateSession(editingSession.id, data)
        toast.success('Session updated successfully')
      } else {
        await sessionApi.createSession(data)
        toast.success('Session created successfully')
      }
      fetchData(sessionPagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionApi.deleteSession(id)
        toast.success('Session deleted successfully')
        fetchData(sessionPagination.page)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const handleEdit = async (session: Session) => {
    setEditingSession(session)
    reset({
      ...session,
      date_start: new Date(session.date_start).toISOString().split('T')[0],
      time_start: session.time_start.substring(0, 5)
    })
    
    const selectedGroup = groups.find(g => g.id === session.group_id)
    if (selectedGroup?.course_id) {
      try {
        setLoadingLessons(true)
        const lessons = await lessonApi.getLessonsByCourse(selectedGroup.course_id)
        setFilteredLessons(lessons)
      } catch (error) {
        toast.error('Failed to fetch lessons')
        setFilteredLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }
    
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSession(null)
    reset({ is_done: false })
    setFilteredLessons([])
  }

  const handleAttendance = (session: Session) => {
    setAttendanceSession(session)
    // Use existing attendances if available, otherwise default to empty or all group students
    const attendedIds = session.attendances?.map(s => s.id) || []
    setSelectedStudents(attendedIds)
    setAttendanceDialogOpen(true)
  }

  const handleCloseAttendanceDialog = () => {
    setAttendanceDialogOpen(false)
    setAttendanceSession(null)
    setSelectedStudents([])
  }

  const onSubmitAttendance = async () => {
    if (!attendanceSession) return

    try {
      await sessionApi.updateAttendance(attendanceSession.id, selectedStudents)
      toast.success('Attendance updated successfully')
      fetchData(sessionPagination.page)
      handleCloseAttendanceDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed')
    }
  }

  const toggleStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(prev => prev.filter(id => id !== studentId))
    } else {
      setSelectedStudents(prev => [...prev, studentId])
    }
  }

  const getAvailableStudents = () => {
    if (!attendanceSession?.group_id) return []
    const selectedGroup = groups.find(g => g.id === attendanceSession.group_id)
    return selectedGroup?.students || []
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Add Session
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Group
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lesson
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => toggleSort('date_start')}
                >
                  <div className="flex items-center gap-1">Date {renderSortIcon('date_start')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => toggleSort('is_done')}
                >
                  <div className="flex items-center gap-1">Status {renderSortIcon('is_done')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{session.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{session.group?.name || `Group ${session.group_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={session.lesson?.title}>{session.lesson?.title || `Lesson ${session.lesson_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(session.date_start).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{session.time_start.substring(0, 5)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {session.is_done && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span className={clsx("text-sm", session.is_done ? "text-green-600 font-medium" : "text-gray-500")}>
                          {session.is_done ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAttendance(session)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mx-1 p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Attendance"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(session)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mx-1 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mx-1 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setSessionPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={sessionPagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setSessionPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={sessionPagination.page >= sessionPagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{(sessionPagination.page - 1) * sessionPagination.limit + (sessions.length > 0 ? 1 : 0)}</span> to <span className="font-medium text-gray-900 dark:text-white">{(sessionPagination.page - 1) * sessionPagination.limit + sessions.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{sessionPagination.total}</span> results
              </p>
              <select
                value={sessionPagination.limit}
                onChange={(e) => setSessionPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                className="ml-2 block w-full pl-3 pr-10 py-1 text-sm border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
                  onClick={() => setSessionPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={sessionPagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Page {sessionPagination.page} of {Math.max(1, sessionPagination.total_pages)}
                </span>
                <button
                  onClick={() => setSessionPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={sessionPagination.page >= sessionPagination.total_pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
        title={editingSession ? 'Edit Session' : 'Add Session'}
        maxWidth="sm"
      >

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group</label>
                  <select 
                    {...register('group_id', { valueAsNumber: true })} 
                    className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.group_id ? "border-red-300" : "border-gray-300")}
                  >
                    <option value="">Select a group</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  {errors.group_id && <p className="mt-1 text-sm text-red-600">{errors.group_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lesson</label>
                  <select 
                    {...register('lesson_id', { valueAsNumber: true })} 
                    disabled={!selectedGroupId}
                    className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.lesson_id ? "border-red-300" : "border-gray-300", !selectedGroupId && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed")}
                  >
                    <option value="">{loadingLessons ? 'Loading lessons...' : selectedGroupId ? 'Select a lesson' : 'Select a group first'}</option>
                    {!loadingLessons && filteredLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                  {errors.lesson_id && <p className="mt-1 text-sm text-red-600">{errors.lesson_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" {...register('date_start')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.date_start ? "border-red-300" : "border-gray-300")} />
                  {errors.date_start && <p className="mt-1 text-sm text-red-600">{errors.date_start.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input type="time" {...register('time_start')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.time_start ? "border-red-300" : "border-gray-300")} />
                  {errors.time_start && <p className="mt-1 text-sm text-red-600">{errors.time_start.message}</p>}
                </div>
                <div className="flex items-center mt-2">
                  <input id="is_done" type="checkbox" {...register('is_done')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800" />
                  <label htmlFor="is_done" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Mark as Done</label>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                {editingSession ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={handleCloseDialog} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        open={attendanceDialogOpen}
        onClose={handleCloseAttendanceDialog}
        title={'Update Attendance'}
        maxWidth="sm"
      >

          <div className="px-6 py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Select students who attended this session.
            </p>
            <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800">
              {getAvailableStudents().map(student => (
                <div key={student.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`att-student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
                  />
                  <label htmlFor={`att-student-${student.id}`} className="ml-2 text-sm text-gray-900 dark:text-gray-300 cursor-pointer flex-1">
                    {student.fullname} {student.surname}
                  </label>
                </div>
              ))}
              {getAvailableStudents().length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No students available in this group.</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {selectedStudents.map(id => {
                const student = getAvailableStudents().find(s => s.id === id)
                if (!student) return null
                return (
                  <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {student.fullname}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onSubmitAttendance} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Save Attendance
            </button>
            <button type="button" onClick={handleCloseAttendanceDialog} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Cancel
            </button>
          </div>
      </Modal>
    </div>
  )
}

export default Sessions
