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
} from '@mui/material'
import {
  People,
  Groups,
  School,
  Assessment,
  Add,
  Upload,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Student, Group, Lesson, Feedback } from '../../types/data'

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

        // Get recent lessons (last 5)
        const recent = lessons
          .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
          .slice(0, 5)
        setRecentLessons(recent)

        // Get recent feedbacks (last 5)
        const recentFb = feedbacks
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        setRecentFeedbacks(recentFb)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
            <List>
              {recentLessons.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No lessons found" />
                </ListItem>
              ) : (
                recentLessons.map((lesson) => (
                  <ListItem key={lesson.id} divider>
                    <ListItemText
                      primary={lesson.title}
                      secondary={`${lesson.module} - ${new Date(lesson.date_start).toLocaleDateString()}`}
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
            <List>
              {recentFeedbacks.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No feedbacks found" />
                </ListItem>
              ) : (
                recentFeedbacks.map((feedback) => (
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
