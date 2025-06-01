import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  CircularProgress,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ArrowBack,
  Receipt,
  Assignment,
  Image as ImageIcon,
  Straighten as MeasurementsIcon,
  LocationOn,
  CalendarToday,
  Event,
  CheckCircle,
  Pending,
  AccessTime,
  Error
} from "@mui/icons-material";
import axios from "axios";
import { styled } from "@mui/material/styles";

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrdersById.php";
const IMAGE_BASE_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/uploads/orders/";

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  borderRadius: 4
}));

const PurchaseDetailsPage = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParticular, setSelectedParticular] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        console.error("Error fetching order:", err);
        setOrder(null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [order_id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle color="success" />;
      case 'Pending':
        return <Pending color="warning" />;
      case 'In Progress':
        return <AccessTime color="info" />;
      default:
        return <Error color="error" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Order Not Found
        </Typography>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: isMobile ? 1 : 3 }}>
      {/* Top Header Box */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>
                  <Receipt fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Invoice: {order.order.invoice}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  Customer: {order.customer.fullName}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Taken: {order.dates.takenDate}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  <Event fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Delivery: {order.dates.deliveryDate}
                </Typography>
                <StatusChip
                  label={order.order.status}
                  icon={getStatusIcon(order.order.status)}
                  color={
                    order.order.status === "Completed"
                      ? "success"
                      : order.order.status === "Pending"
                      ? "warning"
                      : "info"
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Three Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column - 30% */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Order Particulars"
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><Assignment /></Avatar>}
            />
            <CardContent>
              <List dense>
                {order.particulars.map((p) => (
                  <ListItem
                    key={p.particular_id}
                    button
                    selected={selectedParticular?.particular_id === p.particular_id}
                    onClick={() => setSelectedParticular(p)}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light'
                        }
                      }
                    }}
                  >
                    <ListItemText
                      primary={p.description}
                      secondary={`₹${p.price}`}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label={p.status} size="small" color={p.status === "Completed" ? "success" : "info"} />
                    {p.images?.length > 0 && (
                      <Badge badgeContent={p.images.length} color="secondary" sx={{ ml: 1 }}>
                        <ImageIcon color="action" fontSize="small" />
                      </Badge>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Middle Column - 50% */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Images"
              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><ImageIcon /></Avatar>}
              subheader={selectedParticular?.description}
            />
            <CardContent>
              {selectedParticular?.images?.length > 0 ? (
                <Grid container spacing={2}>
                  {selectedParticular.images.map((img, i) => {
                    const imgUrl = img.startsWith("http") ? img : IMAGE_BASE_URL + img;
                    return (
                      <Grid item xs={12} key={i}>
                        <Card variant="outlined">
                          <Box
                            component="img"
                            src={imgUrl}
                            alt={`Image ${i + 1}`}
                            sx={{ width: '100%', height: 200, objectFit: 'contain' }}
                          />
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}>
                  <ImageIcon fontSize="large" color="disabled" />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No images available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - 20% */}
        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Measurements"
              avatar={<Avatar sx={{ bgcolor: 'info.main' }}><MeasurementsIcon /></Avatar>}
            />
            <CardContent>
              {order.measurements ? (
                <>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Standard
                  </Typography>
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {Object.entries(order.measurements).map(([key, value]) => {
                      if (key === 'SL' || key === 'others') return null;
                      return (
                        <Grid item xs={12} key={key}>
                          <Card variant="outlined" sx={{ p: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {key.replace(/_/g, ' ')}
                            </Typography>
                            <Typography variant="h6" fontWeight={600}>{value}</Typography>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {order.measurements.SL && (
                    <>
                      <Typography variant="subtitle1" fontWeight={600}>Sleeve</Typography>
                      {Object.entries(order.measurements.SL).map(([position, m], i) => (
                        <Card key={i} variant="outlined" sx={{ p: 1, mb: 1 }}>
                          <Typography variant="subtitle2">{position}</Typography>
                          <Chip label={`L: ${m.L}`} size="small" sx={{ mr: 0.5 }} />
                          <Chip label={`W: ${m.W}`} size="small" sx={{ mr: 0.5 }} />
                          <Chip label={`A: ${m.A}`} size="small" />
                        </Card>
                      ))}
                    </>
                  )}

                  {order.measurements.others?.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight={600}>Custom</Typography>
                      <List dense>
                        {order.measurements.others.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={item.name} secondary={item.value} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No measurements recorded.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PurchaseDetailsPage;
