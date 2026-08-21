import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Session, Group, Lesson, StatusFilterValue } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'
import SearchableSelect from '../../components/ui/SearchableSelect'
import StatusFilter from '../../components/ui/StatusFilter'

const sessionSchema = z.object({
  group_id: z.number().min(1, 'Group is required'),
  lesson_id: z.number().min(1, 'Lesson is required'),
  date_start: z.string().min(1, 'Date is required'),
  time_start: z.string().min(1, 'Time is required'),
  after_session_feedback: z.string().optional(),
  is_done: z.boolean().default(false),
  shift_subsequent: z.boolean().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

const markDoneSchema = z.object({
  group_id: z.number().min(1, 'Group is required'),
  until_date: z.string().min(1, 'Date is required'),
})

type MarkDoneFormData = z.infer<typeof markDoneSchema>

const markCancelledSchema = z.object({
  group_id: z.number().min(1, 'Group is required'),
  from_date: z.string().min(1, 'From Date is required'),
  before_date: z.string().min(1, 'Before Date is required'),
})

type MarkCancelledFormData = z.infer<typeof markCancelledSchema>

const Sessions: React.FC = () => {
  const { t } = useTranslation()
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
  const [markDoneDialogOpen, setMarkDoneDialogOpen] = useState(false)
  const [autoFillAttendanceDialogOpen, setAutoFillAttendanceDialogOpen] = useState(false)
  const [markCancelledDialogOpen, setMarkCancelledDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active')
  const [sortField, setSortField] = useState('date_start')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [currentTab, setCurrentTab] = useState<'ALL' | 'LAST_WEEK' | 'THIS_WEEK' | 'NEXT_WEEK'>('THIS_WEEK')
  const [summaryData, setSummaryData] = useState<{ last_week: Session[]; this_week: Session[]; next_week: Session[] } | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const fetchSummary = async () => {
    try {
      const res = await sessionApi.getSummary()
      setSummaryData(res.data)
    } catch (error) {
      // Global interceptor handles this
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { is_done: false, shift_subsequent: false }
  })

  const {
    register: registerMarkDone,
    handleSubmit: handleSubmitMarkDone,
    reset: resetMarkDone,
    formState: { errors: errorsMarkDone },
    control: controlMarkDone,
  } = useForm<MarkDoneFormData>({
    resolver: zodResolver(markDoneSchema),
  })

  const {
    register: registerAutoFill,
    handleSubmit: handleSubmitAutoFill,
    reset: resetAutoFill,
    formState: { errors: errorsAutoFill },
    control: controlAutoFill,
  } = useForm<MarkDoneFormData>({
    resolver: zodResolver(markDoneSchema),
  })

  const {
    register: registerMarkCancelled,
    handleSubmit: handleSubmitMarkCancelled,
    reset: resetMarkCancelled,
    formState: { errors: errorsMarkCancelled },
    control: controlMarkCancelled,
  } = useForm<MarkCancelledFormData>({
    resolver: zodResolver(markCancelledSchema),
  })

  const selectedGroupId = watch('group_id')

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, sortField, sortDir, statusFilter])

  useEffect(() => {
    fetchData(sessionPagination.page, sessionPagination.limit)
  }, [sessionPagination.page, sessionPagination.limit])

  useEffect(() => {
    if (currentTab !== 'ALL') {
      if (!summaryData) {
        fetchSummary()
      }
    } else {
      fetchData(1)
    }
  }, [currentTab])

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
        // Global interceptor handles this
        setFilteredLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }

    fetchFilteredLessons()
  }, [selectedGroupId, groups])

  const fetchData = async (page: number, limit: number = sessionPagination.limit) => {
    setLoading(true)
    setSelectedIds([])
    try {
      const [sessionsRes, groupsRes, lessonsRes] = await Promise.all([
        sessionApi.getSessions({
          page,
          limit,
          search: debouncedSearch,
          sort_by: sortField,
          sort_dir: sortDir,
          status: statusFilter
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
      // Global interceptor handles this
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<SessionFormData> = async (data) => {
    try {
      if (editingSession) {
        await sessionApi.updateSession(editingSession.id, data, true)
        toast.success(t('session_updated_success'))
      } else {
        await sessionApi.createSession(data, true)
        toast.success(t('session_created_success'))
      }
      fetchData(sessionPagination.page)
      fetchSummary()
      handleCloseDialog()
    } catch (error: any) {
      // Global interceptor handles this
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm(t('delete_session_confirm'))) {
      try {
        await sessionApi.deleteSession(id, true)
        toast.success(t('session_deleted_success'))
        fetchData(sessionPagination.page)
        fetchSummary()
      } catch (error: any) {
        // Global interceptor handles this
      }
    }
  }

  const handleCancelSession = async (session: Session) => {
    if (window.confirm(t('cancel_session_confirm'))) {
      try {
        await sessionApi.updateSession(session.id, { status: 'Cancelled' }, true)
        toast.success(t('session_cancelled_success'))
        fetchData(sessionPagination.page)
        fetchSummary()
      } catch (error: any) {
        // Global interceptor handles this
      }
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(t('delete_sessions_bulk_confirm', { count: selectedIds.length }))) {
      try {
        await sessionApi.deleteSessionsBulk(selectedIds, true)
        toast.success(t('sessions_deleted_success'))
        setSelectedIds([])
        fetchData(sessionPagination.page)
        fetchSummary()
      } catch (error: any) {
        // Global interceptor handles this
      }
    }
  }

  const handleEdit = async (session: Session) => {
    setEditingSession(session)
    reset({
      ...session,
      date_start: new Date(session.date_start).toISOString().split('T')[0],
      time_start: session.time_start.substring(0, 5),
      after_session_feedback: session.after_session_feedback || '',
      shift_subsequent: false
    })
    
    const selectedGroup = groups.find(g => g.id === session.group_id)
    if (selectedGroup?.course_id) {
      try {
        setLoadingLessons(true)
        const lessons = await lessonApi.getLessonsByCourse(selectedGroup.course_id)
        setFilteredLessons(lessons)
      } catch (error) {
        // Global interceptor handles this
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
    const attendedIds = session.students_attended?.map(s => s.id) || []
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
      await sessionApi.updateAttendance(attendanceSession.id, selectedStudents, true)
      toast.success(t('attendance_updated_success'))
      fetchData(sessionPagination.page)
      fetchSummary()
      handleCloseAttendanceDialog()
    } catch (error: any) {
      // Global interceptor handles this
    }
  }

  const onMarkDoneSubmit: SubmitHandler<MarkDoneFormData> = async (data) => {
    try {
      await sessionApi.markDone(data, true)
      toast.success(t('sessions_marked_done_success'))
      fetchData(sessionPagination.page)
      fetchSummary()
      setMarkDoneDialogOpen(false)
      resetMarkDone()
    } catch (error: any) {
      // Global interceptor handles this
    }
  }

  const onAutoFillAttendanceSubmit: SubmitHandler<MarkDoneFormData> = async (data) => {
    try {
      await sessionApi.autoFillAttendance(data, true)
      toast.success(t('attendance_filled_success'))
      fetchData(sessionPagination.page)
      fetchSummary()
      setAutoFillAttendanceDialogOpen(false)
      resetAutoFill()
    } catch (error: any) {
      // Global interceptor handles this
    }
  }

  const onMarkCancelledSubmit: SubmitHandler<MarkCancelledFormData> = async (data) => {
    try {
      await sessionApi.markCancelled(data, true)
      toast.success(t('sessions_marked_cancelled_success'))
      fetchData(sessionPagination.page)
      fetchSummary()
      setMarkCancelledDialogOpen(false)
      resetMarkCancelled()
    } catch (error: any) {
      // Global interceptor handles this
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

  const getDisplaySessions = () => {
    let source: Session[] = []
    if (currentTab === 'ALL') {
      source = sessions
    } else if (summaryData) {
      source = currentTab === 'LAST_WEEK' ? summaryData.last_week :
               currentTab === 'THIS_WEEK' ? summaryData.this_week :
               summaryData.next_week
    }
    
    let filtered = source
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = source.filter(s =>
        s.group?.name?.toLowerCase().includes(searchLower) ||
        s.lesson?.title?.toLowerCase().includes(searchLower) ||
        s.id.toString().includes(searchLower)
      )
    }

    // Week tabs (LAST_WEEK/THIS_WEEK/NEXT_WEEK) pull from the unfiltered summary endpoint,
    // so the status filter is applied client-side here. The ALL tab is already filtered
    // server-side by getSessions(), so re-applying it is a harmless no-op.
    if (statusFilter !== 'all') {
      const wantStatus = statusFilter === 'active' ? 'Active' : 'Cancelled'
      filtered = filtered.filter(s => (s.status ?? 'Active') === wantStatus)
    }

    if (currentTab !== 'ALL') {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortField as keyof Session]
        const valB = b[sortField as keyof Session]
        
        if (valA === valB) return 0
        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1
        
        const compare = valA < valB ? -1 : 1
        return sortDir === 'asc' ? compare : -compare
      })
    }
    
    return filtered
  }

  return (
    <div className="transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav_sessions')}</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={t('search_sessions')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
            >
              <Trash2 className="-ml-1 mr-2 h-4 w-4" />
              {t('delete_selected')} ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setMarkDoneDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CheckCircle className="-ml-1 mr-2 h-4 w-4 text-green-500" />
            {t('auto_mark_done')}
          </button>
          <button
            onClick={() => setAutoFillAttendanceDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <CheckCircle className="-ml-1 mr-2 h-4 w-4 text-blue-500" />
            {t('auto_fill_attendance')}
          </button>
          <button
            onClick={() => setMarkCancelledDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <X className="-ml-1 mr-2 h-4 w-4 text-red-500" />
            {t('mark_cancelled')}
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            {t('add_session')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['ALL', 'LAST_WEEK', 'THIS_WEEK', 'NEXT_WEEK'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab as any)}
              className={clsx(
                currentTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              )}
            >
              {tab === 'ALL' ? t('all') :
               tab === 'LAST_WEEK' ? t('session_last_week') :
               tab === 'THIS_WEEK' ? t('session_this_week') :
               t('session_next_week')}
            </button>
          ))}
        </nav>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    checked={selectedIds.length === getDisplaySessions().length && getDisplaySessions().length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(getDisplaySessions().map(s => s.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No.</th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">ID {renderSortIcon('id')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('group')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lesson')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleSort('date_start')}
                >
                  <div className="flex items-center gap-1">{t('date')} {renderSortIcon('date_start')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('time')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleSort('is_done')}
                >
                  <div className="flex items-center gap-1">{t('done')} {renderSortIcon('is_done')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('attendees')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : getDisplaySessions().length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-gray-500">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                getDisplaySessions().map((session, index) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                        checked={selectedIds.includes(session.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, session.id])
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== session.id))
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(sessionPagination.page - 1) * sessionPagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{session.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{session.group?.name || `${t('group')} ${session.group_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={session.lesson?.title}>{session.lesson?.title || `${t('lesson')} ${session.lesson_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(session.date_start).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{session.time_start.substring(0, 5)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        session.status === 'Cancelled' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      )}>
                        {session.status === 'Cancelled' ? t('cancelled') : t('active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {session.is_done && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <span className={clsx("text-sm", session.is_done ? "text-green-600 font-medium" : "text-gray-500")}>
                          {session.is_done ? t('done') : t('pending')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {session.students_attended?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleAttendance(session)}
                        className={clsx(
                          "mx-1 p-1 rounded-md transition-colors",
                          session.status === 'Cancelled' 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                        )}
                        title={session.status === 'Cancelled' ? t('cannot_mark_cancelled_done') : t('attendees')}
                        disabled={session.status === 'Cancelled'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelSession(session)}
                        className={clsx(
                          "mx-1 p-1 rounded-md transition-colors",
                          session.status === 'Cancelled' 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        )}
                        title={session.status === 'Cancelled' ? t('cancelled') : t('mark_cancelled')}
                        disabled={session.status === 'Cancelled'}
                      >
                        <X className="w-4 h-4" />
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
          {currentTab === 'ALL' ? (
            <>
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
                    Showing <span className="font-medium text-gray-900 dark:text-white">{(sessionPagination.page - 1) * sessionPagination.limit + (getDisplaySessions().length > 0 ? 1 : 0)}</span> to <span className="font-medium text-gray-900 dark:text-white">{(sessionPagination.page - 1) * sessionPagination.limit + getDisplaySessions().length}</span> of <span className="font-medium text-gray-900 dark:text-white">{sessionPagination.total}</span> results
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
            </>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{getDisplaySessions().length}</span> results
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingSession ? t('edit_session') : t('add_session')}
        maxWidth="sm"
      >

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <SearchableSelect
                    name="group_id"
                    control={control}
                    label={t('group')}
                    placeholder={t('search_groups_placeholder')}
                    options={groups.map(g => ({ value: g.id, label: g.name }))}
                    error={errors.group_id?.message}
                  />
                </div>
                <div className="min-w-0">
                  <SearchableSelect
                    name="lesson_id"
                    control={control}
                    label={t('lesson')}
                    placeholder={loadingLessons ? "Loading lessons..." : selectedGroupId ? t('search_lessons_placeholder') : "Select a group first"}
                    options={filteredLessons.map(l => ({ value: l.id, label: l.title }))}
                    error={errors.lesson_id?.message}
                    isDisabled={!selectedGroupId || loadingLessons}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
                  <input type="date" {...register('date_start')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.date_start ? "border-red-300" : "border-gray-300")} />
                  {errors.date_start && <p className="mt-1 text-sm text-red-600">{errors.date_start.message}</p>}
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('time')}</label>
                  <input type="time" {...register('time_start')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errors.time_start ? "border-red-300" : "border-gray-300")} />
                  {errors.time_start && <p className="mt-1 text-sm text-red-600">{errors.time_start.message}</p>}
                </div>
                <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('after_session_feedback')}</label>
                <textarea 
                  {...register('after_session_feedback')} 
                  rows={3} 
                  placeholder="Notes about the session, student performance, etc." 
                  className={clsx(
                    "mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors",
                    errors.after_session_feedback ? "border-red-300" : "border-gray-300"
                  )} 
                />
                {errors.after_session_feedback && <p className="mt-1 text-sm text-red-600">{errors.after_session_feedback.message}</p>}
              </div>
                <div className="flex items-center mt-2">
                  <input 
                    id="is_done" 
                    type="checkbox" 
                    {...register('is_done')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded bg-white dark:bg-gray-800 disabled:opacity-50" 
                    disabled={editingSession?.status === 'Cancelled'}
                  />
                  <label htmlFor="is_done" className={clsx("ml-2 block text-sm", editingSession?.status === 'Cancelled' ? "text-gray-400" : "text-gray-900 dark:text-gray-300")}>
                    {t('mark_as_done')} {editingSession?.status === 'Cancelled' && t('cannot_mark_cancelled_done')}
                  </label>
                </div>
                {editingSession && (
                  <div className="flex items-center mt-2">
                    <input id="shift_subsequent" type="checkbox" {...register('shift_subsequent')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800" />
                    <label htmlFor="shift_subsequent" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">{t('shift_subsequent_label')}</label>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-all">
                {editingSession ? t('update') : t('create')}
              </button>
              <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                {t('cancel')}
              </button>
            </div>
          </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        open={attendanceDialogOpen}
        onClose={handleCloseAttendanceDialog}
        title={t('update_attendance')}
        maxWidth="sm"
      >

          <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('select_attended_students')}
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
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">{t('no_students_in_group')}</p>
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
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <button type="button" onClick={onSubmitAttendance} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-all">
              {t('save_attendance')}
            </button>
            <button type="button" onClick={handleCloseAttendanceDialog} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {t('cancel')}
            </button>
          </div>
      </Modal>

      {/* Mark Done Modal */}
      <Modal
        open={markDoneDialogOpen}
        onClose={() => {
          setMarkDoneDialogOpen(false)
          resetMarkDone()
        }}
        title={t('auto_mark_done')}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmitMarkDone(onMarkDoneSubmit)}>
          <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="grid grid-cols-1 gap-4">
              <div className="min-w-0">
                <SearchableSelect
                  name="group_id"
                  control={controlMarkDone}
                  label={t('group')}
                  placeholder={t('search_groups_placeholder')}
                  options={groups.map(g => ({ value: g.id, label: g.name }))}
                  error={errorsMarkDone.group_id?.message}
                />
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('until_date')}</label>
                <input type="date" {...registerMarkDone('until_date')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errorsMarkDone.until_date ? "border-red-300" : "border-gray-300")} />
                {errorsMarkDone.until_date && <p className="mt-1 text-sm text-red-600">{errorsMarkDone.until_date.message}</p>}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-all">
              {t('done')}
            </button>
            <button type="button" onClick={() => { setMarkDoneDialogOpen(false); resetMarkDone(); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Auto Fill Attendance Modal */}
      <Modal
        open={autoFillAttendanceDialogOpen}
        onClose={() => {
          setAutoFillAttendanceDialogOpen(false)
          resetAutoFill()
        }}
        title={t('auto_fill_attendance')}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmitAutoFill(onAutoFillAttendanceSubmit)}>
          <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="grid grid-cols-1 gap-4">
              <div className="min-w-0">
                <SearchableSelect
                  name="group_id"
                  control={controlAutoFill}
                  label={t('group')}
                  placeholder={t('search_groups_placeholder')}
                  options={groups.map(g => ({ value: g.id, label: g.name }))}
                  error={errorsAutoFill.group_id?.message}
                />
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('until_date')}</label>
                <input type="date" {...registerAutoFill('until_date')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errorsAutoFill.until_date ? "border-red-300" : "border-gray-300")} />
                {errorsAutoFill.until_date && <p className="mt-1 text-sm text-red-600">{errorsAutoFill.until_date.message}</p>}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-all">
              {t('fill_attendance_btn')}
            </button>
            <button type="button" onClick={() => { setAutoFillAttendanceDialogOpen(false); resetAutoFill(); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Cancelled Modal */}
      <Modal
        open={markCancelledDialogOpen}
        onClose={() => {
          setMarkCancelledDialogOpen(false)
          resetMarkCancelled()
        }}
        title={t('mark_cancelled')}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmitMarkCancelled(onMarkCancelledSubmit)}>
          <div className="px-6 py-4 bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="grid grid-cols-1 gap-4">
              <div className="min-w-0">
                <SearchableSelect
                  name="group_id"
                  control={controlMarkCancelled}
                  label={t('group')}
                  placeholder={t('search_groups_placeholder')}
                  options={groups.map(g => ({ value: g.id, label: g.name }))}
                  error={errorsMarkCancelled.group_id?.message}
                />
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('from_date')}</label>
                <input type="date" {...registerMarkCancelled('from_date')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errorsMarkCancelled.from_date ? "border-red-300" : "border-gray-300")} />
                {errorsMarkCancelled.from_date && <p className="mt-1 text-sm text-red-600">{errorsMarkCancelled.from_date.message}</p>}
              </div>
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('before_date')}</label>
                <input type="date" {...registerMarkCancelled('before_date')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-colors", errorsMarkCancelled.before_date ? "border-red-300" : "border-gray-300")} />
                {errorsMarkCancelled.before_date && <p className="mt-1 text-sm text-red-600">{errorsMarkCancelled.before_date.message}</p>}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-all">
              {t('mark_cancelled')}
            </button>
            <button type="button" onClick={() => { setMarkCancelledDialogOpen(false); resetMarkCancelled(); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              {t('cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Sessions
