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
  Upload,
  Search,
  Clear,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridActionsCellItem, GridSortModel } from '@mui/x-data-grid'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { groupApi, studentApi, courseApi } from '../../api/services'
import { Group, Student, Course } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'

const groupSchema = z.object({
  course_id: z.number().min(1, 'Course is required'),
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(['Group', 'Private']),
  description: z.string().min(1, 'Description is required'),
  group_phone: z.string().min(1, 'Group phone is required'),
  meeting_link: z.string().url().optional().or(z.literal('')),
  recordings_link: z.string().url().optional().or(z.literal('')),
  first_lesson_date: z.string().min(1, 'First lesson date is required'),
  first_lesson_time: z.string().min(1, 'First lesson time is required'),
  is_active: z.boolean(),
  students: z.array(z.number()).optional(),
})

type GroupFormData = z.infer<typeof groupSchema>

const Groups: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [groups, setGroups] = useState<Group[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [groupPagination, setGroupPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'id', sort: 'desc' }])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  })

  const selectedStudents = watch('students') || []

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, sortModel])

  const fetchData = async () => {
    try {
      const sortBy = sortModel[0]?.field || 'id'
      const sortDir = sortModel[0]?.sort || 'desc'
      const [groupsRes, studentsRes, coursesRes] = await Promise.all([
        groupApi.getGroups({ 
          page: groupPagination.page, 
          limit: groupPagination.limit,
          search: debouncedSearch,
          sort_by: sortBy,
          sort_dir: sortDir
        }),
        studentApi.getStudents(), // Students without pagination for dropdown
        courseApi.getCourses(), // Courses without pagination for dropdown
      ])
      setGroups(groupsRes.data)
      setGroupPagination({
        page: groupsRes.page,
        limit: groupsRes.limit,
        total: groupsRes.total,
        total_pages: groupsRes.total_pages
      })
      setStudents(studentsRes.data)
      setCourses(coursesRes.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<GroupFormData> = async (data) => {
    try {
      if (editingGroup) {
        await groupApi.updateGroup(editingGroup.id, {
          ...data,
          meeting_link: data.meeting_link || '',
          recordings_link: data.recordings_link || '',
          students: data.students ? [] : undefined
        } as Partial<Group>)
        setSnackbar({ open: true, message: 'Group updated successfully', severity: 'success' })
      } else {
        await groupApi.createGroup({
          ...data,
          meeting_link: data.meeting_link || '',
          recordings_link: data.recordings_link || '',
          students: data.students ? [] : undefined
        } as Omit<Group, 'id'>)
        setSnackbar({ open: true, message: 'Group created successfully', severity: 'success' })
      }
      fetchData()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Operation failed', severity: 'error' as const })
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await groupApi.deleteGroup(id)
        setSnackbar({ open: true, message: 'Group deleted successfully', severity: 'success' })
        fetchData()
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error || 'Delete failed', severity: 'error' as const })
      }
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    
    // Format date for HTML date input (YYYY-MM-DD)
    const formattedDate = group.first_lesson_date 
      ? new Date(group.first_lesson_date).toISOString().split('T')[0]
      : ''
    
    // Format time for HTML time input (HH:MM)
    let formattedTime = ''
    if (group.first_lesson_time) {
      try {
        const timeDate = new Date(group.first_lesson_time)
        if (!isNaN(timeDate.getTime())) {
          const hours = timeDate.getHours().toString().padStart(2, '0')
          const minutes = timeDate.getMinutes().toString().padStart(2, '0')
          formattedTime = `${hours}:${minutes}`
        }
      } catch (e) {
        console.error('Error parsing time:', group.first_lesson_time)
      }
    }
    
    reset({
      ...group,
      first_lesson_date: formattedDate,
      first_lesson_time: formattedTime,
      students: group.students?.map(s => s.id) || [],
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingGroup(null)
    reset()
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await groupApi.importGroups(formData)
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
    setValue('students', value)
  }

  const allColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'course_name',
      headerName: 'Course',
      width: 150,
      renderCell: (params) => params.row.course?.title || `Course ${params.row.course_id}`,
    },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'group_phone', headerName: 'Group Phone', width: 130 },
    {
      field: 'students_count',
      headerName: 'Students',
      width: 100,
      renderCell: (params) => params.row.students?.length || 0,
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

  const columns = isMobile 
    ? allColumns.filter(col => 
        ['id', 'name', 'type', 'students_count', 'is_active', 'actions'].includes(col.field)
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
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, mb: { xs: 2, sm: 0 } }}>Groups</Typography>
        <Box display="flex" gap={{ xs: 1, sm: 2 }} flexWrap="wrap" justifyContent={{ xs: 'stretch', sm: 'flex-start' }}>
          <TextField
            placeholder="Search groups..."
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
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
            sx={{ flex: { xs: 1, sm: 'auto' } }}
          >
            Import CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ flex: { xs: 1, sm: 'auto' } }}
          >
            Add Group
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={groups}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: groupPagination.page - 1, pageSize: groupPagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={groupPagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            const sortBy = sortModel[0]?.field || 'id'
            const sortDir = sortModel[0]?.sort || 'desc'
            setGroupPagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            groupApi.getGroups({ 
              page: newPage, 
              limit: newLimit,
              search: debouncedSearch,
              sort_by: sortBy,
              sort_dir: sortDir
            }).then(response => {
              setGroups(response.data)
              setGroupPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                total_pages: response.total_pages
              })
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to fetch groups', severity: 'error' as const })
            })
          }}
          sortingMode="server"
          onSortModelChange={(model) => {
            setSortModel(model)
            setGroupPagination(prev => ({ ...prev, page: 1 }))
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingGroup ? 'Edit Group' : 'Add Group'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} sx={{ '& > *': { minWidth: 0 } }}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={watch('course_id') || ''}
                  onChange={(e) => setValue('course_id', Number(e.target.value))}
                  error={!!errors.course_id}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Group Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={watch('type') || ''}
                  onChange={(e) => setValue('type', e.target.value as 'Group' | 'Private')}
                  error={!!errors.type}
                >
                  <MenuItem value="Group">Group</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                label="Group Phone"
                {...register('group_phone')}
                error={!!errors.group_phone}
                helperText={errors.group_phone?.message}
                fullWidth
              />
              <TextField
                label="Meeting Link"
                {...register('meeting_link')}
                error={!!errors.meeting_link}
                helperText={errors.meeting_link?.message}
                fullWidth
              />
              <TextField
                label="Recordings Link"
                {...register('recordings_link')}
                error={!!errors.recordings_link}
                helperText={errors.recordings_link?.message}
                fullWidth
              />
              <TextField
                label="First Lesson Date"
                type="date"
                {...register('first_lesson_date')}
                error={!!errors.first_lesson_date}
                helperText={errors.first_lesson_date?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="First Lesson Time"
                type="time"
                {...register('first_lesson_time')}
                error={!!errors.first_lesson_time}
                helperText={errors.first_lesson_time?.message}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth sx={{ gridColumn: '1 / -1' }}>
                <InputLabel>Students</InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={handleStudentChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const student = students.find(s => s.id === value)
                        return (
                          <Chip key={value} label={student?.fullname || value} size="small" />
                        )
                      })}
                    </Box>
                  )}
                >
                  {students.map((student) => (
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
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Groups from CSV</DialogTitle>
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
              CSV headers: id, course_id, name, type, description, group_phone, meeting_link, recordings_link, first_lesson_date, first_lesson_time, is_active, students
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

export default Groups
