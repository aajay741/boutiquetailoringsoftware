import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Button, CircularProgress, Typography, Box, useMediaQuery, MenuItem, Stack, Container, Grid,
  Card, CardContent, InputAdornment, Pagination, Chip, Avatar
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrders.php";

const ViewPurchasesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        invoice
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
  }, [page]);

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
    setPage(1);
    fetchOrders();
  };

  const columns = [
    { 
      label: "Invoice", 
      key: "invoice",
      width: "12%"
    },
    { 
      label: "Customer", 
      key: "customer",
      width: "20%"
    },
    { 
      label: "Phone", 
      key: "phone",
      width: "12%"
    },
    { 
      label: "Store", 
      key: "store",
      width: "15%"
    },
    { 
      label: "Tailor", 
      key: "assigned_to",
      width: "15%"
    },
    { 
      label: "Taken", 
      key: "taken_date",
      width: "13%"
    },
    { 
      label: "Delivery", 
      key: "delivery_date",
      width: "13%"
    }
  ];

  const visibleColumns = isMobile
    ? columns.filter(col => ["invoice", "customer", "phone", "store"].includes(col.key))
    : columns;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Purchase Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all customer orders
        </Typography>
      </Box>

      {/* Filters */}
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                label="Customer"
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                label="Invoice"
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <TextField
                label="Taken Date"
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
                label="Delivery Date"
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
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                startIcon={<ClearIcon />}
                sx={{ minWidth: 120 }}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                {visibleColumns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: col.width
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No orders found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.order_id}
                    hover
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    {visibleColumns.map((col) => {
                      if (col.key === "invoice") {
                        return (
                          <TableCell key={col.key}>
                            <Typography
                              onClick={() => navigate(`/purchase/${order.order_id}`)}
                              sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 500,
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {order[col.key]}
                            </Typography>
                          </TableCell>
                        );
                      }
                      if (col.key === "customer") {
                        return (
                          <TableCell key={col.key}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {order.customer?.fullName?.charAt(0) || 'C'}
                              </Avatar>
                              <Typography variant="body2">
                                {order.customer?.fullName || order.customer_name || "N/A"}
                              </Typography>
                            </Box>
                          </TableCell>
                        );
                      }
                      if (col.key === "store") {
                        return (
                          <TableCell key={col.key}>
                            <Chip
                              label={order.store_name || "N/A"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        );
                      }
                      if (col.key === "assigned_to") {
                        return (
                          <TableCell key={col.key}>
                            {order.master_name ? (
                              <Chip
                                label={order.master_name}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Unassigned
                              </Typography>
                            )}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={col.key}>
                          <Typography variant="body2">
                            {order[col.key] || "N/A"}
                          </Typography>
                        </TableCell>
                      );
                    })}
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
            borderTop: `1px solid ${theme.palette.divider}`
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
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default ViewPurchasesPage;