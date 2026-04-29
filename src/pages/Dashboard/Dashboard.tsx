import React, { useEffect, useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  People,
  Groups,
  School,
  Assessment,
  Add,
  Upload,
  Search,
  Clear,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Student, Group, Lesson, Feedback } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'

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
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: () => navigate('/students'),
    },
    {
      title: 'Total Groups',
      value: stats.totalGroups,
      icon: <Groups sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      action: () => navigate('/groups'),
    },
    {
      title: 'Total Lessons',
      value: stats.totalLessons,
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      action: () => navigate('/lessons'),
    },
    {
      title: 'Total Feedbacks',
      value: stats.totalFeedbacks,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      action: () => navigate('/feedbacks'),
    },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome to Algo Feedback System
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={card.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Lessons</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => navigate('/lessons')}
              >
                Add Lesson
              </Button>
            </Box>
            <Box display="flex" gap={1} mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                placeholder="Search lessons..."
                value={lessonsSearch}
                onChange={(e) => setLessonsSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: lessonsSearch && (
                    <Clear 
                      sx={{ cursor: 'pointer', color: 'text.secondary' }} 
                      onClick={() => setLessonsSearch('')} 
                    />
                  )
                }}
                size="small"
                sx={{ flex: { xs: 1, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
              />
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={lessonsSort}
                  label="Sort By"
                  onChange={(e) => setLessonsSort(e.target.value as any)}
                >
                  <MenuItem value="id">ID</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="module">Module</MenuItem>
                  <MenuItem value="level">Level</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={lessonsSortDir}
                  label="Order"
                  onChange={(e) => setLessonsSortDir(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <List>
              {filteredAndSortedLessons.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No lessons found" />
                </ListItem>
              ) : (
                filteredAndSortedLessons.map((lesson) => (
                  <ListItem key={lesson.id} divider>
                    <ListItemText
                      primary={lesson.title}
                      secondary={`${lesson.module} - ${lesson.level}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Feedbacks</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Upload />}
                onClick={() => navigate('/feedbacks')}
              >
                Generate Feedback
              </Button>
            </Box>
            <Box display="flex" gap={1} mb={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                placeholder="Search feedbacks..."
                value={feedbacksSearch}
                onChange={(e) => setFeedbacksSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: feedbacksSearch && (
                    <Clear 
                      sx={{ cursor: 'pointer', color: 'text.secondary' }} 
                      onClick={() => setFeedbacksSearch('')} 
                    />
                  )
                }}
                size="small"
                sx={{ flex: { xs: 1, sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}
              />
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={feedbacksSort}
                  label="Sort By"
                  onChange={(e) => setFeedbacksSort(e.target.value as any)}
                >
                  <MenuItem value="created_at">Date</MenuItem>
                  <MenuItem value="course">Course</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                <InputLabel>Order</InputLabel>
                <Select
                  value={feedbacksSortDir}
                  label="Order"
                  onChange={(e) => setFeedbacksSortDir(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <List>
              {filteredAndSortedFeedbacks.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No feedbacks found" />
                </ListItem>
              ) : (
                filteredAndSortedFeedbacks.map((feedback) => (
                  <ListItem key={feedback.id} divider>
                    <ListItemText
                      primary={`${feedback.course} - Feedback #${feedback.number}`}
                      secondary={`Student ID: ${feedback.student_id} - ${new Date(feedback.created_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
