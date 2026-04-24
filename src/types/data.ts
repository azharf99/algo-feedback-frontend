export interface Student {
  id: number
  fullname: string
  surname: string
  username: string
  phone_number: string
  parent_name: string
  parent_contact: string
  is_active: boolean
}

export interface Group {
  id: number
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
}

export interface Lesson {
  id: number
  title: string
  module: string
  level: string
  number: number
  group_id: number
  date_start: string
  time_start: string
  is_active: boolean
  students_attended: number[]
  group?: Group
}

export interface Feedback {
  id: number
  student_id: number
  course: string
  number: number
  attendance_score: string
  activity_score: string
  task_score: string
  tutor_comments: string
  pdf_path?: string
  wa_scheduled?: boolean
  created_at: string
  updated_at: string
  student?: Student
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
}
