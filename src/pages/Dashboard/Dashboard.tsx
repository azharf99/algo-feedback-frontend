import React, { useEffect, useState } from 'react'
import {
  Users,
  UsersRound,
  GraduationCap,
  LineChart,
  Plus,
  Upload,
  Search,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Student, Group, Lesson, Feedback } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'
import clsx from 'clsx'

interface DashboardStats {
  totalStudents: number
  totalGroups: number
  totalLessons: number
  totalFeedbacks: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalGroups: 0,
    totalLessons: 0,
    totalFeedbacks: 0,
  })
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([])
  const [recentFeedbacks, setRecentFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [lessonsSearch, setLessonsSearch] = useState('')
  const [feedbacksSearch, setFeedbacksSearch] = useState('')
  const debouncedLessonsSearch = useDebounce(lessonsSearch, 300)
  const debouncedFeedbacksSearch = useDebounce(feedbacksSearch, 300)
  const [lessonsSort, setLessonsSort] = useState<'id' | 'title' | 'module' | 'level'>('id')
  const [lessonsSortDir, setLessonsSortDir] = useState<'asc' | 'desc'>('desc')
  const [feedbacksSort, setFeedbacksSort] = useState<'created_at' | 'course' | 'number'>('created_at')
  const [feedbacksSortDir, setFeedbacksSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, groupsRes, lessonsRes, feedbacksRes] = await Promise.all([
          api.get<{ message: string; data: Student[] }>('/students'),
          api.get<{ message: string; data: Group[] }>('/groups'),
          api.get<{ message: string; data: Lesson[] }>('/lessons'),
          api.get<{ message: string; data: Feedback[] }>('/feedbacks'),
        ])

        const students = studentsRes.data.data
        const groups = groupsRes.data.data
        const lessons = lessonsRes.data.data
        const feedbacks = feedbacksRes.data.data

        setStats({
          totalStudents: students.length,
          totalGroups: groups.length,
          totalLessons: lessons.length,
          totalFeedbacks: feedbacks.length,
        })

        setRecentLessons(lessons)
        setRecentFeedbacks(feedbacks)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Filter and sort lessons
  const filteredAndSortedLessons = recentLessons
    .filter(lesson => {
      const search = debouncedLessonsSearch.toLowerCase()
      return lesson.title.toLowerCase().includes(search) ||
             lesson.module.toLowerCase().includes(search) ||
             lesson.level.toLowerCase().includes(search)
    })
    .sort((a, b) => {
      let comparison = 0
      if (lessonsSort === 'id') {
        comparison = a.id - b.id
      } else if (lessonsSort === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (lessonsSort === 'module') {
        comparison = a.module.localeCompare(b.module)
      } else if (lessonsSort === 'level') {
        comparison = a.level.localeCompare(b.level)
      }
      return lessonsSortDir === 'asc' ? comparison : -comparison
    })
    .slice(0, 5)

  // Filter and sort feedbacks
  const filteredAndSortedFeedbacks = recentFeedbacks
    .filter(feedback => {
      const search = debouncedFeedbacksSearch.toLowerCase()
      return feedback.course.toLowerCase().includes(search) ||
             feedback.number.toString().includes(search)
    })
    .sort((a, b) => {
      let comparison = 0
      if (feedbacksSort === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (feedbacksSort === 'course') {
        comparison = a.course.localeCompare(b.course)
      } else if (feedbacksSort === 'number') {
        comparison = a.number - b.number
      }
      return feedbacksSortDir === 'asc' ? comparison : -comparison
    })
    .slice(0, 5)

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <Users className="w-8 h-8" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      action: () => navigate('/students'),
    },
    {
      title: 'Total Groups',
      value: stats.totalGroups,
      icon: <UsersRound className="w-8 h-8" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      action: () => navigate('/groups'),
    },
    {
      title: 'Total Lessons',
      value: stats.totalLessons,
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      action: () => navigate('/lessons'),
    },
    {
      title: 'Total Feedbacks',
      value: stats.totalFeedbacks,
      icon: <LineChart className="w-8 h-8" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      action: () => navigate('/feedbacks'),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  return (
    <div className="transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome to Algo Feedback System</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-200 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div className={clsx("p-3 rounded-lg transition-colors", card.bgColor, card.color)}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Recent Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Lessons</h2>
            <button
              onClick={() => navigate('/lessons')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Add Lesson
            </button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 transition-colors duration-200">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search lessons..."
                value={lessonsSearch}
                onChange={(e) => setLessonsSearch(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
              {lessonsSearch && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setLessonsSearch('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={lessonsSort}
              onChange={(e) => setLessonsSort(e.target.value as any)}
              className="block w-full sm:w-32 pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-colors"
            >
              <option value="id">Sort by ID</option>
              <option value="title">Sort by Title</option>
              <option value="module">Sort by Module</option>
              <option value="level">Sort by Level</option>
            </select>
            <select
              value={lessonsSortDir}
              onChange={(e) => setLessonsSortDir(e.target.value as 'asc' | 'desc')}
              className="block w-full sm:w-36 pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-colors"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedLessons.length === 0 ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">No lessons found</li>
            ) : (
              filteredAndSortedLessons.map((lesson) => (
                <li key={lesson.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.module} - {lesson.level}</p>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Feedbacks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Feedbacks</h2>
            <button
              onClick={() => navigate('/feedbacks')}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Upload className="-ml-1 mr-2 h-4 w-4" />
              Generate
            </button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 transition-colors duration-200">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search feedbacks..."
                value={feedbacksSearch}
                onChange={(e) => setFeedbacksSearch(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
              {feedbacksSearch && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setFeedbacksSearch('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <select
              value={feedbacksSort}
              onChange={(e) => setFeedbacksSort(e.target.value as any)}
              className="block w-full sm:w-32 pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-colors"
            >
              <option value="created_at">Sort by Date</option>
              <option value="course">Sort by Course</option>
              <option value="number">Sort by Number</option>
            </select>
            <select
              value={feedbacksSortDir}
              onChange={(e) => setFeedbacksSortDir(e.target.value as 'asc' | 'desc')}
              className="block w-full sm:w-36 pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-colors"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedFeedbacks.length === 0 ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">No feedbacks found</li>
            ) : (
              filteredAndSortedFeedbacks.map((feedback) => (
                <li key={feedback.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {feedback.course} - Feedback #{feedback.number}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Student ID: {feedback.student_id} - {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
