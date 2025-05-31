import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  CircularProgress,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  ShoppingBag as OrderIcon,
  Receipt as TransactionIcon,
  Timeline as StatusIcon,
  Straighten as MeasurementIcon,
  Photo as PhotoIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const CustomerView = () => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);

  const fetchCustomerData = async () => {
    if (!searchValue) {
      setError('Please enter a search value');
      setOpenError(true);
      return;
    }

    setLoading(true);
    setError('');
    setOpenError(false);
    try {
      const response = await axios.get(`http://localhost/login/public_html/api/orders/getCustomerData.php?${searchType}=${searchValue}`);
      if (response.data.success) {
        setCustomerData(response.data);
      } else {
        setError(response.data.message || 'Customer not found');
        setOpenError(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer data');
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatStatusText = (status) => {
    return status.replace('_', ' ');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Customer Details
      </Typography>

      {/* Search Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Select
              fullWidth
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              size="small"
            >
              <MenuItem value="phone">Phone Number</MenuItem>
              <MenuItem value="customer_id">Customer ID</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type={searchType === 'phone' ? 'tel' : 'number'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'phone' ? 'Enter phone number' : 'Enter customer ID'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchCustomerData}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      <Collapse in={openError}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpenError(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      </Collapse>

      {customerData && (
        <Box>
          {/* Customer Info Section */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              }
              title={<Typography variant="h6">Customer Information</Typography>}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {customerData.customer.full_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {customerData.customer.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1">
                    <strong>WhatsApp:</strong> {customerData.customer.whatsapp || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1">
                    <strong>Address:</strong> {customerData.customer.address || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body1">
                    <strong>Store:</strong> {customerData.customer.store_name || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Orders Section */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Order History ({customerData.orders.length})
          </Typography>

          {customerData.orders.map((order) => (
            <Accordion key={order.order_id} sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <OrderIcon color="action" sx={{ mr: 2 }} />
                  <Typography sx={{ flex: 1 }}>Order #{order.order_id}</Typography>
                  <Chip
                    label={formatStatusText(order.status)}
                    color={getStatusColor(order.status)}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* Order Basic Info */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Taken Date:</strong> {formatDate(order.taken_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Delivery Date:</strong> {formatDate(order.delivery_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Taken By:</strong> {order.taken_by_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Assigned To:</strong> {order.assigned_to_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Total:</strong> {formatCurrency(order.total_amount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Advance:</strong> {formatCurrency(order.advance)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">
                      <strong>Balance:</strong> {formatCurrency(order.balance_amount)}
                    </Typography>
                  </Grid>
                </Grid>

                {order.special_note && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <strong>Special Note:</strong> {order.special_note}
                  </Alert>
                )}

                {/* Order Particulars */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Items ({order.particulars.length})</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {order.particulars.map((item) => (
                        <Accordion key={item.particular_id} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography sx={{ flex: 1 }}>{item.description}</Typography>
                              <Typography sx={{ mr: 2 }}>{formatCurrency(item.price)}</Typography>
                              <Chip
                                label={formatStatusText(item.status)}
                                color={getStatusColor(item.status)}
                                size="small"
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            {item.images.length > 0 ? (
                              <ImageList cols={3} rowHeight={164} sx={{ mt: 1 }}>
                                {item.images.map((img, idx) => (
                                  <ImageListItem key={idx}>
                                    <img
                                      src={img}
                                      alt={`${item.description} reference`}
                                      loading="lazy"
                                    />
                                  </ImageListItem>
                                ))}
                              </ImageList>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No images available
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Measurements */}
                {order.measurements && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <MeasurementIcon color="action" sx={{ mr: 1 }} />
                        <Typography>Measurements</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {/* Standard Measurements */}
                        {Object.entries(order.measurements)
                          .filter(([key]) => !['measurement_id', 'order_id', 'SL', 'others'].includes(key))
                          .map(([key, value]) => (
                            <Grid item xs={6} sm={4} md={3} key={key}>
                              <Paper sx={{ p: 1 }} variant="outlined">
                                <Typography variant="body2">
                                  <strong>{key}:</strong> {value || 'N/A'}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                      </Grid>

                      {/* SL Measurements */}
                      {order.measurements.SL && Object.keys(order.measurements.SL).length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            SL Measurements
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.values(order.measurements.SL).map((sl, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={idx}>
                                <Paper sx={{ p: 2 }} variant="outlined">
                                  <Typography variant="body2">
                                    <strong>Position:</strong> {sl.position}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>L:</strong> {sl.L}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>W:</strong> {sl.W}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>A:</strong> {sl.A}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Custom Measurements */}
                      {order.measurements.others && order.measurements.others.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Custom Measurements
                          </Typography>
                          <Grid container spacing={2}>
                            {order.measurements.others.map((custom, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={idx}>
                                <Paper sx={{ p: 1 }} variant="outlined">
                                  <Typography variant="body2">
                                    <strong>{custom.name}:</strong> {custom.value}
                                  </Typography>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Status History */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StatusIcon color="action" sx={{ mr: 1 }} />
                      <Typography>Status History ({order.status_history.length})</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {order.status_history.map((status) => (
                        <ListItem key={status.status_history_id} alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                  {formatStatusText(status.status)}
                                </Typography>
                                <Typography variant="caption">
                                  {formatDateTime(status.change_date)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2">
                                  By: {status.master_name}
                                </Typography>
                                {status.notes && (
                                  <Typography variant="body2">
                                    Notes: {status.notes}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* Transactions */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TransactionIcon color="action" sx={{ mr: 1 }} />
                      <Typography>Transactions ({order.transactions.length})</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.transactions.map((txn) => (
                            <TableRow key={txn.transaction_id}>
                              <TableCell>{formatDateTime(txn.transaction_date)}</TableCell>
                              <TableCell align="right">{formatCurrency(txn.amount)}</TableCell>
                              <TableCell>{txn.payment_method}</TableCell>
                              <TableCell>{txn.notes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CustomerView;