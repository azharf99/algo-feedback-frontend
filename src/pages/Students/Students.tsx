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
import { studentApi } from '../../api/services'
import { Student } from '../../types/data'

const studentSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  surname: z.string().min(1, 'Surname is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  phone_number: z.string().min(1, 'Phone number is required'),
  parent_name: z.string().min(1, 'Parent name is required'),
  parent_contact: z.string().min(1, 'Parent contact is required'),
  is_active: z.boolean(),
})

type StudentFormData = z.infer<typeof studentSchema>

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async (page?: number, limit?: number) => {
    try {
      const response = await studentApi.getStudents({ page: page || pagination.page, limit: limit || pagination.limit })
      setStudents(response.data)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        total_pages: response.total_pages
      })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to fetch students', severity: 'error' as const })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit: SubmitHandler<StudentFormData> = async (data) => {
    try {
      if (editingStudent) {
        // Update student - don't send password if empty
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        await studentApi.updateStudent(editingStudent.id, updateData)
        setSnackbar({ open: true, message: 'Student updated successfully', severity: 'success' })
      } else {
        // Create new student - password is required
        if (!data.password) {
          setSnackbar({ open: true, message: 'Password is required for new students', severity: 'error' as const })
          return
        }
        await studentApi.createStudent(data)
        setSnackbar({ open: true, message: 'Student created successfully', severity: 'success' })
      }
      fetchStudents()
      handleCloseDialog()
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Operation failed', severity: 'error' as const })
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentApi.deleteStudent(id)
        setSnackbar({ open: true, message: 'Student deleted successfully', severity: 'success' })
        fetchStudents()
      } catch (error: any) {
        setSnackbar({ open: true, message: error.response?.data?.error || 'Delete failed', severity: 'error' as const })
      }
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    reset(student)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingStudent(null)
    reset()
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await studentApi.importStudents(formData)
      let message = `Import completed: ${result.created} created, ${result.updated} updated`
      if (result.errors.length > 0) {
        message += `, ${result.errors.length} errors`
      }
      setSnackbar({ open: true, message, severity: 'success' })
      fetchStudents()
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullname', headerName: 'Full Name', width: 150 },
    { field: 'surname', headerName: 'Surname', width: 150 },
    { field: 'username', headerName: 'Username', width: 120 },
    { field: 'phone_number', headerName: 'Phone Number', width: 130 },
    { field: 'parent_name', headerName: 'Parent Name', width: 150 },
    { field: 'parent_contact', headerName: 'Parent Contact', width: 130 },
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
        <Typography variant="h4">Students</Typography>
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
            Add Student
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={students}
          columns={columns}
          paginationMode="server"
          paginationModel={{ page: pagination.page - 1, pageSize: pagination.limit }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowCount={pagination.total}
          onPaginationModelChange={(model) => {
            const newPage = model.page + 1
            const newLimit = model.pageSize
            setPagination(prev => ({ ...prev, page: newPage, limit: newLimit }))
            fetchStudents(newPage, newLimit)
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Full Name"
                {...register('fullname')}
                error={!!errors.fullname}
                helperText={errors.fullname?.message}
                fullWidth
              />
              <TextField
                label="Surname"
                {...register('surname')}
                error={!!errors.surname}
                helperText={errors.surname?.message}
                fullWidth
              />
              <TextField
                label="Username"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                fullWidth
              />
              <TextField
                label="Phone Number"
                {...register('phone_number')}
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                fullWidth
              />
              <TextField
                label="Parent Name"
                {...register('parent_name')}
                error={!!errors.parent_name}
                helperText={errors.parent_name?.message}
                fullWidth
              />
              <TextField
                label="Parent Contact"
                {...register('parent_contact')}
                error={!!errors.parent_contact}
                helperText={errors.parent_contact?.message}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message || (editingStudent ? 'Leave empty to keep current password' : '')}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Students from CSV</DialogTitle>
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
              CSV headers: id, fullname, surname, username, password, phone_number, parent_name, parent_contact, is_active
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

export default Students
