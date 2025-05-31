import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  TextField,
  Button,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Tooltip,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  DateRange as DateIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  Straighten as MeasurementsIcon,
  Store as StoreIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Note as NoteIcon,
  Straighten as LengthIcon,
  Home as AddressIcon,
  Image as ImageIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import axios from 'axios';
import Slogo from '../images/Slogo.png';

const OrderFormWithMeasurements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for API data
  const [masters, setMasters] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null,
    orderId: null
  });

  // Status options for particulars
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' }
  ];

  // Initial form state
  const initialFormData = {
    orderTakenBy: {
      masterId: '',
    },
    assignedTo: {
      masterId: '',
    },
    dates: {
      takenDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
    },
    specialNote: '',
    customer: {
      fullName: '',
      phone: '',
      whatsappSame: true,
      whatsapp: '',
      storeId: '',
      address: ''
    },
    particulars: [
      {
        description: '',
        price: '',
        status: 'pending',
        images: []
      }
    ],
    advance: '',
  };

  const initialMeasurements = {
    L: '',
    SH: '',
    ARM: '',
    SL: [{ L: '', W: '', A: '' }],
    UB: '',
    MB: '',
    W: '',
    POINT: '',
    FN: '',
    BN: '',
    HIP: '',
    SEAT: '',
    THIGH: '',
    others: []
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);
  const [measurements, setMeasurements] = useState(initialMeasurements);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesResponse, mastersResponse] = await Promise.all([
          axios.get('http://localhost/login/public_html/api/stores/getStores.php'),
          axios.get('http://localhost/login/public_html/api/getUsers.php')
        ]);

        // Validate and set stores data
        if (!Array.isArray(storesResponse?.data?.stores)) {
          throw new Error('Invalid stores data format');
        }
        setStores(storesResponse.data.stores);

        // Validate and set masters data
        if (!Array.isArray(mastersResponse?.data?.users)) {
          throw new Error('Invalid masters data format');
        }
        setMasters(mastersResponse.data.users);

        // Set initial form values if data exists
        if (storesResponse.data.stores.length > 0) {
          const firstStoreId = storesResponse.data.stores[0].store_id;
          setFormData(prev => ({
            ...prev,
            customer: {
              ...prev.customer,
              storeId: firstStoreId
            }
          }));
        }

        if (mastersResponse.data.users.length > 0) {
          const firstMasterId = mastersResponse.data.users[0].id;
          setFormData(prev => ({
            ...prev,
            orderTakenBy: {
              masterId: firstMasterId
            },
            assignedTo: {
              masterId: firstMasterId
            }
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Form handlers
  const handleChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const nested = keys.reduce((obj, key) => obj[key], prev);
      nested[lastKey] = value;
      return { ...prev };
    });
  };

  const handleWhatsappToggle = () => {
    const newValue = !formData.customer.whatsappSame;
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        whatsappSame: newValue,
        whatsapp: newValue ? prev.customer.phone : prev.customer.whatsapp
      }
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        phone: value,
        whatsapp: prev.customer.whatsappSame ? value : prev.customer.whatsapp
      }
    }));
  };

  const addParticular = () => {
    setFormData(prev => ({
      ...prev,
      particulars: [
        ...prev.particulars,
        { description: '', price: '', status: 'pending', images: [] }
      ]
    }));
  };

  const removeParticular = (index) => {
    setFormData(prev => ({
      ...prev,
      particulars: prev.particulars.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (index, files) => {
    if (!files || files.length === 0) return;
    
    setFormData(prev => {
      const updatedParticulars = [...prev.particulars];
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      }));
      
      updatedParticulars[index].images = [...updatedParticulars[index].images, ...newImages];
      
      return { ...prev, particulars: updatedParticulars };
    });
  };

  const removeImage = (particularIndex, imageId) => {
    setFormData(prev => {
      const updatedParticulars = [...prev.particulars];
      const imageIndex = updatedParticulars[particularIndex].images.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1) {
        URL.revokeObjectURL(updatedParticulars[particularIndex].images[imageIndex].preview);
        updatedParticulars[particularIndex].images = updatedParticulars[particularIndex].images.filter(
          (_, i) => i !== imageIndex
        );
      }
      
      return { ...prev, particulars: updatedParticulars };
    });
  };

  // Measurements handlers
  const addSLField = () => {
    setMeasurements(prev => ({
      ...prev,
      SL: [...prev.SL, { L: '', W: '', A: '' }]
    }));
  };

  const removeSLField = (index) => {
    setMeasurements(prev => ({
      ...prev,
      SL: prev.SL.filter((_, i) => i !== index)
    }));
  };

  const handleSLChange = (index, field, value) => {
    setMeasurements(prev => {
      const newSL = [...prev.SL];
      newSL[index] = { ...newSL[index], [field]: value };
      return { ...prev, SL: newSL };
    });
  };

  const addOtherField = () => {
    setMeasurements(prev => ({
      ...prev,
      others: [...prev.others, { name: '', value: '' }]
    }));
  };

  const removeOtherField = (index) => {
    setMeasurements(prev => ({
      ...prev,
      others: prev.others.filter((_, i) => i !== index)
    }));
  };

  const handleOtherChange = (index, field, value) => {
    setMeasurements(prev => {
      const newOthers = [...prev.others];
      newOthers[index] = { ...newOthers[index], [field]: value };
      return { ...prev, others: newOthers };
    });
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.particulars.forEach(particular => {
        particular.images.forEach(image => {
          URL.revokeObjectURL(image.preview);
        });
      });
    };
  }, [formData.particulars]);

  // Calculate totals
  const total = formData.particulars.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const balance = total - (Number(formData.advance) || 0);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null, orderId: null });

    try {
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add customer data
      formDataToSend.append('customer[name]', formData.customer.fullName);
      formDataToSend.append('customer[phone]', formData.customer.phone);
      formDataToSend.append('customer[whatsapp]', formData.customer.whatsapp);
      formDataToSend.append('customer[store_id]', formData.customer.storeId);
      formDataToSend.append('customer[address]', formData.customer.address);
      
      // Add order data
      formDataToSend.append('order[taken_by]', formData.orderTakenBy.masterId);
      formDataToSend.append('order[assigned_to]', formData.assignedTo.masterId);
      formDataToSend.append('order[taken_date]', formData.dates.takenDate);
      formDataToSend.append('order[delivery_date]', formData.dates.deliveryDate);
      formDataToSend.append('order[special_note]', formData.specialNote);
      formDataToSend.append('order[advance]', formData.advance);
      
      // Add particulars
      formData.particulars.forEach((particular, index) => {
        formDataToSend.append(`particulars[${index}][description]`, particular.description);
        formDataToSend.append(`particulars[${index}][price]`, particular.price);
        formDataToSend.append(`particulars[${index}][status]`, particular.status);
        
        // Add images for each particular
        particular.images.forEach((image, imgIndex) => {
          formDataToSend.append(`particulars[${index}][images][${imgIndex}]`, image.file);
        });
      });
      
      // Add measurements
      formDataToSend.append('measurements[L]', measurements.L);
      formDataToSend.append('measurements[SH]', measurements.SH);
      formDataToSend.append('measurements[ARM]', measurements.ARM);
      formDataToSend.append('measurements[UB]', measurements.UB);
      formDataToSend.append('measurements[MB]', measurements.MB);
      formDataToSend.append('measurements[W]', measurements.W);
      formDataToSend.append('measurements[POINT]', measurements.POINT);
      formDataToSend.append('measurements[FN]', measurements.FN);
      formDataToSend.append('measurements[BN]', measurements.BN);
      formDataToSend.append('measurements[HIP]', measurements.HIP);
      formDataToSend.append('measurements[SEAT]', measurements.SEAT);
      formDataToSend.append('measurements[THIGH]', measurements.THIGH);
      
      // Add SL measurements
      measurements.SL.forEach((sl, index) => {
        formDataToSend.append(`measurements[SL][${index}][L]`, sl.L);
        formDataToSend.append(`measurements[SL][${index}][W]`, sl.W);
        formDataToSend.append(`measurements[SL][${index}][A]`, sl.A);
      });
      
      // Add other measurements
      measurements.others.forEach((other, index) => {
        formDataToSend.append(`measurements[others][${index}][name]`, other.name);
        formDataToSend.append(`measurements[others][${index}][value]`, other.value);
      });

      const response = await axios.post(
        'http://localhost/login/public_html/api/orders/addCustomer.php',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Handle response
      if (response.data.success) {
        // Reset form on successful submission
        setFormData(initialFormData);
        setMeasurements(initialMeasurements);
        
        setSubmitStatus({
          loading: false,
          success: true,
          error: null,
          orderId: response.data.order_id
        });
      } else {
        setSubmitStatus({
          loading: false,
          success: false,
          error: response.data.message || 'Failed to submit order',
          orderId: null
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        orderId: null
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus(prev => ({ ...prev, error: null, success: false }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <img src={Slogo} alt="Logo" style={{ width: 120, marginBottom: 16 }} />
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <img src={Slogo} alt="Logo" style={{ width: 120, marginBottom: 16 }} />
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Reload Page
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      p: { xs: 1, sm: 2, md: 3 },
      height: '100%',
      minHeight: '100vh',
      backgroundColor: theme.palette.grey[100]
    }}>
      {/* Success Snackbar */}
      <Snackbar
        open={submitStatus.success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Order submitted successfully! Order ID: {submitStatus.orderId}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!submitStatus.error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {submitStatus.error}
        </Alert>
      </Snackbar>

      {/* Left Section - Order Form (2/3 width on desktop) */}
      <Paper sx={{
        flex: { xs: 1, md: 2 },
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        boxShadow: theme.shadows[2]
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}>
          <DescriptionIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            Order Details
          </Typography>
        </Box>

        {/* Order Information Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Order Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Store"
                value={formData.customer.storeId}
                onChange={(e) => handleChange('customer.storeId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              >
                {stores.map((store) => (
                  <MenuItem key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Order taken by (Master)"
                value={formData.orderTakenBy.masterId}
                onChange={(e) => handleChange('orderTakenBy.masterId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              >
                {masters.map((master) => (
                  <MenuItem key={master.id} value={master.id}>
                    {master.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Assign to (Master)"
                value={formData.assignedTo.masterId}
                onChange={(e) => handleChange('assignedTo.masterId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              >
                {masters.map((master) => (
                  <MenuItem key={master.id} value={master.id}>
                    {master.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Taken Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dates.takenDate}
                onChange={(e) => handleChange('dates.takenDate', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dates.deliveryDate}
                onChange={(e) => handleChange('dates.deliveryDate', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {/* Customer Details Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Customer Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.customer.fullName}
                onChange={(e) => handleChange('customer.fullName', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.customer.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  value={formData.customer.whatsapp}
                  onChange={(e) => handleChange('customer.whatsapp', e.target.value)}
                  disabled={formData.customer.whatsappSame}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsAppIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1, mr: 2 }}
                  required
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.customer.whatsappSame}
                      onChange={handleWhatsappToggle}
                      color="primary"
                    />
                  }
                  label="Same"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={formData.customer.address}
                onChange={(e) => handleChange('customer.address', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddressIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Grid>
          </Grid>
        </Box>

        {/* Particulars Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Particulars
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={addParticular}
              size="small"
            >
              Add Item
            </Button>
          </Box>
          
          {formData.particulars.map((particular, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, borderLeft: `3px solid ${theme.palette.primary.main}` }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={particular.description}
                    onChange={(e) => {
                      const updatedParticulars = [...formData.particulars];
                      updatedParticulars[index].description = e.target.value;
                      setFormData(prev => ({ ...prev, particulars: updatedParticulars }));
                    }}
                    required
                  />
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={particular.price}
                    onChange={(e) => {
                      const updatedParticulars = [...formData.particulars];
                      updatedParticulars[index].price = e.target.value;
                      setFormData(prev => ({ ...prev, particulars: updatedParticulars }));
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                </Grid>

                <Grid item xs={4} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={particular.status}
                    onChange={(e) => {
                      const updatedParticulars = [...formData.particulars];
                      updatedParticulars[index].status = e.target.value;
                      setFormData(prev => ({ ...prev, particulars: updatedParticulars }));
                    }}
                    required
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={2}>
                  {formData.particulars.length > 1 && (
                    <IconButton 
                      color="error" 
                      onClick={() => removeParticular(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id={`particular-images-${index}`}
                    type="file"
                    multiple
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                  />
                  <label htmlFor={`particular-images-${index}`}>
                    <Button variant="outlined" component="span" size="small" startIcon={<ImageIcon />}>
                      Upload Images
                    </Button>
                  </label>
                  
                  {particular.images.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                        Image Previews:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {particular.images.map((image) => (
                          <Box key={image.id} sx={{ position: 'relative' }}>
                            <Avatar
                              variant="rounded"
                              src={image.preview}
                              sx={{ width: 80, height: 80 }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                backgroundColor: theme.palette.error.main,
                                color: theme.palette.error.contrastText,
                                '&:hover': {
                                  backgroundColor: theme.palette.error.dark
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index, image.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>

        {/* Special Note */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Special Note
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={formData.specialNote}
            onChange={(e) => handleChange('specialNote', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteIcon color="action" sx={{ mt: -2 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Billing Section */}
        <Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Billing Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total"
                value={total}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Advance"
                type="number"
                value={formData.advance || ''}
                onChange={(e) => handleChange('advance', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Balance"
                value={balance}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Submit Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={submitStatus.loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={submitStatus.loading}
          >
            {submitStatus.loading ? 'Submitting...' : 'Submit Order'}
          </Button>
        </Box>
      </Paper>

      {/* Right Section - Measurements (1/3 width on desktop) */}
      <Paper sx={{
        flex: 1,
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        minWidth: { md: '300px' }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MeasurementsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Measurements
            </Typography>
          </Box>
          <Tooltip title="Add measurement">
            <IconButton color="primary" onClick={addOtherField}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {/* Column 1 - Left */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="L"
              value={measurements.L}
              onChange={(e) => handleMeasurementChange('L', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="ARM"
              value={measurements.ARM}
              onChange={(e) => handleMeasurementChange('ARM', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="UB"
              value={measurements.UB}
              onChange={(e) => handleMeasurementChange('UB', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="MB"
              value={measurements.MB}
              onChange={(e) => handleMeasurementChange('MB', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="FN"
              value={measurements.FN}
              onChange={(e) => handleMeasurementChange('FN', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="HIP"
              value={measurements.HIP}
              onChange={(e) => handleMeasurementChange('HIP', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* Column 2 - Right */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="SH"
              value={measurements.SH}
              onChange={(e) => handleMeasurementChange('SH', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="W"
              value={measurements.W}
              onChange={(e) => handleMeasurementChange('W', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="POINT"
              value={measurements.POINT}
              onChange={(e) => handleMeasurementChange('POINT', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="BN"
              value={measurements.BN}
              onChange={(e) => handleMeasurementChange('BN', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="SEAT"
              value={measurements.SEAT}
              onChange={(e) => handleMeasurementChange('SEAT', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="THIGH"
              value={measurements.THIGH}
              onChange={(e) => handleMeasurementChange('THIGH', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end">
                      <LengthIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Grid>
          
          {/* SL Measurements - Full width */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">SL Measurements</Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addSLField}
                size="small"
              >
                Add SL
              </Button>
            </Box>
            {measurements.SL.map((sl, index) => (
              <Box key={`sl-${index}`} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
                p: 1,
                backgroundColor: theme.palette.grey[100],
                borderRadius: 1
              }}>
                <TextField
                  label="L"
                  value={sl.L}
                  onChange={(e) => handleSLChange(index, 'L', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <LengthIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="W"
                  value={sl.W}
                  onChange={(e) => handleSLChange(index, 'W', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <LengthIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="A"
                  value={sl.A}
                  onChange={(e) => handleSLChange(index, 'A', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <LengthIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {measurements.SL.length > 1 && (
                  <IconButton 
                    onClick={() => removeSLField(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Grid>
          
          {/* Other Measurements - Full width */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Other Measurements</Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addOtherField}
                size="small"
              >
                Add Custom
              </Button>
            </Box>
            {measurements.others.map((other, index) => (
              <Box key={`other-${index}`} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
                p: 1,
                backgroundColor: theme.palette.grey[100],
                borderRadius: 1
              }}>
                <TextField
                  label="Name"
                  value={other.name}
                  onChange={(e) => handleOtherChange(index, 'name', e.target.value)}
                  size="small"
                />
                <TextField
                  label="Value"
                  value={other.value}
                  onChange={(e) => handleOtherChange(index, 'value', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" edge="end">
                          <LengthIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton 
                  onClick={() => removeOtherField(index)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default OrderFormWithMeasurements;