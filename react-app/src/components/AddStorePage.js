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
  IconButton,
  Card,
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
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Store as StoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

const StoreFormDialog = ({ open, handleClose, handleSubmit, initialData, isEdit, message, setMessage }) => {
  const [form, setForm] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialData);
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

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'store_name', 'store_code', 'address_line1', 
      'city', 'state', 'country', 'pincode'
    ];
    
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (form.phone_number && !/^[0-9]{10,15}$/.test(form.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
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
          {isEdit ? 'Edit Store' : 'Create New Store'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          {isEdit ? 'Update store details' : 'Fill in the details below to register a new store'}
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
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Store Name *"
                    name="store_name"
                    value={form.store_name || ''}
                    onChange={handleChange}
                    error={!!errors.store_name}
                    helperText={errors.store_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon color={errors.store_name ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Store Code *"
                    name="store_code"
                    value={form.store_code || ''}
                    onChange={handleChange}
                    error={!!errors.store_code}
                    helperText={errors.store_code}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StoreIcon color={errors.store_code ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={form.phone_number || ''}
                    onChange={handleChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color={errors.phone_number ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alternate Contact"
                    name="alternate_contact"
                    value={form.alternate_contact || ''}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1 *"
                    name="address_line1"
                    value={form.address_line1 || ''}
                    onChange={handleChange}
                    error={!!errors.address_line1}
                    helperText={errors.address_line1}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color={errors.address_line1 ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address Line 2"
                    name="address_line2"
                    value={form.address_line2 || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City *"
                    name="city"
                    value={form.city || ''}
                    onChange={handleChange}
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="District"
                    name="district"
                    value={form.district || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State *"
                    name="state"
                    value={form.state || ''}
                    onChange={handleChange}
                    error={!!errors.state}
                    helperText={errors.state}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country *"
                    name="country"
                    value={form.country || ''}
                    onChange={handleChange}
                    error={!!errors.country}
                    helperText={errors.country}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pincode *"
                    name="pincode"
                    value={form.pincode || ''}
                    onChange={handleChange}
                    error={!!errors.pincode}
                    helperText={errors.pincode}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Store Manager"
                    name="store_manager"
                    value={form.store_manager || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Opening Date"
                    name="opening_date"
                    type="date"
                    value={form.opening_date || ''}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Working Hours"
                    name="working_hours"
                    value={form.working_hours || '9:00 AM - 9:00 PM'}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScheduleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={form.status || 'Active'}
                      onChange={handleChange}
                      label="Status"
                    >
                      {['Active', 'Inactive', 'Under Maintenance'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
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
          {isEdit ? 'Update Store' : 'Create Store'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success', open: false });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, storeId: null });

  const emptyStore = {
    store_name: '',
    store_code: '',
    phone_number: '',
    email: '',
    alternate_contact: '',
    address_line1: '',
    address_line2: '',
    city: '',
    district: '',
    state: '',
    country: '',
    pincode: '',
    store_manager: '',
    opening_date: '',
    working_hours: '9:00 AM - 9:00 PM',
    status: 'Active'
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/boutiquetailoringsoftware/public_html/api/stores/getStores.php');
      const data = await response.json();
      
      if (response.ok) {
        setStores(data.stores || []);
      } else {
        throw new Error(data.message || 'Failed to fetch stores');
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Error fetching stores',
        severity: 'error',
        open: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = () => {
    setCurrentStore({ ...emptyStore });
    setIsEdit(false);
    setOpenDialog(true);
  };

  const handleEditStore = (store) => {
    setCurrentStore({ ...store });
    setIsEdit(true);
    setOpenDialog(true);
  };

 const handleDeleteStore = (storeId) => {
  setDeleteConfirm({ open: true, storeId });
};

const confirmDelete = async () => {
  try {
    if (!deleteConfirm.storeId) {
      throw new Error("No store ID provided for deletion");
    }

    const response = await fetch(`http://localhost/boutiquetailoringsoftware/public_html/api/stores/deleteStore.php?id=${deleteConfirm.storeId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      setMessage({
        text: 'Store deleted successfully',
        severity: 'success',
        open: true
      });
      fetchStores();
    } else {
      throw new Error(result.message || 'Failed to delete store');
    }
  } catch (error) {
    setMessage({
      text: error.message || 'Error deleting store',
      severity: 'error',
      open: true
    });
  } finally {
    setDeleteConfirm({ open: false, storeId: null });
  }
};

  const handleSubmitStore = async (storeData) => {
    try {
      const url = isEdit 
        ? `http://localhost/boutiquetailoringsoftware/public_html/api/stores/updateStore.php?id=${currentStore.store_id}`
        : 'http://localhost/boutiquetailoringsoftware/public_html/api/stores/addStore.php';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'create'} store`);
      }

      if (result.success) {
        setMessage({
          text: result.message || `Store ${isEdit ? 'updated' : 'created'} successfully!`,
          severity: 'success',
          open: true
        });
        fetchStores();
        return true;
      } else {
        if (result.errors) {
          setMessage({
            text: 'Please fix the form errors',
            severity: 'error',
            open: true
          });
        }
        throw new Error(result.message || `Failed to ${isEdit ? 'update' : 'create'} store`);
      }
    } catch (error) {
      setMessage({
        text: error.message || `Error ${isEdit ? 'updating' : 'creating'} store`,
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

  const filteredStores = stores.filter(store => {
    const searchLower = searchTerm.toLowerCase();
    return (
      store.store_name.toLowerCase().includes(searchLower) ||
      store.store_code.toLowerCase().includes(searchLower) ||
      (store.city && store.city.toLowerCase().includes(searchLower)) ||
      (store.state && store.state.toLowerCase().includes(searchLower)) ||
      (store.phone_number && store.phone_number.toLowerCase().includes(searchLower)) ||
      (store.email && store.email.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Store Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search stores..."
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
              onClick={handleAddStore}
            >
              Add Store
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
              <Table sx={{ minWidth: 650 }} aria-label="store table">
                <TableHead>
                  <TableRow>
                    <TableCell>Store</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    {/* <TableCell align="right">Actions</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No stores found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStores
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((store) => (
                        <TableRow key={store.store_id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StoreIcon color="primary" sx={{ mr: 2 }} />
                              <Box>
                                <Typography variant="subtitle2">
                                  {store.store_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Code: {store.store_code}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {store.store_manager || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {store.alternate_contact || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {store.phone_number || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {store.email || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {store.city}, {store.state}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {store.pincode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={store.status} 
                              color={
                                store.status === 'Active' ? 'success' : 
                                store.status === 'Inactive' ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          {/* <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEditStore(store)}>
                                <EditIcon color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteStore(store.store_id)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Tooltip>
                          </TableCell> */}
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredStores.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </TableContainer>
      </Card>

      {/* Add/Edit Store Dialog */}
      <StoreFormDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleSubmit={handleSubmitStore}
        initialData={currentStore || emptyStore}
        isEdit={isEdit}
        message={message}
        setMessage={setMessage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, storeId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this store? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, storeId: null })}>
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

export default StoreManagement;