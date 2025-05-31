import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutorenewIcon from '@mui/icons-material/Autorenew';

function ReportPage() {
  const quotes = [
    "Data is the new oil. We're refining it for you!",
    "Good reports take time to perfect.",
    "Behind every good decision is quality data.",
    "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
    "We're crunching numbers to bring you meaningful insights."
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      const currentIndex = quotes.indexOf(currentQuote);
      const nextIndex = (currentIndex + 1) % quotes.length;
      setCurrentQuote(quotes[nextIndex]);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(quoteInterval);
    };
  }, [currentQuote, quotes]);

  return (
     <Box
             sx={{
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
               minHeight: 'calc(100vh - 120px)',
               pt: 1, // Reduced top padding
               pb: 2,
               bgcolor: '#f8f9fa'
             }}
           >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 600,
          width: '100%',
          borderRadius: { xs: 2, sm: 5 },
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          textAlign: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <ReceiptLongIcon sx={{ 
            fontSize: 64, 
            color: 'primary.main', 
            mb: 2,
            animation: isLoading ? 'spin 2s linear infinite' : '',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {isLoading ? 'Preparing Reports' : 'Reports Coming Soon'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {currentQuote}
          </Typography>
          
          {isLoading ? (
            <CircularProgress size={60} thickness={4} sx={{ mt: 2 }} />
          ) : (
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                startIcon={<AutorenewIcon />}
                onClick={() => setIsLoading(true)}
                sx={{ mr: 2 }}
              >
                Check Again
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                disabled
              >
                Notify When Ready
              </Button>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          Our analytics team is working to deliver comprehensive sales reports.
        </Typography>
      </Paper>
    </Box>
  );
}

export default ReportPage;