import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  CssBaseline,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  Tooltip,
  Avatar,
  Stack,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  ListItemIcon
} from "@mui/material";
import {
  Email as EmailIcon,
  LocalShipping as ShippingIcon,
  Notes as NotesIcon,
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  CalendarToday as DateIcon,
  AttachMoney as PriceIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  LocalOffer as DiscountIcon,
  Save as SaveIcon
} from "@mui/icons-material";

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrdersById.php";
const UPDATE_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/updateParticulars.php";
const IMAGE_BASE_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/uploads/orders/";

const statusIcons = {
  completed: <CompletedIcon color="success" fontSize="small" />,
  pending: <PendingIcon color="warning" fontSize="small" />,
  cancelled: <CancelledIcon color="error" fontSize="small" />,
  delivered: <ShippingIcon color="primary" fontSize="small" />
};

const PurchaseDetailsPage = ({ role, userId }) => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticular, setSelectedParticular] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isAdmin = role === 'admin';


  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL, { params: { order_id } });
        console.log("Fetching order with ID:", res.data.order);

        setOrder(res.data.order || null);
        if (res.data.order?.particulars?.length > 0) {
          setSelectedParticular(res.data.order.particulars[0]);
        }
      } catch (err) {
        console.error("Error fetching order:", err.response ? err.response.data : err);
        setOrder(null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [order_id]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'delivered': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePriceChange = (particularId, newPrice) => {
    if (!isAdmin) return;
    
    setOrder(prev => ({
      ...prev,
      particulars: prev.particulars.map(p => 
        p.particular_id === particularId ? { ...p, price: newPrice } : p
      )
    }));
  };

  const handleStatusChange = (particularId, newStatus) => {
    setOrder(prev => ({
      ...prev,
      particulars: prev.particulars.map(p => 
        p.particular_id === particularId ? { ...p, status: newStatus } : p
      )
    }));
  };

  const handleSaveChanges = async (particularId) => {
    setSaveLoading(true);
    try {
      const particular = order.particulars.find(p => p.particular_id === particularId);
      const response = await axios.post(UPDATE_URL, {
        particular_id: particularId,
        price: particular.price,
        status: particular.status
      });
      
      if (response.data.success) {
        setEditing(null);
      }
    } catch (error) {
      console.error("Error updating particular:", error);
    }
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 4, 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Order Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The order you're looking for doesn't exist or may have been removed.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)}
          startIcon={<BackIcon />}
          sx={{ 
            mt: 2,
            borderRadius: '8px',
            px: 4,
            py: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textTransform: 'none'
          }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #FFFFFFFF 100%)'
      }}>
        {/* Header with Back Button */}
        <Box sx={{ p: isMobile ? 1 : 2, pb: 1 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.primary.main
              }
            }}
          >
            Back to Orders
          </Button>
        </Box>

        {/* Order Header Section */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mx: isMobile ? 2 : 4,
          mt: 0,
          mb: 3
        }}>
          <Paper sx={{
            p: 3,
            width: '100%',
            maxWidth: '1200px',
            borderRadius: '12px',
          background: theme.palette.background.paper,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: `1px solid ${theme.palette.divider}`,
          }}>
            <Grid container spacing={3} alignItems="center" justifyContent="center">
              
              {/* Invoice */}
              <Grid item xs={12} md={3} sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  color: '#1a365d',
                  letterSpacing: '-0.5px'
                }}>
                  {order.order.invoice}
                </Typography>
              </Grid>

              {/* Customer */}
              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} sx={{ 
                  color: '#1e293b',
                  mb: 0.5
                }}>
                  {order.customer.fullName}
                </Typography>
              
              </Grid>


              {/* Dates */}
              <Grid item xs={6} md={2} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}>
                  Address
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b',
                  fontWeight: 500
                }}>
                  {order.customer.address || 'No address'}
                </Typography>
              </Grid>

              {/* Dates */}
              <Grid item xs={6} md={2} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}>
                  ORDER DATE
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b',
                  fontWeight: 500
                }}>
                  {formatDate(order.order.taken_date)}
                </Typography>
              </Grid>

              <Grid item xs={6} md={2} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}>
                  DELIVERY DATE
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b',
                  fontWeight: 500
                }}>
                  {formatDate(order.order.delivery_date)}
                </Typography>
              </Grid>

              {/* Special Note */}
              <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ 
                  color: '#64748b',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}>
                  SPECIAL NOTE
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: '#1e293b',
                  fontWeight: 500,
                  fontStyle: order.order.special_note ? 'normal' : 'italic'
                }}>
                  {order.order.special_note || 'None'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 3, 
          px: isMobile ? 1 : 3,
          pb: 3
        }}>
          {/* Left Column - Order Items */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '30%' : '25%',
            mb: isMobile ? 2 : 0
          }}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardHeader 
                title="Order Items" 
                titleTypographyProps={{ 
                  variant: 'subtitle1',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.grey[50]
                }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense disablePadding>
                  {order.particulars.map((p) => (
                    <React.Fragment key={p.particular_id}>
                      <ListItem
                        button
                        selected={selectedParticular?.particular_id === p.particular_id}
                        onClick={() => setSelectedParticular(p)}
                        sx={{ 
                          alignItems: 'flex-start', 
                          py: 2,
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.action.selected,
                            '&:hover': {
                              backgroundColor: theme.palette.action.selected
                            }
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={600}>
                              {p.description}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {/* Editable Price Field */}
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Price:
                                </Typography>
                                <Tooltip title={isAdmin ? "Click to edit price" : "Only admins can edit prices"}>
                                  <TextField
                                    variant="standard"
                                    size="small"
                                    value={p.price}
                                    onChange={(e) => handlePriceChange(p.particular_id, e.target.value)}
                                    disabled={!isAdmin}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <PriceIcon fontSize="small" />
                                        </InputAdornment>
                                      ),
                                      sx: {
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        maxWidth: '80px',
                                        '& input': {
                                          textAlign: 'right',
                                          paddingBottom: '4px'
                                        }
                                      }
                                    }}
                                    sx={{
                                      '& .MuiInput-underline:before': { borderBottomColor: 'transparent' },
                                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                        borderBottomColor: isAdmin ? theme.palette.primary.light : 'transparent'
                                      },
                                      '& .MuiInput-underline:after': {
                                        borderBottomColor: isAdmin ? theme.palette.primary.main : 'transparent'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              </Stack>
                              
                              {/* Editable Status Dropdown */}
                              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="text.secondary">
                                    Status:
                                  </Typography>
                                  <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                                    <Select
                                      value={p.status.toLowerCase()}
                                      onChange={(e) => handleStatusChange(p.particular_id, e.target.value)}
                                      sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        '& .MuiSelect-select': {
                                          paddingBottom: '4px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        },
                                        '&:before': { borderBottomColor: 'transparent' },
                                        '&:hover:not(.Mui-disabled):before': {
                                          borderBottomColor: theme.palette.primary.light
                                        },
                                        '&:after': {
                                          borderBottomColor: theme.palette.primary.main
                                        }
                                      }}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          {statusIcons[selected]}
                                          <span>{selected.charAt(0).toUpperCase() + selected.slice(1)}</span>
                                        </Box>
                                      )}
                                    >
                                      {Object.entries(statusIcons).map(([status, icon]) => (
                                        <MenuItem 
                                          key={status} 
                                          value={status}
                                          sx={{ fontSize: '0.8rem' }}
                                        >
                                          <ListItemIcon sx={{ minWidth: 36 }}>
                                            {icon}
                                          </ListItemIcon>
                                          <ListItemText 
                                            primary={status.charAt(0).toUpperCase() + status.slice(1)} 
                                          />
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Stack>
                                <Tooltip title="Save changes">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleSaveChanges(p.particular_id)}
                                    disabled={saveLoading}
                                    sx={{
                                      backgroundColor: theme.palette.success.light,
                                      '&:hover': {
                                        backgroundColor: theme.palette.success.main,
                                        color: 'white'
                                      }
                                    }}
                                  >
                                    {saveLoading && editing === p.particular_id ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <SaveIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider sx={{ mx: 2 }} />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Middle Column - Product Images */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '40%' : '50%',
            mb: isMobile ? 2 : 0
          }}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardHeader
                title="Product Details"
                subheader={selectedParticular?.description}
                titleTypographyProps={{ 
                  variant: 'subtitle1',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
                subheaderTypographyProps={{ 
                  variant: 'body2',
                  color: 'text.secondary'
                }}
                action={
                  <Chip
                    label={`₹${selectedParticular?.price || '0.00'}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                }
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.grey[50]
                }}
              />
              <CardContent>
                {selectedParticular?.images?.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedParticular.images.map((img, i) => (
                      <Grid item xs={12} key={i}>
                        <Box
                          component="img"
                          src={img.startsWith('http') ? img : IMAGE_BASE_URL + img}
                          alt={`Product ${i}`}
                          sx={{
                            width: '100%',
                            height: isMobile ? 240 : 320,
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: isMobile ? 240 : 320,
                    bgcolor: theme.palette.grey[50],
                    borderRadius: 2,
                    border: `1px dashed ${theme.palette.divider}`,
                    p: 3,
                    textAlign: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <NotesIcon color="disabled" fontSize="large" />
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      No images available for this item
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Upload reference images for better tracking
                    </Typography>
                  </Box>
                )}
                
                {/* Notes Section */}
                {selectedParticular?.notes && (
                  <Paper elevation={0} sx={{ 
                    mt: 3, 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: theme.palette.warning.light,
                    borderLeft: `4px solid ${theme.palette.warning.main}`
                  }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      color: theme.palette.warning.dark,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}>
                      <NotesIcon fontSize="small" /> Special Instructions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedParticular.notes}
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Right Column - Measurements */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '30%' : '25%'
          }}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader 
                title="Measurements" 
                titleTypographyProps={{ 
                  variant: 'subtitle1',
                  fontWeight: 600,
                  color: 'text.primary'
                }}
                sx={{ 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.grey[50]
                }}
              />
              <CardContent sx={{ 
                flex: 1, 
                overflowY: 'auto',
                px: isMobile ? 1 : 2, 
                pt: 2 
              }}>
                {order.measurements ? (
                  <>
                    {/* Standard Measurements */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        mb: 1.5, 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        Standard Measurements
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(order.measurements)
                          .filter(([key]) => key !== 'SL' && key !== 'others')
                          .map(([key, value]) => (
                            <Grid item xs={6} key={key}>
                              <Paper elevation={0} sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  borderColor: theme.palette.primary.light,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }
                              }}>
                                <Typography variant="caption" sx={{
                                  display: 'block',
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                  mb: 0.5,
                                  fontSize: '0.7rem'
                                }}>
                                  {key}
                                </Typography>
                                <Typography variant="body1" sx={{
                                  fontWeight: 600,
                                  color: 'text.primary',
                                  fontSize: '0.9rem'
                                }}>
                                  {value} {key.toLowerCase().includes('length') ? 'cm' : ''}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>

                    {/* Sleeve Measurements */}
                    {order.measurements.SL && (
                      <>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 1.5, 
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          Sleeve Measurements
                        </Typography>
                        
                        {Array.isArray(order.measurements.SL) && order.measurements.SL.map((sleeveData, index) => (
                          <Box sx={{ mb: 3 }} key={index}>
                         
                            <Grid container spacing={2}>
                              {sleeveData && Object.entries(sleeveData).map(([key, value]) => (
                                <Grid item xs={6} key={key}>
                                  <Paper elevation={0} sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                    height: '100%'
                                  }}>
                                    <Typography variant="caption" sx={{
                                      display: 'block',
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                      mb: 0.5,
                                      fontSize: '0.7rem'
                                    }}>
                                      {key}
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                      fontWeight: 600,
                                      color: 'text.primary',
                                      fontSize: '0.9rem'
                                    }}>
                                      {value} cm
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Additional Measurements */}
                    {order.measurements.others?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 1.5, 
                          color: 'text.secondary',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          Additional Notes
                        </Typography>
                        <Grid container spacing={2}>
                          {order.measurements.others.map((item, idx) => (
                            <Grid item xs={12} key={idx}>
                              <Paper elevation={0} sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor: theme.palette.grey[50]
                              }}>
                                <Typography variant="caption" sx={{
                                  display: 'block',
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                  mb: 0.5,
                                  fontSize: '0.7rem'
                                }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="body2" sx={{
                                  color: 'text.primary'
                                }}>
                                  {item.value}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </>
                ) : (
                  <Paper elevation={0} sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      <NotesIcon color="disabled" fontSize="large" />
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      No measurements recorded
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 2, borderRadius: 2 }}
                    >
                      Add Measurements
                    </Button>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PurchaseDetailsPage;