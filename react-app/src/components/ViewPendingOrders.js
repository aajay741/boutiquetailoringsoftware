import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, CircularProgress, Typography, Box, useMediaQuery, MenuItem, Stack, Container, Grid,
  Card, CardContent, InputAdornment, Pagination, Chip, Avatar, IconButton, Tooltip, Divider, Badge
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Phone';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { lighten } from '@mui/material/styles';

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrders.php";

const ViewPendingOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [takenDate, setTakenDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [store, setStore] = useState("");
  const [stores, setStores] = useState([]);
  const [invoice, setInvoice] = useState("");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tailors, setTailors] = useState([]);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get('http://localhost/boutiquetailoringsoftware/public_html/api/stores/getStores.php');
        setStores([
          { id: "", name: "All Stores" },
          ...(res.data.stores || []).map(store => ({
            id: store.store_id,
            name: store.store_name
          }))
        ]);
      } catch (err) {
        setStores([{ id: "", name: "All Stores" }]);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        const res = await axios.get('http://localhost/boutiquetailoringsoftware/public_html/api/getUsers.php');
        setTailors((res.data.users || []));
      } catch (err) {
        setTailors([]);
      }
    };
    fetchTailors();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        customer_name: customerName,
        phone,
        taken_date: takenDate,
        delivery_date: deliveryDate,
        store,
        invoice,
        status: statusFilter !== "all" ? statusFilter : undefined,
        pendingstatus: 1 
      };
      const res = await axios.get(API_URL, { params });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      setOrders([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleClear = () => {
    setCustomerName("");
    setPhone("");
    setTakenDate("");
    setDeliveryDate("");
    setStore("");
    setInvoice("");
    setStatusFilter("all");
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'delivered': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { 
      label: "Invoice", 
      key: "invoice",
      width: "12%",
      mobile: true
    },
    { 
      label: "Customer", 
      key: "customer",
      width: "20%",
      mobile: true
    },
    { 
      label: "Phone", 
      key: "phone",
      width: "12%",
      mobile: true
    },
    { 
      label: "Store", 
      key: "store",
      width: "15%",
      mobile: true
    },
    { 
      label: "Status", 
      key: "status",
      width: "10%",
      mobile: false
    },
    { 
      label: "Master", 
      key: "assigned_to",
      width: "15%",
      mobile: false
    },
    { 
      label: "Taken", 
      key: "taken_date",
      width: "13%",
      mobile: false
    },
    { 
      label: "Delivery", 
      key: "delivery_date",
      width: "13%",
      mobile: false
    }
  ];

  const visibleColumns = isMobile
    ? columns.filter(col => col.mobile)
    : columns;

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Purchase Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {orders.length > 0 ? `Showing ${orders.length} orders` : 'Manage all customer orders'}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>

          {isMobile && (
            <Tooltip title="Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <Badge 
                  badgeContent={
                    [customerName, phone, takenDate, deliveryDate, store, invoice, statusFilter !== 'all'].filter(Boolean).length
                  } 
                  color="primary"
                >
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Customer Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <TextField
                  label="Phone"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <TextField
                  label="Invoice #"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={invoice}
                  onChange={e => setInvoice(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  select
                  label="Store"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={store}
                  onChange={e => setStore(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {stores.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={2}>
                <TextField
                  select
                  label="Status"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Taken After"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={takenDate}
                  onChange={e => setTakenDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label="Delivery Before"
                  type="date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleClear}
                    startIcon={<ClearIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                    sx={{ minWidth: 120 }}
                  >
                    Apply
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme.palette.mode === 'light' 
                  ? lighten(theme.palette.primary.light, 0.9)
                  : theme.palette.background.paper
              }}>
                {visibleColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: col.width,
                      py: 2,
                      borderBottom: 'none'
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell sx={{ width: 40, borderBottom: 'none' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ mt: 2 }}>Loading orders...</Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} align="center" sx={{ py: 6 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <ReceiptIcon fontSize="large" color="disabled" />
                      <Typography variant="body1" color="text.secondary">
                        No orders found matching your criteria
                      </Typography>
                      <Button 
                        variant="text" 
                        onClick={handleClear}
                        sx={{ mt: 2 }}
                      >
                        Clear filters
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.order_id}
                    hover
                    sx={{ 
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light'
                          ? lighten(theme.palette.primary.light, 0.95)
                          : theme.palette.action.hover
                      }
                    }}
                  >
                    {visibleColumns.map((col) => {
                      if (col.key === "invoice") {
                        return (
                          <TableCell key={col.key} sx={{ py: 2 }}>
                            <Typography
                              onClick={() => navigate(`/purchase/${order.order_id}`)}
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              #{order[col.key]}
                            </Typography>
                          </TableCell>
                        );
                      }
                      if (col.key === "customer") {
                        return (
                          <TableCell key={col.key} sx={{ py: 2 }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ 
                                width: 34, 
                                height: 34, 
                                fontSize: 14,
                                bgcolor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText
                              }}>
                                {order.customer?.fullName?.charAt(0) || 'C'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" lineHeight={1.2}>
                                  {order.customer?.fullName || order.customer_name || "N/A"}
                                </Typography>
                                {!isMobile && (
                                  <Typography variant="caption" color="text.secondary">
                                    {order.customer?.email || ""}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                        );
                      }
                      if (col.key === "store") {
                        return (
                          <TableCell key={col.key} sx={{ py: 2 }}>
                            <Chip
                              label={order.store_name || "N/A"}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderRadius: 1,
                                borderColor: theme.palette.divider,
                                backgroundColor: theme.palette.action.hover
                              }}
                            />
                          </TableCell>
                        );
                      }


   if (col.key === "assigned_to") {
  const assignedTailor = tailors.find(t => String(t.id) === String(order.assigned_to));
  return (
    <TableCell key={col.key} sx={{ py: 2 }}>
      <Tooltip title="Click to change tailor" arrow>
        <TextField
          select
          variant="outlined"
          size="small"
          value={order.assigned_to || ""}
          onChange={async (e) => {
            try {
              await axios.post(
                'http://localhost/boutiquetailoringsoftware/public_html/api/orders/updateOrderField.php',
                { 
                  order_id: order.order_id, 
                  field: 'assigned_to',
                  value: e.target.value 
                }
              );
              fetchOrders(); // Refresh the orders after update
            } catch (error) {
              console.error("Error updating tailor:", error);
            }
          }}
          sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper
            }
          }}
        >
          <MenuItem value="">
            <em>Unassigned</em>
          </MenuItem>
          {tailors.map((tailor) => (
            <MenuItem key={tailor.id} value={tailor.id}>
              {tailor.first_name} {tailor.last_name}
            </MenuItem>
          ))}
        </TextField>
      </Tooltip>
    </TableCell>
  );
}

if (col.key === "status") {
  return (
    <TableCell key={col.key} sx={{ py: 2 }}>
      <Tooltip title="Click to change status" arrow>
        <TextField
          select
          variant="outlined"
          size="small"
          value={order.status || ""}
          onChange={async (e) => {
            try {
              await axios.post(
                'http://localhost/boutiquetailoringsoftware/public_html/api/orders/updateOrderField.php',
                { 
                  order_id: order.order_id, 
                  field: 'status',
                  value: e.target.value 
                }
              );
              fetchOrders(); // Refresh the orders after update
            } catch (error) {
              console.error("Error updating status:", error);
            }
          }}
          sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper
            }
          }}
        >
          {['pending', 'in_progress', 'completed', 'delivered'].map((status) => (
            <MenuItem key={status} value={status}>
                {status}
                
            </MenuItem>
          ))}
        </TextField>
      </Tooltip>
    </TableCell>
  );
}

                      if (col.key === "taken_date" || col.key === "delivery_date") {
                        return (
                          <TableCell key={col.key} sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {formatDate(order[col.key])}
                            </Typography>
                            {col.key === "delivery_date" && order.delivery_date && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {new Date(order.delivery_date) < new Date() ? 'Past due' : ''}
                              </Typography>
                            )}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={col.key} sx={{ py: 2 }}>
                          <Typography variant="body2">
                            {order[col.key] || "N/A"}
                          </Typography>
                        </TableCell>
                      );
                    })}
                    <TableCell align="right" sx={{ py: 2 }}>
                      <IconButton size="small" onClick={() => navigate(`/purchase/${order.order_id}`)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {orders.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default
          }}>
            <Typography variant="body2" color="text.secondary">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, (page - 1) * limit + orders.length)} of results
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              size={isMobile ? "small" : "medium"}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 1}
            />
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default ViewPendingOrders;