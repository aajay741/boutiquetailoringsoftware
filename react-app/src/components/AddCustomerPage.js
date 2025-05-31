import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  InputAdornment,
  CircularProgress,
  Card,
  Divider,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Event as EventIcon,
  WhatsApp as WhatsAppIcon,
  Store as StoreIcon,
  Straighten as StraightenIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const CustomerForm = ({ onSubmit, loading, stores }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const defaultMeasurement = {
    name: 'Primary',
    length: '',
    shoulder: '',
    arm: '',
    left_sleeve_length: '',
    left_sleeve_width: '',
    left_sleeve_arms: '',
    right_sleeve_length: '',
    right_sleeve_width: '',
    right_sleeve_arms: '',
    upper_body: '',
    middle_body: '',
    waist: '',
    dot_point: '',
    top_length: '',
    pant_length: '',
    hip: '',
    seat: '',
    thigh: '',
    maxi_length: '',
    maxi_height: '',
    skirt_length: '',
    skirt_height: '',
    others: ''
  };

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    dob: '',
    address: '',
    store_id: '',
    measurements: [defaultMeasurement]
  });

  const [errors, setErrors] = useState({});
  const [expandedMeasurements, setExpandedMeasurements] = useState([0]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMeasurementChange = (e, index) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updatedMeasurements = [...prev.measurements];
      updatedMeasurements[index] = {
        ...updatedMeasurements[index],
        [name]: value
      };
      return {
        ...prev,
        measurements: updatedMeasurements
      };
    });
  };

  const addNewMeasurementSet = () => {
    const newIndex = form.measurements.length;
    setForm(prev => ({
      ...prev,
      measurements: [
        ...prev.measurements,
        {
          ...defaultMeasurement,
          name: `Measurement ${newIndex + 1}`
        }
      ]
    }));
    setExpandedMeasurements(prev => [...prev, newIndex]);
  };

  const removeMeasurementSet = (index) => {
    if (form.measurements.length <= 1) return;
    
    setForm(prev => {
      const updatedMeasurements = [...prev.measurements];
      updatedMeasurements.splice(index, 1);
      return {
        ...prev,
        measurements: updatedMeasurements
      };
    });
    
    setExpandedMeasurements(prev => 
      prev.filter(i => i !== index).map(i => i > index ? i - 1 : i)
    );
  };

  const toggleMeasurementExpanded = (index) => {
    setExpandedMeasurements(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.phone) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10,15}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    if (form.whatsapp && !/^[0-9]{10,15}$/.test(form.whatsapp)) {
      newErrors.whatsapp = 'Invalid WhatsApp number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    form.measurements.forEach((m, i) => {
      if (!m.name) {
        newErrors[`measurement_${i}_name`] = 'Measurement name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(form);
      // Reset form after submission
      setForm({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        dob: '',
        address: '',
        store_id: '',
        measurements: [defaultMeasurement]
      });
      setExpandedMeasurements([0]);
    }
  };

  return (
    <Card sx={{ 
      mb: 3, 
      p: isMobile ? 2 : 3,
      borderRadius: 2,
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Add New Customer
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer Name *"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color={errors.name ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color={errors.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Phone Number *"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color={errors.phone ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              error={!!errors.whatsapp}
              helperText={errors.whatsapp}
              margin="normal"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WhatsAppIcon color={errors.whatsapp ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Store Name"
                name="store_id"
                value={form.store_id}
                onChange={handleChange}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.store_id} value={store.store_id}>
                    {store.store_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                variant="outlined"
                size="small"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Grid>
          
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Measurements
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addNewMeasurementSet}
            size="small"
            sx={{
              borderRadius: 1,
            }}
          >
            Add Set
          </Button>
        </Box>
        
        {form.measurements?.map((measurement, index) => (
          <Accordion 
            key={index} 
            expanded={expandedMeasurements.includes(index)}
            onChange={() => toggleMeasurementExpanded(index)}
            sx={{ 
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              boxShadow: 'none',
              '&:before': {
                display: 'none'
              },
              '&:hover': {
                backgroundColor: 'transparent'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: expandedMeasurements.includes(index) 
                  ? theme.palette.grey[100] 
                  : 'transparent',
                borderBottom: expandedMeasurements.includes(index) 
                  ? '1px solid' 
                  : 'none',
                borderColor: 'divider',
                borderRadius: 1,
                minHeight: '48px !important',
                '&:hover': {
                  minHeight: '48px !important',
                  backgroundColor: expandedMeasurements.includes(index) 
                    ? theme.palette.grey[100] 
                    : 'transparent'
                },
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                  '&:hover': {
                    margin: '12px 0'
                  }
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flex: 1,
                gap: 2
              }}>
                <TextField
                  label="Measurement Name *"
                  name="name"
                  value={measurement.name}
                  onChange={(e) => handleMeasurementChange(e, index)}
                  variant="standard"
                  size="small"
                  sx={{ 
                    minWidth: 200,
                    '& .MuiInput-root:before': { borderBottom: 'none' },
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      '&:hover': {
                        backgroundColor: 'transparent'
                      }
                    }
                  }}
                  error={!!errors[`measurement_${index}_name`]}
                  helperText={errors[`measurement_${index}_name`]}
                />
                {form.measurements.length > 1 && (
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMeasurementSet(index);
                    }}
                    size="small"
                    color="error"
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.error.light
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Basic Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Length"
                    name="length"
                    value={measurement.length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Shoulder"
                    name="shoulder"
                    value={measurement.shoulder}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Arm"
                    name="arm"
                    value={measurement.arm}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Left Sleeve Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Left Sleeve Length"
                    name="left_sleeve_length"
                    value={measurement.left_sleeve_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Left Sleeve Width"
                    name="left_sleeve_width"
                    value={measurement.left_sleeve_width}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Left Sleeve Arms"
                    name="left_sleeve_arms"
                    value={measurement.left_sleeve_arms}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Right Sleeve Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Right Sleeve Length"
                    name="right_sleeve_length"
                    value={measurement.right_sleeve_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Right Sleeve Width"
                    name="right_sleeve_width"
                    value={measurement.right_sleeve_width}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Right Sleeve Arms"
                    name="right_sleeve_arms"
                    value={measurement.right_sleeve_arms}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Body Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Upper Body"
                    name="upper_body"
                    value={measurement.upper_body}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Middle Body"
                    name="middle_body"
                    value={measurement.middle_body}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Waist"
                    name="waist"
                    value={measurement.waist}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Dot Point"
                    name="dot_point"
                    value={measurement.dot_point}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Length Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Top Length"
                    name="top_length"
                    value={measurement.top_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Pant Length"
                    name="pant_length"
                    value={measurement.pant_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Maxi Length"
                    name="maxi_length"
                    value={measurement.maxi_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Maxi Height"
                    name="maxi_height"
                    value={measurement.maxi_height}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Lower Body Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Hip"
                    name="hip"
                    value={measurement.hip}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Seat"
                    name="seat"
                    value={measurement.seat}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Thigh"
                    name="thigh"
                    value={measurement.thigh}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Skirt Measurements */}
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Skirt Length"
                    name="skirt_length"
                    value={measurement.skirt_length}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Skirt Height"
                    name="skirt_height"
                    value={measurement.skirt_height}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                {/* Others */}
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    label="Others"
                    name="others"
                    value={measurement.others}
                    onChange={(e) => handleMeasurementChange(e, index)}
                    margin="dense"
                    variant="outlined"
                    size="small"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button 
            type="reset" 
            variant="outlined" 
            disabled={loading}
            size="small"
            onClick={() => {
              setForm({
                name: '',
                email: '',
                phone: '',
                whatsapp: '',
                dob: '',
                address: '',
                store_id: '',
                measurements: [defaultMeasurement]
              });
              setExpandedMeasurements([0]);
            }}
          >
            Clear Form
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            size="small"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Adding...' : 'Add Customer'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

const CustomerManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'success', open: false });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/login/public_html/api/stores/getStores.php');
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

  const handleSubmitCustomer = async (customerData) => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost/login/public_html/api/orders/addCustomer.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create customer');
      }

      if (result.success) {
        setMessage({
          text: result.message || 'Customer created successfully!',
          severity: 'success',
          open: true
        });
      } else {
        throw new Error(result.message || 'Failed to create customer');
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Error creating customer',
        severity: 'error',
        open: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: isMobile ? 2 : 3,
      maxWidth: '100%',
      overflowX: 'auto',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <Box sx={{ 
        maxWidth: 1200,
        mx: 'auto',
        width: '100%'
      }}>
        <Typography variant="h5" component="h1" sx={{ 
          fontWeight: 600,
          mb: 3,
          color: theme.palette.primary.main
        }}>
          Add New Customer
        </Typography>

        {message.open && (
          <Alert 
            severity={message.severity} 
            sx={{ 
              mb: 3,
              borderRadius: 1
            }} 
            onClose={() => setMessage(prev => ({ ...prev, open: false }))}
          >
            {message.text}
          </Alert>
        )}

        <CustomerForm
          onSubmit={handleSubmitCustomer}
          loading={loading}
          stores={stores}
        />
      </Box>
    </Box>
  );
};

export default CustomerManagement;

