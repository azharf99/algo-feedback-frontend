export interface Student {
  id: number
  fullname: string
  surname: string
  username: string
  phone_number: string
  parent_name: string
  parent_contact: string
  is_active: boolean
  password?: string
}

export interface Course {
  id: number
  title: string
  module: string
  description: string
  is_active: boolean
}

export interface Group {
  id: number
  course_id: number
  name: string
  type: 'Group' | 'Private'
  description: string
  group_phone: string
  meeting_link: string
  recordings_link: string
  first_lesson_date: string
  first_lesson_time: string
  is_active: boolean
  students?: Student[]
  student_ids?: number[]
  course?: Course
}

export interface Session {
  id: number
  group_id: number
  lesson_id: number
  date_start: string
  time_start: string
  is_done: boolean
  group?: Group
  lesson?: Lesson
  students_attended?: Student[]
}

export interface Lesson {
  id: number
  course_id: number
  title: string
  category: string
  module: string
  level: string
  number: number
  description: string
  competency?: string
  is_active: boolean
  course?: Course
}

export interface Feedback {
  id: number
  student_id: number
  course: string
  number: number
  attendance_score: string
  activity_score: string
  task_score: string
  tutor_feedback: string
  lesson_date?: string
  lesson_time?: string
  project_link?: string
  url_pdf?: string
  is_sent?: boolean
  schedule_id?: string
  created_at: string
  updated_at: string
  student?: Student
}

export interface User {
  id: number
  name: string
  email: string
  role: 'Admin' | 'Tutor' | 'Siswa'
}

export interface ImportResult {
  message: string
  created: number
  updated: number
  errors: Array<{
    row: number
    error: string
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ApiError {
  error: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_dir?: string
}
