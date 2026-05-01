import api from './axios'
import { Student, Group, Lesson, Feedback, Course, Session, PaginatedResponse, PaginationParams } from '../types/data'

// Build query string from pagination parameters
const buildQueryParams = (params?: PaginationParams): string => {
  if (!params) return ''
  
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString())
  }
  if (params.search !== undefined) {
    queryParams.append('search', params.search)
  }
  if (params.sort_by !== undefined) {
    queryParams.append('sort_by', params.sort_by)
  }
  if (params.sort_dir !== undefined) {
    queryParams.append('sort_dir', params.sort_dir)
  }
  
  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
}

// Course API with pagination
export const courseApi = {
  getCourses: async (params?: PaginationParams): Promise<PaginatedResponse<Course>> => {
    const response = await api.get(`/courses${buildQueryParams(params)}`)
    return response.data
  },
  
  createCourse: async (course: Omit<Course, 'id'>): Promise<Course> => {
    const response = await api.post('/courses', course)
    return response.data.data
  },
  
  updateCourse: async (id: number, course: Partial<Course>): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, course)
    return response.data.data
  },
  
  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`)
  },
  
  importCourses: async (formData: FormData) => {
    const response = await api.post('/courses/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Student API with pagination
export const studentApi = {
  getStudents: async (params?: PaginationParams): Promise<PaginatedResponse<Student>> => {
    const response = await api.get(`/students${buildQueryParams(params)}`)
    return response.data
  },
  
  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const response = await api.post('/students', student)
    return response.data.data
  },
  
  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student)
    return response.data.data
  },
  
  deleteStudent: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`)
  },
  
  importStudents: async (formData: FormData) => {
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Group API with pagination
export const groupApi = {
  getGroups: async (params?: PaginationParams): Promise<PaginatedResponse<Group>> => {
    const response = await api.get(`/groups${buildQueryParams(params)}`)
    return response.data
  },
  
  createGroup: async (group: Omit<Group, 'id'>): Promise<Group> => {
    const response = await api.post('/groups', group)
    return response.data.data
  },
  
  updateGroup: async (id: number, group: Partial<Group>): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, group)
    return response.data.data
  },
  
  deleteGroup: async (id: number): Promise<void> => {
    await api.delete(`/groups/${id}`)
  },
  
  importGroups: async (formData: FormData) => {
    const response = await api.post('/groups/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Lesson API with pagination
export const lessonApi = {
  getLessons: async (params?: PaginationParams): Promise<PaginatedResponse<Lesson>> => {
    const response = await api.get(`/lessons${buildQueryParams(params)}`)
    return response.data
  },

  getLessonsByCourse: async (courseId: number): Promise<Lesson[]> => {
    const response = await api.get(`/lessons/course/${courseId}`)
    return response.data.data
  },
  
  createLesson: async (lesson: Omit<Lesson, 'id'>): Promise<Lesson> => {
    const response = await api.post('/lessons', lesson)
    return response.data.data
  },
  
  updateLesson: async (id: number, lesson: Partial<Lesson>): Promise<Lesson> => {
    const response = await api.put(`/lessons/${id}`, lesson)
    return response.data.data
  },
  
  deleteLesson: async (id: number): Promise<void> => {
    await api.delete(`/lessons/${id}`)
  },
  
  importLessons: async (formData: FormData) => {
    const response = await api.post('/lessons/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Session API with pagination
export const sessionApi = {
  getSessions: async (params?: PaginationParams): Promise<PaginatedResponse<Session>> => {
    const response = await api.get(`/sessions${buildQueryParams(params)}`)
    return response.data
  },
  
  getSession: async (id: number): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`)
    return response.data.data
  },
  
  getSessionsByGroup: async (groupId: number): Promise<Session[]> => {
    const response = await api.get(`/sessions/group/${groupId}`)
    return response.data.data
  },
  
  createSession: async (session: Omit<Session, 'id'>): Promise<Session> => {
    const response = await api.post('/sessions', session)
    return response.data.data
  },
  
  updateSession: async (id: number, session: Partial<Session>): Promise<Session> => {
    const response = await api.put(`/sessions/${id}`, session)
    return response.data.data
  },
  
  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}`)
  },
  
  updateAttendance: async (id: number, studentIds: number[]): Promise<void> => {
    await api.post(`/sessions/${id}/attendance`, { student_ids: studentIds }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

// Feedback API with pagination
export const feedbackApi = {
  getFeedbacks: async (params?: PaginationParams): Promise<PaginatedResponse<Feedback>> => {
    const response = await api.get(`/feedbacks${buildQueryParams(params)}`)
    return response.data
  },
  
  updateFeedback: async (id: number, feedback: Partial<Feedback>): Promise<Feedback> => {
    const response = await api.put(`/feedbacks/${id}`, feedback)
    return response.data.data
  },
  
  deleteFeedback: async (id: number): Promise<void> => {
    await api.delete(`/feedbacks/${id}`)
  },
  
  generateFeedbacks: async (params?: { all?: boolean; group_id?: number }): Promise<void> => {
    await api.post('/feedbacks/seeder', {}, { params })
  },
  
  generatePdf: async (params: { student_id: number; course: string; number: number; all?: boolean }): Promise<void> => {
    await api.post('/feedbacks/generate-pdf', params)
  },
  
  sendWhatsApp: async (params?: { feedback_id?: number }): Promise<void> => {
    await api.post('/feedbacks/send-wa', {}, { params })
  }
}
