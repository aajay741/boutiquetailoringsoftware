import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';

function PurchaseDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Add Purchases',
      description: 'Create new purchase records',
      icon: <AddCircleOutlineIcon fontSize="large" />,
      action: () => navigate('/add-purchase')
    },
    {
      title: 'Pending Orders',
      description: 'Browse Pending Orders',
      icon: <ListAltIcon fontSize="large" />,
      action: () => navigate('/view-pending-purchases')
    },
    {
      title: 'Purchase Reports',
      description: 'Generate purchase analytics',
      icon: <ReceiptIcon fontSize="large" />,
      action: () => navigate('/purchase-reports')
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        p: 2,
        bgcolor: '#f6f8fb'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 4 },
          width: '100%',
          maxWidth: 1200,
          borderRadius: { xs: 2, sm: 5 },
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Purchase Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select an action below
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={card.action}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {card.icon}
                  </Box>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={4} textAlign="center">
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default PurchaseDashboard;