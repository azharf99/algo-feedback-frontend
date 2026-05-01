import React, { useEffect, useState } from 'react'
import {
  Edit2,
  BarChart2,
  FileText,
  MessageCircle,
  RefreshCw,
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
import { feedbackApi, groupApi } from '../../api/services'
import { Feedback, Group } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import Modal from '../../components/ui/Modal'

const feedbackSchema = z.object({
  attendance_score: z.string().min(1, 'Attendance score is required'),
  activity_score: z.string().min(1, 'Activity score is required'),
  task_score: z.string().min(1, 'Task score is required'),
  tutor_comments: z.string().optional(),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

const generateFeedbackSchema = z.object({
  all: z.boolean().default(false),
  group_id: z.number().optional(),
})

type GenerateFeedbackFormData = z.infer<typeof generateFeedbackSchema>

const Feedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [feedbackPagination, setFeedbackPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null)
  const [pdfGenerating, setPdfGenerating] = useState<number | null>(null)
  const [waScheduling, setWaScheduling] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortField, setSortField] = useState('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  })

  const {
    register: registerGenerate,
    handleSubmit: handleGenerateSubmit,
    reset: resetGenerate,
    watch: watchGenerate,
    formState: { errors: generateErrors },
  } = useForm<GenerateFeedbackFormData>({
    resolver: zodResolver(generateFeedbackSchema),
    defaultValues: { all: false }
  })

  const isAllStudents = watchGenerate('all')

  useEffect(() => {
    fetchData(1)
  }, [debouncedSearch, sortField, sortDir])

  useEffect(() => {
    fetchData(feedbackPagination.page, feedbackPagination.limit)
  }, [feedbackPagination.page, feedbackPagination.limit])

  const fetchData = async (page: number, limit: number = feedbackPagination.limit) => {
    setLoading(true)
    try {
      const [feedbacksRes, groupsRes] = await Promise.all([
        feedbackApi.getFeedbacks({ 
          page, 
          limit,
          search: debouncedSearch,
          sort_by: sortField,
          sort_dir: sortDir
        }),
        groupApi.getGroups()
      ])
      setFeedbacks(feedbacksRes.data)
      setGroups(groupsRes.data)
      setFeedbackPagination({
        page: feedbacksRes.page,
        limit: feedbacksRes.limit,
        total: feedbacksRes.total,
        total_pages: feedbacksRes.total_pages
      })
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<FeedbackFormData> = async (data) => {
    if (!editingFeedback) return

    try {
      await feedbackApi.updateFeedback(editingFeedback.id, data)
      toast.success('Feedback updated successfully')
      fetchData(feedbackPagination.page)
      handleCloseDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed')
    }
  }

  const onGenerateSubmit: SubmitHandler<GenerateFeedbackFormData> = async (data) => {
    const loadingToast = toast.loading('Starting feedback generation...')
    try {
      await feedbackApi.generateFeedbacks({ 
        all: data.all,
        group_id: data.group_id 
      })
      toast.success('Feedback generation started', { id: loadingToast })
      fetchData(1)
      handleCloseGenerateDialog()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Generation failed', { id: loadingToast })
    }
  }

  const handleGeneratePdf = async (feedbackId: number) => {
    try {
      setPdfGenerating(feedbackId)
      const feedback = feedbacks.find(f => f.id === feedbackId)
      if (!feedback) return

      await feedbackApi.generatePdf({
        student_id: feedback.student_id,
        course: feedback.course,
        number: feedback.number,
        all: false,
      })

      toast.success('PDF generation started (background process)')
      fetchData(feedbackPagination.page)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'PDF generation failed')
    } finally {
      setPdfGenerating(null)
    }
  }

  const handleSendWhatsApp = async (feedbackId?: number) => {
    try {
      setWaScheduling(feedbackId || 0)
      await feedbackApi.sendWhatsApp({ feedback_id: feedbackId })
      toast.success('WhatsApp scheduling started')
      fetchData(feedbackPagination.page)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'WhatsApp scheduling failed')
    } finally {
      setWaScheduling(null)
    }
  }

  const handleEdit = (feedback: Feedback) => {
    setEditingFeedback(feedback)
    reset({
      attendance_score: feedback.attendance_score,
      activity_score: feedback.activity_score,
      task_score: feedback.task_score,
      tutor_comments: feedback.tutor_comments,
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingFeedback(null)
    reset()
  }

  const handleCloseGenerateDialog = () => {
    setGenerateDialogOpen(false)
    resetGenerate({ all: false })
  }

  const getScoreLabel = (score: string, type: 'attendance' | 'activity' | 'task') => {
    const labels = {
      attendance: ['None', 'Rarely', 'Sometimes', 'Often', 'Always'],
      activity: ['Inactive', 'Slightly Active', 'Active'],
      task: ['None', 'Some', 'All'],
    }
    const parsed = parseInt(score)
    if (isNaN(parsed)) return score
    // @ts-ignore
    return labels[type][parsed] || score
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
        <h1 className="text-2xl font-bold text-gray-900">Feedbacks</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[250px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search feedbacks..."
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
            onClick={() => handleSendWhatsApp()}
            disabled={waScheduling === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={clsx("-ml-1 mr-2 h-4 w-4", waScheduling === 0 && "animate-spin")} />
            Schedule All WhatsApp
          </button>
          <button
            onClick={() => setGenerateDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <BarChart2 className="-ml-1 mr-2 h-4 w-4" />
            Generate Feedbacks
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Feedbacks</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{feedbacks.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">PDFs Generated</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{feedbacks.filter(f => f.pdf_path).length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">WhatsApp Scheduled</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{feedbacks.filter(f => f.wa_scheduled).length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending PDFs</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{feedbacks.filter(f => !f.pdf_path).length}</dd>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden relative">
        {pdfGenerating && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 z-10 overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        )}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('number')}
                >
                  <div className="flex items-center gap-1">Feedback # {renderSortIcon('number')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scores
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('wa_scheduled')}
                >
                  <div className="flex items-center gap-1">WhatsApp {renderSortIcon('wa_scheduled')}</div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No feedbacks found.
                  </td>
                </tr>
              ) : (
                feedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedback.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feedback.student?.fullname || `Student ${feedback.student_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedback.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feedback.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        <div>Att: {getScoreLabel(feedback.attendance_score, 'attendance')}</div>
                        <div>Act: {getScoreLabel(feedback.activity_score, 'activity')}</div>
                        <div>Tsk: {getScoreLabel(feedback.task_score, 'task')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {feedback.pdf_path ? (
                        <span className="text-blue-600 bg-blue-50 p-1 rounded inline-flex" title="PDF Generated">
                          <FileText className="w-5 h-5" />
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        feedback.wa_scheduled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {feedback.wa_scheduled ? 'Scheduled' : 'Not Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(feedback)}
                        className="text-blue-600 hover:text-blue-900 mx-1 p-1 rounded-md hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGeneratePdf(feedback.id)}
                        disabled={pdfGenerating === feedback.id}
                        className="text-indigo-600 hover:text-indigo-900 mx-1 p-1 rounded-md hover:bg-indigo-50 disabled:opacity-50"
                        title="Generate PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendWhatsApp(feedback.id)}
                        disabled={waScheduling === feedback.id || !feedback.pdf_path}
                        className="text-green-600 hover:text-green-900 mx-1 p-1 rounded-md hover:bg-green-50 disabled:opacity-50"
                        title="Send WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
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
              onClick={() => setFeedbackPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={feedbackPagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFeedbackPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
              disabled={feedbackPagination.page >= feedbackPagination.total_pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(feedbackPagination.page - 1) * feedbackPagination.limit + (feedbacks.length > 0 ? 1 : 0)}</span> to <span className="font-medium">{(feedbackPagination.page - 1) * feedbackPagination.limit + feedbacks.length}</span> of <span className="font-medium">{feedbackPagination.total}</span> results
              </p>
              <select
                value={feedbackPagination.limit}
                onChange={(e) => setFeedbackPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
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
                  onClick={() => setFeedbackPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={feedbackPagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {feedbackPagination.page} of {Math.max(1, feedbackPagination.total_pages)}
                </span>
                <button
                  onClick={() => setFeedbackPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                  disabled={feedbackPagination.page >= feedbackPagination.total_pages}
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

      {/* Edit Dialog */}
      <Modal
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Edit Feedback"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Attendance Score</label>
              <select {...register('attendance_score')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.attendance_score ? "border-red-300" : "border-gray-300")}>
                <option value="0">None (0)</option>
                <option value="1">Rarely (1)</option>
                <option value="2">Sometimes (2)</option>
                <option value="3">Often (3)</option>
                <option value="4">Always (4)</option>
              </select>
              {errors.attendance_score && <p className="mt-1 text-sm text-red-600">{errors.attendance_score.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Activity Score</label>
              <select {...register('activity_score')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.activity_score ? "border-red-300" : "border-gray-300")}>
                <option value="0">Inactive (0)</option>
                <option value="1">Slightly Active (1)</option>
                <option value="2">Active (2)</option>
              </select>
              {errors.activity_score && <p className="mt-1 text-sm text-red-600">{errors.activity_score.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Score</label>
              <select {...register('task_score')} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.task_score ? "border-red-300" : "border-gray-300")}>
                <option value="0">None (0)</option>
                <option value="1">Some (1)</option>
                <option value="2">All (2)</option>
              </select>
              {errors.task_score && <p className="mt-1 text-sm text-red-600">{errors.task_score.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tutor Comments</label>
              <textarea {...register('tutor_comments')} rows={4} className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", errors.tutor_comments ? "border-red-300" : "border-gray-300")}></textarea>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={handleCloseDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Update</button>
          </div>
        </form>
      </Modal>

      {/* Generate Feedbacks Modal */}
      <Modal
        open={generateDialogOpen}
        onClose={handleCloseGenerateDialog}
        title="Generate Feedbacks"
        maxWidth="sm"
      >
        <form onSubmit={handleGenerateSubmit(onGenerateSubmit)}>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500 mb-4">
              This will generate feedback records for every 4 lessons completed by students.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Generate For</label>
              <select
                {...registerGenerate('all', { setValueAs: v => v === 'true' || v === true })}
                className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", generateErrors.all ? "border-red-300" : "border-gray-300")}
              >
                <option value="false">Specific Group</option>
                <option value="true">All Students</option>
              </select>
            </div>
            {!isAllStudents && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Group</label>
                <select
                  {...registerGenerate('group_id', { valueAsNumber: true })}
                  className={clsx("mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", generateErrors.group_id ? "border-red-300" : "border-gray-300")}
                >
                  <option value="">Select a group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {generateErrors.group_id && <p className="mt-1 text-sm text-red-600">{generateErrors.group_id.message}</p>}
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={handleCloseGenerateDialog} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Generate</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Feedbacks
