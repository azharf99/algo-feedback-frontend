import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material'
import {
  Edit,
  Assessment,
  PictureAsPdf,
  WhatsApp,
  Refresh,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { feedbackApi } from '../../api/services'
import { Feedback } from '../../types/data'

const feedbackSchema = z.object({
  attendance_score: z.string().min(1, 'Attendance score is required'),
  activity_score: z.string().min(1, 'Activity score is required'),
  task_score: z.string().min(1, 'Task score is required'),
  tutor_comments: z.string().optional(),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

const generateFeedbackSchema = z.object({
  student_id: z.number().min(1, 'Student is required'),
  course: z.string().min(1, 'Course is required'),
  number: z.number().min(1, 'Number is required'),
  all: z.boolean().optional(),
})

type GenerateFeedbackFormData = z.infer<typeof generateFeedbackSchema>

const Feedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [pdfGenerating, setPdfGenerating] = useState<number | null>(null)
  const [waScheduling, setWaScheduling] = useState<number | null>(null)

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
    formState: { errors: generateErrors },
  } = useForm<GenerateFeedbackFormData>({
    resolver: zodResolver(generateFeedbackSchema),
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const feedbacksRes = await feedbackApi.getFeedbacks({ page: feedbackPagination.page, limit: feedbackPagination.limit })
      setFeedbacks(feedbacksRes.data)
      setFeedbackPagination({
        page: feedbacksRes.page,
        limit: feedbacksRes.limit,
        total: feedbacksRes.total,
        total_pages: feedbacksRes.total_pages
      })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<FeedbackFormData> = async (data) => {
    if (!editingFeedback) return

    try {
      await feedbackApi.updateFeedback(editingFeedback.id, data)
      setSnackbar({ open: true, message: 'Feedback updated successfully', severity: 'success' })
      fetchData()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Update failed', severity: 'error' as const })
    }
  }

  const onGenerateSubmit: SubmitHandler<GenerateFeedbackFormData> = async (data) => {
    try {
      await feedbackApi.generateFeedbacks({ all: data.all })
      setSnackbar({ open: true, message: 'Feedback generation started', severity: 'success' })
      fetchData()
      handleCloseGenerateDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Generation failed', severity: 'error' as const })
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

      setSnackbar({ open: true, message: 'PDF generation started (background process)', severity: 'success' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'PDF generation failed', severity: 'error' as const })
    } finally {
      setPdfGenerating(null)
    }
  }

  const handleSendWhatsApp = async (feedbackId?: number) => {
    try {
      setWaScheduling(feedbackId || 0)
      await feedbackApi.sendWhatsApp({ feedback_id: feedbackId })
      setSnackbar({ open: true, message: 'WhatsApp scheduling started', severity: 'success' })
      fetchData()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'WhatsApp scheduling failed', severity: 'error' as const })
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
    resetGenerate()
  }

  const getScoreLabel = (score: string, type: 'attendance' | 'activity' | 'task') => {
    const labels = {
      attendance: ['None', 'Rarely', 'Sometimes', 'Often', 'Always'],
      activity: ['Inactive', 'Slightly Active', 'Active'],
      task: ['None', 'Some', 'All'],
    }
    return labels[type][parseInt(score)] || score
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'student_name',
      headerName: 'Student',
      width: 200,
      renderCell: (params) => params.row.student?.fullname || `Student ${params.row.student_id}`,
    },
    { field: 'course', headerName: 'Course', width: 150 },
    { field: 'number', headerName: 'Feedback #', width: 100 },
    {
      field: 'attendance_score',
      headerName: 'Attendance',
      width: 120,
      renderCell: (params) => getScoreLabel(params.value, 'attendance'),
    },
    {
      field: 'activity_score',
      headerName: 'Activity',
      width: 120,
      renderCell: (params) => getScoreLabel(params.value, 'activity'),
    },
    {
      field: 'task_score',
      headerName: 'Task',
      width: 100,
      renderCell: (params) => getScoreLabel(params.value, 'task'),
    },
    {
      field: 'pdf_path',
      headerName: 'PDF',
      width: 80,
      renderCell: (params) => (
        params.value ? (
          <IconButton size="small" color="primary">
            <PictureAsPdf />
          </IconButton>
        ) : (
          <Typography color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'wa_scheduled',
      headerName: 'WhatsApp',
      width: 100,
      renderCell: (params) => (
        <Typography color={params.value ? 'success.main' : 'text.secondary'}>
          {params.value ? 'Scheduled' : 'Not Scheduled'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<PictureAsPdf />}
          label="Generate PDF"
          onClick={() => handleGeneratePdf(params.row.id)}
          disabled={pdfGenerating === params.row.id}
        />,
        <GridActionsCellItem
          icon={<WhatsApp />}
          label="Send WhatsApp"
          onClick={() => handleSendWhatsApp(params.row.id)}
          disabled={waScheduling === params.row.id || !params.row.pdf_path}
        />,
      ],
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Feedbacks</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => handleSendWhatsApp()}
            disabled={waScheduling === 0}
            sx={{ mr: 2 }}
          >
            Schedule All WhatsApp
          </Button>
          <Button
            variant="contained"
            startIcon={<Assessment />}
            onClick={() => setGenerateDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Generate Feedbacks
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Feedbacks
              </Typography>
              <Typography variant="h4">{feedbacks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                PDFs Generated
              </Typography>
              <Typography variant="h4">
                {feedbacks.filter(f => f.pdf_path).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                WhatsApp Scheduled
              </Typography>
              <Typography variant="h4">
                {feedbacks.filter(f => f.wa_scheduled).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending PDFs
              </Typography>
              <Typography variant="h4">
                {feedbacks.filter(f => !f.pdf_path).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ height: 600, width: '100%' }}>
        {pdfGenerating && <LinearProgress />}
        <DataGrid
          rows={feedbacks}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: feedbackPagination.page - 1, pageSize: feedbackPagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={feedbackPagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            setFeedbackPagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            feedbackApi.getFeedbacks({ page: newPage, limit: newLimit }).then(response => {
              setFeedbacks(response.data)
              setFeedbackPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                total_pages: response.total_pages
              })
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to fetch feedbacks', severity: 'error' as const })
            })
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Edit Feedback Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Feedback</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Attendance Score</InputLabel>
                <Select
                  {...register('attendance_score')}
                  error={!!errors.attendance_score}
                  defaultValue=""
                >
                  <MenuItem value="0">None (0)</MenuItem>
                  <MenuItem value="1">Rarely (1)</MenuItem>
                  <MenuItem value="2">Sometimes (2)</MenuItem>
                  <MenuItem value="3">Often (3)</MenuItem>
                  <MenuItem value="4">Always (4)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Activity Score</InputLabel>
                <Select
                  {...register('activity_score')}
                  error={!!errors.activity_score}
                  defaultValue=""
                >
                  <MenuItem value="0">Inactive (0)</MenuItem>
                  <MenuItem value="1">Slightly Active (1)</MenuItem>
                  <MenuItem value="2">Active (2)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Task Score</InputLabel>
                <Select
                  {...register('task_score')}
                  error={!!errors.task_score}
                  defaultValue=""
                >
                  <MenuItem value="0">None (0)</MenuItem>
                  <MenuItem value="1">Some (1)</MenuItem>
                  <MenuItem value="2">All (2)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Tutor Comments"
                {...register('tutor_comments')}
                error={!!errors.tutor_comments}
                helperText={errors.tutor_comments?.message}
                fullWidth
                multiline
                rows={4}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Generate Feedback Dialog */}
      <Dialog open={generateDialogOpen} onClose={handleCloseGenerateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Feedbacks</DialogTitle>
        <form onSubmit={handleGenerateSubmit(onGenerateSubmit)}>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This will generate feedback records for every 4 lessons completed by students.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Generate For</InputLabel>
              <Select
                {...registerGenerate('all')}
                error={!!generateErrors.all}
                defaultValue={false}
              >
                <MenuItem value="false">Specific Student</MenuItem>
                <MenuItem value="true">All Students</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGenerateDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Generate</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Feedbacks
