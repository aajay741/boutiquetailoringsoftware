import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  InputAdornment,
  MenuItem,
  Avatar,
  Divider,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  HowToReg as StatusIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UserFormDialog = ({ open, handleClose, handleSubmit, initialData, isEdit, message, setMessage }) => {
  const [form, setForm] = useState(initialData);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setPreviewImage(initialData.profile_image_url || null);
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ 
          text: 'Image size should be less than 2MB', 
          severity: 'error',
          open: true
        });
        return;
      }
      setForm({ ...form, profile_image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setForm({ ...form, profile_image: null });
    setPreviewImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['email', 'first_name', 'last_name'];
    
    if (!isEdit) {
      requiredFields.push('password');
    }

    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEdit && form.password && form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({
        text: 'Please fix the errors in the form',
        severity: 'error',
        open: true
      });
      return;
    }

    const success = await handleSubmit(form);
    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
        <Typography variant="h6">
          {isEdit ? 'Edit User' : 'Create New User'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          {isEdit ? 'Update user details' : 'Fill in the details below to register a new user'}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {message.open && (
          <Alert severity={message.severity} sx={{ mb: 3 }} onClose={() => setMessage(prev => ({ ...prev, open: false }))}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Left Column - Image Upload */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  <Avatar
                    src={previewImage || form.profile_image_url}
                    sx={{
                      width: 150,
                      height: 150,
                      border: '3px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  {(previewImage || form.profile_image_url) && (
                    <IconButton
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  size="medium"
                  sx={{ textTransform: 'none', mb: 1 }}
                >
                  Upload Photo
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  JPG or PNG, max 2MB
                </Typography>
              </Box>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      name="first_name"
                      value={form.first_name || ''}
                      onChange={handleChange}
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color={errors.first_name ? 'error' : 'action'} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      name="last_name"
                      value={form.last_name || ''}
                      onChange={handleChange}
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color={errors.last_name ? 'error' : 'action'} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={form.username || ''}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email *"
                      name="email"
                      type="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color={errors.email ? 'error' : 'action'} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={form.phone || ''}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  {!isEdit && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password *"
                        name="password"
                        type="password"
                        value={form.password || ''}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color={errors.password ? 'error' : 'action'} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Account Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Account Status"
                      name="status"
                      value={form.status || 'active'}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <StatusIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {['active', 'inactive', 'banned'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="User Role"
                      name="role"
                      value={form.role || 'user'}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AdminIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {['user', 'admin', 'manager'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          {isEdit ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success', open: false });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null });

  const emptyUser = {
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    profile_image: null,
    status: 'active',
    role: 'user'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/login/public_html/api/getUsers.php');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Error fetching users',
        severity: 'error',
        open: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setCurrentUser({ ...emptyUser });
    setIsEdit(false);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser({ ...user });
    setIsEdit(true);
    setOpenDialog(true);
  };

  const handleDeleteUser = (userId) => {
    setDeleteConfirm({ open: true, userId });
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost/login/public_html/api/deleteUser.php?id=${deleteConfirm.userId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({
          text: 'User deleted successfully',
          severity: 'success',
          open: true
        });
        fetchUsers();
      } else {
        throw new Error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Error deleting user',
        severity: 'error',
        open: true
      });
    } finally {
      setDeleteConfirm({ open: false, userId: null });
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const url = isEdit 
        ? `http://localhost/login/public_html/api/updateUser.php?id=${currentUser.id}`
        : 'http://localhost/login/public_html/api/addMaster.php';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }

      if (result.success) {
        setMessage({
          text: result.message || `User ${isEdit ? 'updated' : 'created'} successfully!`,
          severity: 'success',
          open: true
        });
        fetchUsers();
        return true;
      } else {
        if (result.errors) {
          setMessage({
            text: 'Please fix the form errors',
            severity: 'error',
            open: true
          });
        }
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
      }
    } catch (error) {
      setMessage({
        text: error.message || `Error ${isEdit ? 'updating' : 'creating'} user`,
        severity: 'error',
        open: true
      });
      return false;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

 const filteredUsers = users.filter(user => {
  const searchLower = searchTerm.toLowerCase();
  return (
    (user.first_name?.toLowerCase().includes(searchLower)) ||
    (user.last_name?.toLowerCase().includes(searchLower)) ||
    (user.email?.toLowerCase().includes(searchLower)) ||
    (user.phone?.toLowerCase().includes(searchLower)) ||
    (user.username?.toLowerCase().includes(searchLower))
  );
});

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            User Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search users..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Toolbar>
      </Card>

      {message.open && (
        <Alert severity={message.severity} sx={{ mb: 3 }} onClose={() => setMessage(prev => ({ ...prev, open: false }))}>
          {message.text}
        </Alert>
      )}

      <Card>
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={user.profile_image_url} 
                                sx={{ mr: 2 }}
                              />
                              <Box>
                                <Typography variant="subtitle2">
                                  {user.first_name} {user.last_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  @{user.username || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{user.email}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.phone || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role} 
                              color={
                                user.role === 'admin' ? 'primary' : 
                                user.role === 'manager' ? 'secondary' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status} 
                              color={
                                user.status === 'active' ? 'success' : 
                                user.status === 'inactive' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditUser(user)}>
                                <EditIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteUser(user.id)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </TableContainer>
      </Card>

      {/* Add/Edit User Dialog */}
      <UserFormDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleSubmit={handleSubmitUser}
        initialData={currentUser || emptyUser}
        isEdit={isEdit}
        message={message}
        setMessage={setMessage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, userId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, userId: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;