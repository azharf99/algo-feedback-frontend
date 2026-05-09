import api from './axios'
import { Student, Group, Lesson, Feedback, Course, Session, User, PaginatedResponse, PaginationParams } from '../types/data'
import { ForgotPasswordData, ResetPasswordData } from '../types/auth'

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

// User API (Admin Only)
export const userApi = {
  getUsers: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<User>> => {
    const response = await api.get(`/users${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  createUser: async (user: Omit<User, 'id'> & { password?: string }, skipToast?: boolean): Promise<User> => {
    const response = await api.post('/users', user, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateUser: async (id: number, user: Partial<User> & { password?: string }, skipToast?: boolean): Promise<User> => {
    const response = await api.put(`/users/${id}`, user, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteUser: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/users/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteUsersBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/users/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  }
}

// Profile API (All Users)
export const profileApi = {
  updateProfile: async (profile: { name?: string; password?: string; whatsapp_api_key?: string; whatsapp_device_id?: string }, skipToast?: boolean): Promise<User> => {
    const response = await api.put('/profile', profile, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  }
}

// Auth API
export const authApi = {
  forgotPassword: async (data: ForgotPasswordData, skipToast?: boolean): Promise<void> => {
    await api.post('/auth/forgot-password', data, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  resetPassword: async (data: ResetPasswordData, skipToast?: boolean): Promise<void> => {
    await api.post('/auth/reset-password', data, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  }
}

// Course API with pagination
export const courseApi = {
  getCourses: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Course>> => {
    const response = await api.get(`/courses${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  createCourse: async (course: Omit<Course, 'id'>, skipToast?: boolean): Promise<Course> => {
    const response = await api.post('/courses', course, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateCourse: async (id: number, course: Partial<Course>, skipToast?: boolean): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, course, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteCourse: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/courses/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteCoursesBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/courses/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  importCourses: async (formData: FormData, skipToast?: boolean) => {
    const response = await api.post('/courses/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(skipToast ? { 'X-Skip-Toast': 'true' } : {})
      }
    })
    return response.data
  }
}

// Student API with pagination
export const studentApi = {
  getStudents: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Student>> => {
    const response = await api.get(`/students${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  createStudent: async (student: Omit<Student, 'id'>, skipToast?: boolean): Promise<Student> => {
    const response = await api.post('/students', student, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateStudent: async (id: number, student: Partial<Student>, skipToast?: boolean): Promise<Student> => {
    const response = await api.put(`/students/${id}`, student, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteStudent: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/students/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteStudentsBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/students/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  importStudents: async (formData: FormData, skipToast?: boolean) => {
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(skipToast ? { 'X-Skip-Toast': 'true' } : {})
      }
    })
    return response.data
  }
}

// Group API with pagination
export const groupApi = {
  getGroups: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Group>> => {
    const response = await api.get(`/groups${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  createGroup: async (group: Omit<Group, 'id'>, skipToast?: boolean): Promise<Group> => {
    const response = await api.post('/groups', group, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateGroup: async (id: number, group: Partial<Group>, skipToast?: boolean): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, group, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteGroup: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/groups/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteGroupsBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/groups/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  importGroups: async (formData: FormData, skipToast?: boolean) => {
    const response = await api.post('/groups/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(skipToast ? { 'X-Skip-Toast': 'true' } : {})
      }
    })
    return response.data
  }
}

// Lesson API with pagination
export const lessonApi = {
  getLessons: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Lesson>> => {
    const response = await api.get(`/lessons${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },

  getLessonsByCourse: async (courseId: number, skipToast?: boolean): Promise<Lesson[]> => {
    const response = await api.get(`/lessons/course/${courseId}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  createLesson: async (lesson: Omit<Lesson, 'id'>, skipToast?: boolean): Promise<Lesson> => {
    const response = await api.post('/lessons', lesson, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateLesson: async (id: number, lesson: Partial<Lesson>, skipToast?: boolean): Promise<Lesson> => {
    const response = await api.put(`/lessons/${id}`, lesson, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteLesson: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/lessons/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteLessonsBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/lessons/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  importLessons: async (formData: FormData, skipToast?: boolean) => {
    const response = await api.post('/lessons/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(skipToast ? { 'X-Skip-Toast': 'true' } : {})
      }
    })
    return response.data
  },
  
  importCompetencies: async (formData: FormData, skipToast?: boolean) => {
    const response = await api.post('/lessons/import-competencies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(skipToast ? { 'X-Skip-Toast': 'true' } : {})
      }
    })
    return response.data
  }
}

// Session API with pagination
export const sessionApi = {
  getSessions: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Session>> => {
    const response = await api.get(`/sessions${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  getSession: async (id: number, skipToast?: boolean): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  getSessionsByGroup: async (groupId: number, skipToast?: boolean): Promise<Session[]> => {
    const response = await api.get(`/sessions/group/${groupId}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  createSession: async (session: Omit<Session, 'id'>, skipToast?: boolean): Promise<Session> => {
    const response = await api.post('/sessions', session, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  updateSession: async (id: number, session: Partial<Session>, skipToast?: boolean): Promise<Session> => {
    const response = await api.put(`/sessions/${id}`, session, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteSession: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/sessions/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteSessionsBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/sessions/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  updateAttendance: async (id: number, studentIds: number[], skipToast?: boolean): Promise<void> => {
    await api.post(`/sessions/${id}/attendance`, { student_ids: studentIds }, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  markDone: async (data: { group_id: number; until_date: string }, skipToast?: boolean): Promise<void> => {
    await api.post('/sessions/mark-done', data, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  autoFillAttendance: async (data: { group_id: number; until_date: string }, skipToast?: boolean): Promise<void> => {
    await api.post('/sessions/auto-fill-attendance', data, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  markCancelled: async (data: { group_id: number; from_date: string; before_date: string }, skipToast?: boolean): Promise<void> => {
    await api.post('/sessions/mark-cancelled', data, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  getSummary: async (skipToast?: boolean): Promise<{ data: { last_week: Session[]; this_week: Session[]; next_week: Session[] } }> => {
    const response = await api.get('/sessions/summary', { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  }
}

// Feedback API with pagination
export const feedbackApi = {
  getFeedbacks: async (params?: PaginationParams, skipToast?: boolean): Promise<PaginatedResponse<Feedback>> => {
    const response = await api.get(`/feedbacks${buildQueryParams(params)}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  updateFeedback: async (id: number, feedback: Partial<Feedback>, skipToast?: boolean): Promise<Feedback> => {
    const response = await api.put(`/feedbacks/${id}`, feedback, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data.data
  },
  
  deleteFeedback: async (id: number, skipToast?: boolean): Promise<void> => {
    await api.delete(`/feedbacks/${id}`, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  deleteFeedbacksBulk: async (ids: number[], skipToast?: boolean): Promise<void> => {
    await api.delete('/feedbacks/bulk', { 
      data: { ids }, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  generateFeedbacks: async (params?: { all?: boolean; group_id?: number }, skipToast?: boolean): Promise<void> => {
    await api.post('/feedbacks/seeder', {}, { 
      params, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },
  
  generatePdf: async (params: { student_id: number; course: string; number: number; all?: boolean }, skipToast?: boolean): Promise<void> => {
    await api.post('/feedbacks/generate-pdf', params, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  },

  generateAllPdf: async (skipToast?: boolean): Promise<{ message: string; tasks: any[] }> => {
    const response = await api.post('/feedbacks/generate-all-pdf', {}, { 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },

  downloadPdf: async (id: number, skipToast?: boolean): Promise<Blob> => {
    const response = await api.get(`/feedbacks/${id}/download`, {
      responseType: 'blob',
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
    return response.data
  },
  
  sendWhatsApp: async (params?: { student_id?: number }, skipToast?: boolean): Promise<void> => {
    await api.post('/feedbacks/send-wa', {}, { 
      params, 
      headers: skipToast ? { 'X-Skip-Toast': 'true' } : {} 
    })
  }
}
