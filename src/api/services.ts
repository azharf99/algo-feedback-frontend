import api from './axios'
import { Student, Group, Lesson, Feedback, PaginatedResponse, PaginationParams } from '../types/data'

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
  
  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
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
  
  generateFeedbacks: async (params?: { all?: boolean }): Promise<void> => {
    await api.post('/feedbacks/seeder', {}, { params })
  },
  
  generatePdf: async (params: { student_id: number; course: string; number: number; all?: boolean }): Promise<void> => {
    await api.post('/feedbacks/generate-pdf', params)
  },
  
  sendWhatsApp: async (params?: { feedback_id?: number }): Promise<void> => {
    await api.post('/feedbacks/send-wa', {}, { params })
  }
}
