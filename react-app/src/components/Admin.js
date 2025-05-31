import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link
} from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

import DashboardPage from './DashboardPage';
import AddPurchasePage from './AddPurchasePage';
import AddCustomerPage from './AddCustomerPage';
import AddMasterPage from './AddMasterPage';
import BillingPage from './BillingPage';
import ReportPage from './ReportPage';
import AddStorePage from './AddStorePage';
import PurchaseDashboard from './PurchaseDashboard';
import ViewPurchasesPage from './ViewPurchasesPage';
import MasterPurchasesPage from './MasterPurchasesPage';

import Slogo from '../images/Slogo.png';

export default function AdminContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    handleProfileClose();
    handleMobileMenuClose();
    navigate('/login');
  };

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  const handleMobileMenuOpen = (event) => setMobileMenuAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchorEl(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar - hide on fullscreen */}
      {!isFullScreen && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            backgroundColor: '#ffffff',
            color: 'text.primary',
            boxShadow: 1,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            '&:before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(to right, #d63384, #6a11cb)',
            }
          }}
        >
          <Toolbar
            sx={{
              minHeight: 100,
              height: 110,
              position: 'relative',
              px: 3,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {/* Logo and Title - always left aligned */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexGrow: 1,
                gap: 2,
                pointerEvents: 'none',
              }}
            >
              <img
                src={Slogo}
                alt="Logo"
                style={{
                  height: isMobile ? 50 : isTablet ? 70 : 100,
                  objectFit: 'contain',
                  userSelect: 'none',
                }}
              />
              <Typography
                variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h4'}
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #FF5BADFF, #8F26FFFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'left',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Sarrahh Boutique & Tailors
              </Typography>
            </Box>

            {/* Right-side Controls */}
            {!isMobile ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'absolute',
                  right: 24
                }}
              >
                <IconButton
                  onClick={toggleFullScreen}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>

                <Button
                  variant="outlined"
                  component={Link}
                  to="/dashboard"
                  sx={{ 
                    fontWeight: 600,
                    borderColor: 'divider',
                    background: 'linear-gradient(to right, #d63384, #6a11cb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      zIndex: -1,
                      margin: '-1px',
                      borderRadius: 'inherit',
                      background: 'linear-gradient(to right, #d63384, #6a11cb)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    },
                    '&:hover:before': {
                      opacity: 0.1,
                    }
                  }}
                >
                  Dashboard
                </Button>

                <Button
                  variant="outlined"
                  sx={{ 
                    fontWeight: 600,
                    borderColor: 'divider',
                    background: 'linear-gradient(to right, #d63384, #6a11cb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      zIndex: -1,
                      margin: '-1px',
                      borderRadius: 'inherit',
                      background: 'linear-gradient(to right, #d63384, #6a11cb)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    },
                    '&:hover:before': {
                      opacity: 0.1,
                    }
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              // Mobile Menu Button (Hamburger)
              <Box sx={{ position: 'absolute', right: 24 }}>
                <IconButton
                  onClick={handleMobileMenuOpen}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <MenuIcon />
                </IconButton>

                <Menu
                  anchorEl={mobileMenuAnchorEl}
                  open={Boolean(mobileMenuAnchorEl)}
                  onClose={handleMobileMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem 
                    onClick={() => { navigate('/dashboard'); handleMobileMenuClose(); }}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(to right, #d63384, #6a11cb)',
                        color: '#ffffff',
                      }
                    }}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { toggleFullScreen(); handleMobileMenuClose(); }}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(to right, #d63384, #6a11cb)',
                        color: '#ffffff',
                      }
                    }}
                  >
                    {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </MenuItem>
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(to right, #d63384, #6a11cb)',
                        color: '#ffffff',
                      }
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          mt: !isFullScreen ? '110px' : 0,
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          overflow: 'auto',
          px: { xs: 1, sm: 2, md: 4 },
          transition: 'all 0.3s ease'
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage role={role} userId={userId} />} />
          <Route path="/add-customer" element={<AddCustomerPage />} />
          <Route path="/add-master" element={<AddMasterPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/add-store" element={<AddStorePage />} />
          <Route path="/add-purchase" element={<AddPurchasePage />} />
          <Route path="/view-purchases" element={<ViewPurchasesPage />} />
          <Route path="/master-purchases" element={<MasterPurchasesPage userId={userId} />} />
          <Route path="/purchases" element={<PurchaseDashboard />} />
        </Routes>
      </Box>

      {/* Fullscreen Exit Button (Floating) */}
      {isFullScreen && (
        <IconButton
          onClick={toggleFullScreen}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 2000,
            background: 'linear-gradient(to right, #d63384, #6a11cb)',
            color: '#fff',
            '&:hover': { 
              background: 'linear-gradient(to right, #c22570, #5a0db5)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }
          }}
        >
          <FullscreenExitIcon />
        </IconButton>
      )}
    </Box>
  );
}