import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ListAlt as ListAltIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Build as BuildIcon,
  Store as StoreIcon,
  CollectionsBookmark as CollectionsBookmarkIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function DashboardPage({ role, userId }) {
  const navigate = useNavigate();
  const theme = useTheme();

  // Redirect non-admin users immediately
  useEffect(() => {
    if (role !== "admin") {
      navigate('/master-purchases');
    }
  }, [role, navigate]);

  const cards = [
    {
      title: 'Add Purchases',
      description: 'Create new purchase records',
      icon: <AddCircleOutlineIcon fontSize="large" color="primary" />,
      path: '/add-purchase'
    },
    {
      title: 'View Purchases',
      description: 'Browse existing purchases',
      icon: <ListAltIcon fontSize="large" color="primary" />,
      path: '/view-purchases'
    },
    {
      title: 'Master Purchases',
      description: 'Manage master purchase records',
      icon: <CollectionsBookmarkIcon fontSize="large" color="primary" />,
      path: '/master-purchases'
    },
    {
      title: 'Add Master',
      description: 'Add master data for tailoring',
      icon: <BuildIcon fontSize="large" color="primary" />,
      path: '/add-master'
    },
    {
      title: 'Add Store',
      description: 'Finalize  store details',
      icon: <StoreIcon fontSize="large" color="primary" />,
      path: '/add-store'
    },
    {
      title: 'Billing',
      description: 'Manage customer billing ',
      icon: <PaymentIcon fontSize="large" color="primary" />,
      path: '/billing'
    },
    {
      title: 'Reports',
      description: 'View and generate reports',
      icon: <AssessmentIcon fontSize="large" color="primary" />,
      path: '/report'
    },
    {
      title: 'Monthly Report',
      description: 'View monthly reports',
      icon: <DateRangeIcon fontSize="large" color="primary" />,
      path: '/monthly-report'
    }
  ];

  if (role !== "admin") {
    return null;
  }

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        py: 4,
        px: 2
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto'
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 6
            }}
          >
            
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                  background: 'linear-gradient(to right, #FF5BADFF, #8F26FFFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',              }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'text.secondary'
              }}
            >
              Sarrahh Boutique & Tailors - Administrator View
            </Typography>
          </Box>

          {/* Cards Grid - 4 cards per row */}
          <Grid container spacing={3} justifyContent="center">
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: 240, // Fixed height
                    width: '100%', // Full width of grid item
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCardClick(card.path)}
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between' // Distribute space evenly
                    }}
                  >
                    <Box sx={{ 
                      mb: 2,
                      flexShrink: 0 // Prevent icon from growing
                    }}>
                      {card.icon}
                    </Box>
                    <CardContent sx={{ 
                      textAlign: 'center',
                      flexGrow: 1, // Allow content to take available space
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      width: '100%',
                      px: 0 // Remove horizontal padding
                    }}>
                      <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // Limit to 2 lines
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, // Limit to 2 lines
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {card.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default DashboardPage;