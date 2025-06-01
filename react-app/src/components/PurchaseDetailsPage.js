import React, { useEffect, useState } from "react";
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
  Tooltip
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrdersById.php";
const IMAGE_BASE_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/uploads/orders/";

const EnhancedPurchaseLayout = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticular, setSelectedParticular] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL, { params: { order_id } });
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
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ textAlign: 'center', p: 4, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h5" color="error">Order Not Found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const labelStyle = {
    fontWeight: 'bold',
    fontSize: '0.875rem',
    color: 'text.secondary',
  };

  const valueStyle = {
    fontSize: '1rem',
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
        {/* Enhanced Header */}
        <Paper elevation={1} sx={{ 
          bgcolor: 'background.paper',
          px: isMobile ? 2 : 4,
          py: isMobile ? 2 : 3,
          mb: 2,
          borderBottom: `2px solid ${theme.palette.divider}`,
          borderRadius: 0
        }}>
          <Grid container spacing={2} alignItems="stretch">
            {isMobile && (
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Button 
                    onClick={() => navigate(-1)} 
                    variant="outlined"
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      borderColor: theme.palette.action.active,
                      color: theme.palette.text.primary
                    }}
                  >
                    Back
                  </Button>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Order Details
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Invoice and Status Section */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                height: '100%',
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  fontWeight="bold"
                  color="text.primary"
                  gutterBottom
                >
                  Invoice: {order.order.invoice}
                </Typography>
                <Chip
                  label={order.order.status}
                  color={getStatusColor(order.order.status)}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    px: 1
                  }}
                />
              </Paper>
            </Grid>

            {/* Customer Info Section */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                height: '100%',
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                borderLeft: `4px solid ${theme.palette.secondary.main}`
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  color="text.primary"
                  gutterBottom
                >
                  Customer: {order.customer.fullName}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  Delivery: <strong>{order.dates.deliveryDate}</strong>
                </Typography>
              </Paper>
            </Grid>

            {/* Assignment Section */}
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ 
                height: '100%',
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                borderLeft: `4px solid ${theme.palette.info.main}`
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600}
                  color="text.primary"
                  gutterBottom
                >
                  Assigned: {order.assignedTo?.name || 'Unassigned'}
                </Typography>
                <Tooltip title={order.specialNote || 'No special notes'} arrow>
                  <Typography 
                    variant="body2" 
                    noWrap 
                    sx={{ 
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}
                  >
                    Notes: {order.specialNote || 'None'}
                  </Typography>
                </Tooltip>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 2, 
          p: isMobile ? 1 : 2
        }}>
          {/* Order Items Card */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '30%' : '25%',
            mb: isMobile ? 2 : 0
          }}>
            <Card sx={{ 
              height: isMobile ? 'auto' : '100%', 
              borderRadius: 2,
              boxShadow: 3
            }}>
              <CardHeader 
                title="Order Items" 
                titleTypographyProps={{ 
                  variant: isMobile ? 'subtitle1' : 'h6',
                  color: 'primary'
                }}
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {order.particulars.map((p) => (
                    <React.Fragment key={p.particular_id}>
                      <ListItem
                        button
                        selected={selectedParticular?.particular_id === p.particular_id}
                        onClick={() => setSelectedParticular(p)}
                        sx={{ 
                          alignItems: 'flex-start', 
                          py: 1.5,
                          '&.Mui-selected': {
                            bgcolor: theme.palette.action.selected
                          },
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={500}>
                              {p.description}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2">₹{p.price}</Typography>
                              <Chip
                                label={p.status}
                                size="small"
                                color={getStatusColor(p.status)}
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Product Images Card */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '40%' : '50%',
            mb: isMobile ? 2 : 0
          }}>
            <Card sx={{ 
              height: isMobile ? 'auto' : '100%', 
              borderRadius: 2,
              boxShadow: 3
            }}>
              <CardHeader
                title="Product Images"
                subheader={selectedParticular?.description}
                titleTypographyProps={{ 
                  variant: isMobile ? 'subtitle1' : 'h6',
                  color: 'primary'
                }}
                subheaderTypographyProps={{ 
                  variant: isMobile ? 'body2' : 'body1',
                  color: 'text.secondary'
                }}
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
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
                            height: isMobile ? 200 : 300,
                            objectFit: 'cover',
                            borderRadius: 1,
                            boxShadow: 2,
                            border: `1px solid ${theme.palette.divider}`
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
                    height: isMobile ? 200 : 300,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    border: `1px dashed ${theme.palette.divider}`
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      No images available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Measurements Card */}
          <Box sx={{ 
            width: isMobile ? '100%' : isTablet ? '30%' : '25%'
          }}>
            <Card sx={{ 
              height: isMobile ? 'auto' : '100%', 
              borderRadius: 2,
              boxShadow: 3,
              overflowY: 'auto'
            }}>
              <CardHeader 
                title="Measurements" 
                titleTypographyProps={{ 
                  variant: isMobile ? 'subtitle1' : 'h6',
                  color: 'primary'
                }}
                sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
              />
              <CardContent sx={{ px: isMobile ? 1 : 2 }}>
                {order.measurements ? (
                  <>
                    {/* Standard Measurements Table */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ 
                        mb: 1.5, 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        Standard Measurements
                      </Typography>
                      <Box component="table" sx={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        mb: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <Box component="thead">
                          <Box component="tr" sx={{ 
                            bgcolor: 'background.default',
                          }}>
                            <Box component="th" sx={{ 
                              p: 1.5, 
                              textAlign: 'left',
                              fontWeight: 'bold',
                              color: 'text.secondary',
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}>Measurement</Box>
                            <Box component="th" sx={{ 
                              p: 1.5, 
                              textAlign: 'right',
                              fontWeight: 'bold',
                              color: 'text.secondary',
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}>Value</Box>
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {Object.entries(order.measurements)
                            .filter(([key]) => key !== 'SL' && key !== 'others')
                            .map(([key, value]) => (
                              <Box component="tr" key={key} sx={{ 
                                '&:not(:last-child)': {
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }
                              }}>
                                <Box component="td" sx={{ 
                                  p: 1.5, 
                                  fontWeight: 500,
                                  color: 'text.primary'
                                }}>{key}</Box>
                                <Box component="td" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'right',
                                  color: 'text.primary'
                                }}>{value}</Box>
                              </Box>
                            ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Sleeve Measurements Tables */}
                    {order.measurements.SL && (
                      <>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 1.5, 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}>
                          Sleeve Measurements
                        </Typography>
                        
                        {/* Left Sleeve */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" sx={{ 
                            mb: 1, 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}>Left Sleeve</Typography>
                          <Box component="table" sx={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            mb: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}>
                            <Box component="thead">
                              <Box component="tr" sx={{ 
                                bgcolor: 'background.default',
                              }}>
                                <Box component="th" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'left',
                                  fontWeight: 'bold',
                                  color: 'text.secondary',
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }}>Measurement</Box>
                                <Box component="th" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'right',
                                  fontWeight: 'bold',
                                  color: 'text.secondary',
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }}>Value</Box>
                              </Box>
                            </Box>
                            <Box component="tbody">
                              {order.measurements.SL[0] && Object.entries(order.measurements.SL[0]).map(([key, value]) => (
                                <Box component="tr" key={key} sx={{ 
                                  '&:not(:last-child)': {
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                  }
                                }}>
                                  <Box component="td" sx={{ 
                                    p: 1.5, 
                                    fontWeight: 500,
                                    color: 'text.primary'
                                  }}>{key}</Box>
                                  <Box component="td" sx={{ 
                                    p: 1.5, 
                                    textAlign: 'right',
                                    color: 'text.primary'
                                  }}>{value}</Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Right Sleeve */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" sx={{ 
                            mb: 1, 
                            fontWeight: 500,
                            color: 'text.primary'
                          }}>Right Sleeve</Typography>
                          <Box component="table" sx={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            mb: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}>
                            <Box component="thead">
                              <Box component="tr" sx={{ 
                                bgcolor: 'background.default',
                              }}>
                                <Box component="th" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'left',
                                  fontWeight: 'bold',
                                  color: 'text.secondary',
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }}>Measurement</Box>
                                <Box component="th" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'right',
                                  fontWeight: 'bold',
                                  color: 'text.secondary',
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }}>Value</Box>
                              </Box>
                            </Box>
                            <Box component="tbody">
                              {order.measurements.SL[1] && Object.entries(order.measurements.SL[1]).map(([key, value]) => (
                                <Box component="tr" key={key} sx={{ 
                                  '&:not(:last-child)': {
                                    borderBottom: `1px solid ${theme.palette.divider}`
                                  }
                                }}>
                                  <Box component="td" sx={{ 
                                    p: 1.5, 
                                    fontWeight: 500,
                                    color: 'text.primary'
                                  }}>{key}</Box>
                                  <Box component="td" sx={{ 
                                    p: 1.5, 
                                    textAlign: 'right',
                                    color: 'text.primary'
                                  }}>{value}</Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </>
                    )}

                    {/* Additional Measurements */}
                    {order.measurements.others?.length > 0 && (
                      <>
                        <Typography variant="subtitle2" sx={{ 
                          mb: 1.5, 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}>
                          Additional Measurements
                        </Typography>
                        <Box component="table" sx={{ 
                          width: '100%', 
                          borderCollapse: 'collapse',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}>
                          <Box component="thead">
                            <Box component="tr" sx={{ 
                              bgcolor: 'background.default',
                            }}>
                              <Box component="th" sx={{ 
                                p: 1.5, 
                                textAlign: 'left',
                                fontWeight: 'bold',
                                color: 'text.secondary',
                                borderBottom: `1px solid ${theme.palette.divider}`
                              }}>Name</Box>
                              <Box component="th" sx={{ 
                                p: 1.5, 
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: 'text.secondary',
                                borderBottom: `1px solid ${theme.palette.divider}`
                              }}>Value</Box>
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {order.measurements.others.map((item, idx) => (
                              <Box component="tr" key={idx} sx={{ 
                                '&:not(:last-child)': {
                                  borderBottom: `1px solid ${theme.palette.divider}`
                                }
                              }}>
                                <Box component="td" sx={{ 
                                  p: 1.5, 
                                  fontWeight: 500,
                                  color: 'text.primary'
                                }}>{item.name}</Box>
                                <Box component="td" sx={{ 
                                  p: 1.5, 
                                  textAlign: 'right',
                                  color: 'text.primary'
                                }}>{item.value}</Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <Typography>No measurements available.</Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EnhancedPurchaseLayout;