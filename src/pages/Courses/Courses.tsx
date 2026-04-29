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
import { courseApi } from '../../api/services'
import { Course } from '../../types/data'
import { useDebounce } from '../../hooks/useDebounce'

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  module: z.string().min(1, 'Module is required'),
  description: z.string().min(1, 'Description is required'),
  is_active: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

const Courses: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [courses, setCourses] = useState<Course[]>([])
  const [coursePagination, setCoursePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
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
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  })

  useEffect(() => {
    fetchData()
  }, [debouncedSearch, sortModel])

  const fetchData = async () => {
    try {
      const sortBy = sortModel[0]?.field || 'id'
      const sortDir = sortModel[0]?.sort || 'desc'
      const coursesRes = await courseApi.getCourses({ 
        page: coursePagination.page, 
        limit: coursePagination.limit,
        search: debouncedSearch,
        sort_by: sortBy,
        sort_dir: sortDir
      })
      setCourses(coursesRes.data)
      setCoursePagination({
        page: coursesRes.page,
        limit: coursesRes.limit,
        total: coursesRes.total,
        total_pages: coursesRes.total_pages
      })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<CourseFormData> = async (data) => {
    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse.id, {
          ...data,
        } as Partial<Course>)
        setSnackbar({ open: true, message: 'Course updated successfully', severity: 'success' })
      } else {
        await courseApi.createCourse({
          ...data,
        } as Omit<Course, 'id'>)
        setSnackbar({ open: true, message: 'Course created successfully', severity: 'success' })
      }
      fetchData()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Operation failed', severity: 'error' as const })
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.deleteCourse(id)
        setSnackbar({ open: true, message: 'Course deleted successfully', severity: 'success' })
        fetchData()
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error || 'Delete failed', severity: 'error' as const })
      }
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    reset(course)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCourse(null)
    reset()
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await courseApi.importCourses(formData)
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

  const allColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'module', headerName: 'Module', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
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
        ['id', 'title', 'is_active', 'actions'].includes(col.field)
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
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, mb: { xs: 2, sm: 0 } }}>Courses</Typography>
        <Box display="flex" gap={{ xs: 1, sm: 2 }} flexWrap="wrap" justifyContent={{ xs: 'stretch', sm: 'flex-start' }}>
          <TextField
            placeholder="Search courses..."
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
            Add Course
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={courses}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: coursePagination.page - 1, pageSize: coursePagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={coursePagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            const sortBy = sortModel[0]?.field || 'id'
            const sortDir = sortModel[0]?.sort || 'desc'
            setCoursePagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            courseApi.getCourses({ 
              page: newPage, 
              limit: newLimit,
              search: debouncedSearch,
              sort_by: sortBy,
              sort_dir: sortDir
            }).then(response => {
              setCourses(response.data)
              setCoursePagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                total_pages: response.total_pages
              })
            }).catch(() => {
              setSnackbar({ open: true, message: 'Failed to fetch courses', severity: 'error' as const })
            })
          }}
          sortingMode="server"
          onSortModelChange={(model) => {
            setSortModel(model)
            setCoursePagination(prev => ({ ...prev, page: 1 }))
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} sx={{ '& > *': { minWidth: 0 } }}>
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
                label="Description"
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
                multiline
                rows={3}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Courses from CSV</DialogTitle>
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
              CSV headers: id, title, module, description, is_active
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

export default Courses
