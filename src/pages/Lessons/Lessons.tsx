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
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Upload,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { lessonApi, groupApi } from '../../api/services'
import { Lesson, Group } from '../../types/data'

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  module: z.string().min(1, 'Module is required'),
  level: z.string().min(1, 'Level is required'),
  number: z.number().min(1, 'Number is required'),
  group_id: z.number().min(1, 'Group is required'),
  date_start: z.string().min(1, 'Date is required'),
  time_start: z.string().min(1, 'Time is required'),
  is_active: z.boolean(),
  students_attended: z.array(z.number()).optional(),
})

type LessonFormData = z.infer<typeof lessonSchema>

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [lessonPagination, setLessonPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
  })

  const selectedStudents = watch('students_attended') || []
  const selectedGroupId = watch('group_id')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [lessonsRes, groupsRes] = await Promise.all([
        lessonApi.getLessons({ page: lessonPagination.page, limit: lessonPagination.limit }),
        groupApi.getGroups(), // Groups without pagination for dropdown
      ])
      setLessons(lessonsRes.data)
      setLessonPagination({
        page: lessonsRes.page,
        limit: lessonsRes.limit,
        total: lessonsRes.total,
        total_pages: lessonsRes.total_pages
      })
      setGroups(groupsRes.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<LessonFormData> = async (data) => {
    try {
      if (editingLesson) {
        await lessonApi.updateLesson(editingLesson.id, data)
        setSnackbar({ open: true, message: 'Lesson updated successfully', severity: 'success' })
      } else {
        await lessonApi.createLesson({ ...data, students_attended: data.students_attended || [] })
        setSnackbar({ open: true, message: 'Lesson created successfully', severity: 'success' })
      }
      fetchData()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Operation failed', severity: 'error' as const })
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await lessonApi.deleteLesson(id)
        setSnackbar({ open: true, message: 'Lesson deleted successfully', severity: 'success' })
        fetchData()
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error || 'Delete failed', severity: 'error' as const })
      }
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    reset({
      ...lesson,
      students_attended: lesson.students_attended || [],
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingLesson(null)
    reset()
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await lessonApi.importLessons(formData)
      let message = `Import completed: ${result.created} created, ${result.updated} updated`
      if (result.errors.length > 0) {
        message += `, ${result.errors.length} errors`
      }
      setSnackbar({ open: true, message, severity: 'success' })
      fetchData()
      setImportDialogOpen(false)
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Import failed', severity: 'error' as const })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleStudentChange = (event: any) => {
    const value = event.target.value
    setValue('students_attended', value)
  }

  const getAvailableStudents = () => {
    if (!selectedGroupId) return []
    const selectedGroup = groups.find(g => g.id === selectedGroupId)
    return selectedGroup?.students || []
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'module', headerName: 'Module', width: 150 },
    { field: 'level', headerName: 'Level', width: 100 },
    { field: 'number', headerName: 'Number', width: 80 },
    {
      field: 'group_name',
      headerName: 'Group',
      width: 150,
      renderCell: (params) => params.row.group?.name || `Group ${params.row.group_id}`,
    },
    {
      field: 'date_start',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'time_start',
      headerName: 'Time',
      width: 100,
      renderCell: (params) => params.value.substring(0, 5),
    },
    {
      field: 'attendance_count',
      headerName: 'Attendance',
      width: 100,
      renderCell: (params) => params.row.students_attended?.length || 0,
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Typography color={params.value ? 'success.main' : 'error.main'}>
          {params.value ? 'Active' : 'Inactive'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
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
        <Typography variant="h4">Lessons</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Lesson
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={lessons}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: lessonPagination.page - 1, pageSize: lessonPagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={lessonPagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            setLessonPagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            lessonApi.getLessons({ page: newPage, limit: newLimit }).then(response => {
              setLessons(response.data)
              setLessonPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                total_pages: response.total_pages
              })
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to fetch lessons', severity: 'error' as const })
            })
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Title"
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
              <TextField
                label="Module"
                {...register('module')}
                error={!!errors.module}
                helperText={errors.module?.message}
                fullWidth
              />
              <TextField
                label="Level"
                {...register('level')}
                error={!!errors.level}
                helperText={errors.level?.message}
                fullWidth
              />
              <TextField
                label="Number"
                type="number"
                {...register('number', { valueAsNumber: true })}
                error={!!errors.number}
                helperText={errors.number?.message}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  {...register('group_id', { valueAsNumber: true })}
                  error={!!errors.group_id}
                  defaultValue=""
                  onChange={(e) => {
                    setValue('group_id', Number(e.target.value))
                    setValue('students_attended', [])
                  }}
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Date"
                type="date"
                {...register('date_start')}
                error={!!errors.date_start}
                helperText={errors.date_start?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Time"
                type="time"
                {...register('time_start')}
                error={!!errors.time_start}
                helperText={errors.time_start?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth sx={{ gridColumn: '1 / -1' }}>
                <InputLabel>Students Attended</InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={handleStudentChange}
                  disabled={!selectedGroupId}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const student = getAvailableStudents().find(s => s.id === value)
                        return (
                          <Chip key={value} label={student?.fullname || value} size="small" />
                        )
                      })}
                    </Box>
                  )}
                >
                  {getAvailableStudents().map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      <Checkbox checked={selectedStudents.indexOf(student.id) > -1} />
                      <ListItemText primary={`${student.fullname} ${student.surname}`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingLesson ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Lessons from CSV</DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <Upload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography>
              {isDragActive
                ? 'Drop the CSV file here'
                : 'Drag & drop a CSV file here, or click to select'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              CSV headers: id, title, category, module, level, number, group_id, description, date_start, time_start, meeting_link, feedback, is_active, students_attended
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
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

export default Lessons
