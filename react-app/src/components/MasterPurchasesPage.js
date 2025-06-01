import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  useTheme,
  Avatar,
  Badge
} from "@mui/material";
import axios from "axios";
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PlaceIcon from '@mui/icons-material/Place';
import ReceiptIcon from '@mui/icons-material/Receipt';

const API_URL = "http://localhost/boutiquetailoringsoftware/public_html/api/orders/getOrders.php";

function groupByDate(orders) {
  const groups = {};
  orders.forEach((order) => {
    const date = order.delivery_date || "No Delivery Date";
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
  });
  return groups;
}

const MasterPurchasesPage = ({ userId }) => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL, {
        params: {
          page: 1,
          limit: 50,
          assigned_to: userId,
        },
      })
      .then((res) => {
        setOrders(res.data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "60vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: theme.palette.background.default
      }}>
        <CircularProgress thickness={4} size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  const grouped = groupByDate(orders);
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  const formatDateDisplay = (dateStr) => {
    if (dateStr === "No Delivery Date") return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 80%, 85%)`;
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      display: 'flex',
      justifyContent: 'center',
      background: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 1600,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 4,
        boxShadow: theme.shadows[2],
        p: { xs: 2, sm: 3, md: 4 },
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{ 
                mb: 1,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
                lineHeight: 1.2
              }}
            >
              Order Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {orders.length} orders in your queue
            </Typography>
          </Box>
          <Chip 
            icon={<EventNoteIcon />}
            label={new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
            sx={{ 
              mt: { xs: 2, sm: 0 },
              px: 2,
              py: 1.5,
              backgroundColor: theme.palette.action.selected,
              color: theme.palette.text.primary,
              fontSize: '0.875rem',
              '.MuiChip-icon': {
                color: theme.palette.primary.main
              }
            }}
          />
        </Box>
        
        {sortedDates.length === 0 ? (
          <Paper elevation={0} sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: theme.palette.background.paper,
            boxShadow: '0 8px 16px rgba(0,0,0,0.04)',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="h6" color="text.secondary">
              No orders currently assigned to you
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedDates.map((date) => (
              <Box key={date}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  position: 'relative',
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.03)',
                  boxShadow: theme.shadows[1],
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                    borderRadius: '0 0 2px 2px'
                  }
                }}>

                  <Typography variant="h6" fontWeight={600} sx={{ 
                    color: theme.palette.text.primary,
                    flexGrow: 1
                  }}>
                    {formatDateDisplay(date)}
                  </Typography>
                  <Badge 
                    badgeContent={grouped[date].length} 
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -10,
                        top: -10,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0 4px',
                        height: 20,
                        minWidth: 20
                      }
                    }}
                  />
                </Box>
                
                <Grid container spacing={3}>
                  {grouped[date].map((order) => (
                    <Grid item xs={12} sm={6} lg={4} key={order.order_id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: '0.3s',
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          background: theme.palette.background.paper,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            borderColor: theme.palette.primary.light
                          }
                        }}
                        onClick={() => navigate(`/purchase/${order.order_id}`)}
                      >
                        <CardContent sx={{ 
                          flexGrow: 1,
                          p: 3,
                          '&:last-child': { pb: 3 }
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2,
                            gap: 2
                          }}>
                            
                            <Box sx={{ minWidth: 0 }}>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight={600}
                                sx={{ 
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.3
                                }}
                              >
                                {order.customer.fullName}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5
                              }}>
                                <ReceiptIcon fontSize="small" color="action" sx={{ fontSize: '1rem' }} />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {order.invoice}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ 
                            my: 2,
                            borderColor: theme.palette.divider,
                            opacity: 0.5
                          }} />
                          
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            mb: 2
                          }}>
                            <PlaceIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.5,
                                fontSize: '0.875rem'
                              }}
                            >
                              {order.customer.address}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 3,
                            pt: 1.5,
                            borderTop: `1px dashed ${theme.palette.divider}`
                          }}>
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography 
                                variant="caption" 
                                color="text.disabled"
                                sx={{ fontSize: '0.75rem' }}
                              >
                                Taken: {new Date(order.taken_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip 
                              label="View Details"
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.action.hover,
                                color: theme.palette.text.secondary,
                                fontSize: '0.7rem',
                                height: 24,
                                '&:hover': {
                                  backgroundColor: theme.palette.action.selected
                                }
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MasterPurchasesPage;