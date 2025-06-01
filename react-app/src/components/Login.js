import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  IconButton, Avatar, Fade, Alert, Collapse, CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import logo from '../images/Slogo.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); // 'error', 'success'
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const validateFields = () => {
    let isValid = true;
    
    if (!email) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }
    
    if (!password) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }
    
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!validateFields()) {
      setMessage('Please fill in all required fields');
      setAlertType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost/boutiquetailoringsoftware/public_html/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id); // Store user ID
        localStorage.setItem('role', data.user.role); // Store user ID

        setMessage('Login successful! Redirecting...');
        setAlertType('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage(data.message || 'Invalid email or password');
        setAlertType('error');
      }
    } catch (error) {
      setMessage('Server error. Please try again later.');
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={6}
          sx={{
            width: { xs: '90%', sm: 400 },
            borderRadius: 4,
            p: 4,
            backgroundColor: '#ffffff',
            boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: 'linear-gradient(to right, #d63384, #6a11cb)',
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar 
              src={logo} 
              sx={{ 
                width: 80, 
                height: 80, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }} 
              variant="square" 
            />
          </Box>

          <Typography 
            variant="h5" 
            align="center" 
            fontWeight={600} 
            sx={{ 
              mb: 2,
              color: 'text.primary',
              letterSpacing: '0.5px'
            }}
          >
            Welcome Back
          </Typography>

          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mb: 3,
              color: 'text.secondary'
            }}
          >
            Please enter your credentials to login
          </Typography>

          <Collapse in={!!message} sx={{ mb: 2 }}>
            <Alert
              severity={alertType}
              icon={alertType === 'success' ? <CheckCircleIcon fontSize="inherit" /> : null}
              sx={{
                borderRadius: 2,
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                '& .MuiAlert-message': {
                  py: 1
                }
              }}
            >
              {message}
            </Alert>
          </Collapse>

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
              }}
              sx={{ mb: 2 }}
              error={emailError}
              helperText={emailError ? 'Email is required' : ''}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: emailError ? 'error.main' : 'divider',
                  },
                }
              }}
            />

            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              size="small"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(false);
              }}
              sx={{ mb: 2 }}
              error={passwordError}
              helperText={passwordError ? 'Password is required' : ''}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: passwordError ? 'error.main' : 'divider',
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                background: 'linear-gradient(to right, #d63384, #6a11cb)',
                fontWeight: 'bold',
                py: 1.2,
                fontSize: 15,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}

export default LoginPage;