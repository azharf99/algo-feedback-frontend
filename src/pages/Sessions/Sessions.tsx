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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Search,
  Clear,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem, GridSortModel } from '@mui/x-data-grid'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { sessionApi, groupApi, lessonApi } from '../../api/services'
import { Session, Group, Lesson } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'

const sessionSchema = z.object({
  group_id: z.number().min(1, 'Group is required'),
  lesson_id: z.number().min(1, 'Lesson is required'),
  date_start: z.string().min(1, 'Date is required'),
  time_start: z.string().min(1, 'Time is required'),
  is_done: z.boolean(),
})

type SessionFormData = z.infer<typeof sessionSchema>

const Sessions: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [sessions, setSessions] = useState<Session[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [sessionPagination, setSessionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [attendanceSession, setAttendanceSession] = useState<Session | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'date_start', sort: 'desc' }])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  })

  const selectedGroupId = watch('group_id')

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, sortModel])

  useEffect(() => {
    const fetchFilteredLessons = async () => {
      if (!selectedGroupId) {
        setFilteredLessons([])
        return
      }

      const selectedGroup = groups.find(g => g.id === selectedGroupId)
      if (!selectedGroup?.course_id) {
        setFilteredLessons([])
        return
      }

      try {
        setLoadingLessons(true)
        const lessons = await lessonApi.getLessonsByCourse(selectedGroup.course_id)
        setFilteredLessons(lessons)
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to fetch lessons', severity: 'error' as const })
        setFilteredLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }

    fetchFilteredLessons()
  }, [selectedGroupId, groups])

  const fetchData = async () => {
    try {
      const sortBy = sortModel[0]?.field || 'date_start'
      const sortDir = sortModel[0]?.sort || 'desc'
      
      const [sessionsRes, groupsRes, lessonsRes] = await Promise.all([
        sessionApi.getSessions({ 
          page: sessionPagination.page, 
          limit: sessionPagination.limit,
          search: debouncedSearch,
          sort_by: sortBy,
          sort_dir: sortDir
        }),
        groupApi.getGroups(),
        lessonApi.getLessons(),
      ])
      setSessions(sessionsRes.data)
      setSessionPagination({
        page: sessionsRes.page,
        limit: sessionsRes.limit,
        total: sessionsRes.total,
        total_pages: sessionsRes.total_pages
      })
      setGroups(groupsRes.data)
      setFilteredLessons(lessonsRes.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<SessionFormData> = async (data) => {
    try {
      if (editingSession) {
        await sessionApi.updateSession(editingSession.id, data)
        setSnackbar({ open: true, message: 'Session updated successfully', severity: 'success' })
      } else {
        await sessionApi.createSession(data)
        setSnackbar({ open: true, message: 'Session created successfully', severity: 'success' })
      }
      fetchData()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Operation failed', severity: 'error' as const })
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await sessionApi.deleteSession(id)
        setSnackbar({ open: true, message: 'Session deleted successfully', severity: 'success' })
        fetchData()
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error || 'Delete failed', severity: 'error' as const })
      }
    }
  }

  const handleEdit = async (session: Session) => {
    setEditingSession(session)
    reset(session)
    
    // Load lessons for the session's existing group
    const selectedGroup = groups.find(g => g.id === session.group_id)
    if (selectedGroup?.course_id) {
      try {
        setLoadingLessons(true)
        const lessons = await lessonApi.getLessonsByCourse(selectedGroup.course_id)
        setFilteredLessons(lessons)
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to fetch lessons', severity: 'error' as const })
        setFilteredLessons([])
      } finally {
        setLoadingLessons(false)
      }
    }
    
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingSession(null)
    reset()
    setFilteredLessons([])
  }

  const handleAttendance = (session: Session) => {
    setAttendanceSession(session)
    const selectedGroup = groups.find(g => g.id === session.group_id)
    const groupStudentIds = selectedGroup?.students?.map(s => s.id) || []
    setSelectedStudents(groupStudentIds)
    setAttendanceDialogOpen(true)
  }

  const handleCloseAttendanceDialog = () => {
    setAttendanceDialogOpen(false)
    setAttendanceSession(null)
    setSelectedStudents([])
  }

  const onSubmitAttendance = async () => {
    if (!attendanceSession) return

    try {
      await sessionApi.updateAttendance(attendanceSession.id, selectedStudents)
      setSnackbar({ open: true, message: 'Attendance updated successfully', severity: 'success' })
      fetchData()
      handleCloseAttendanceDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Update failed', severity: 'error' as const })
    }
  }

  const handleStudentChange = (event: any) => {
    const value = event.target.value
    setSelectedStudents(value)
  }

  const getAvailableStudents = () => {
    if (!selectedGroupId) return []
    const selectedGroup = groups.find(g => g.id === selectedGroupId)
    return selectedGroup?.students || []
  }

  const allColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'group_name',
      headerName: 'Group',
      width: 150,
      renderCell: (params) => params.row.group?.name || `Group ${params.row.group_id}`,
    },
    {
      field: 'lesson_title',
      headerName: 'Lesson',
      width: 200,
      renderCell: (params) => params.row.lesson?.title || `Lesson ${params.row.lesson_id}`,
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
      field: 'is_done',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          {params.value ? <CheckCircle color="success" /> : null}
          <Typography color={params.value ? 'success.main' : 'text.secondary'}>
            {params.value ? 'Done' : 'Pending'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<CheckCircle />}
          label="Attendance"
          onClick={() => handleAttendance(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ]

  const columns = isMobile 
    ? allColumns.filter(col => 
        ['id', 'group_name', 'date_start', 'is_done', 'actions'].includes(col.field)
      )
    : allColumns

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexDirection={{ xs: 'column', sm: 'row' }} gap={{ xs: 2, sm: 0 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, mb: { xs: 2, sm: 0 } }}>Sessions</Typography>
        <Box display="flex" gap={{ xs: 1, sm: 2 }} flexWrap="wrap" justifyContent={{ xs: 'stretch', sm: 'flex-start' }}>
          <TextField
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: search && (
                <Clear 
                  sx={{ cursor: 'pointer', color: 'text.secondary' }} 
                  onClick={() => setSearch('')} 
                />
              )
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ flex: { xs: 1, sm: 'auto' } }}
          >
            Add Session
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={sessions}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: sessionPagination.page - 1, pageSize: sessionPagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={sessionPagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            const sortBy = sortModel[0]?.field || 'date_start'
            const sortDir = sortModel[0]?.sort || 'desc'
            setSessionPagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            sessionApi.getSessions({ 
              page: newPage, 
              limit: newLimit,
              search: debouncedSearch,
              sort_by: sortBy,
              sort_dir: sortDir
            }).then(response => {
              setSessions(response.data)
              setSessionPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                total_pages: response.total_pages
              })
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to fetch sessions', severity: 'error' as const })
            })
          }}
          sortingMode="server"
          onSortModelChange={(model) => {
            setSortModel(model)
            setSessionPagination(prev => ({ ...prev, page: 1 }))
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSession ? 'Edit Session' : 'Add Session'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} sx={{ '& > *': { minWidth: 0 } }}>
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  {...register('group_id', { valueAsNumber: true })}
                  error={!!errors.group_id}
                  defaultValue=""
                >
                  {groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Lesson</InputLabel>
                <Select
                  {...register('lesson_id', { valueAsNumber: true })}
                  error={!!errors.lesson_id}
                  defaultValue=""
                  disabled={!selectedGroupId}
                >
                  {loadingLessons ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading lessons...
                    </MenuItem>
                  ) : filteredLessons.length === 0 ? (
                    <MenuItem disabled>
                      {selectedGroupId ? 'No lessons available' : 'Select a group first'}
                    </MenuItem>
                  ) : (
                    filteredLessons.map((lesson) => (
                      <MenuItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </MenuItem>
                    ))
                  )}
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSession ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={attendanceDialogOpen} onClose={handleCloseAttendanceDialog} maxWidth="md" fullWidth>
        <DialogTitle>Update Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select students who attended this session.
          </Typography>
          <FormControl fullWidth sx={{ '& > *': { minWidth: 0 } }}>
            <InputLabel>Students Attended</InputLabel>
            <Select
              multiple
              value={selectedStudents}
              onChange={handleStudentChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const student = getAvailableStudents().find(s => s.id === value)
                    return (
                      <Chip key={String(value)} label={student?.fullname || String(value)} size="small" />
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttendanceDialog}>Cancel</Button>
          <Button onClick={onSubmitAttendance} variant="contained">Update Attendance</Button>
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

export default Sessions
