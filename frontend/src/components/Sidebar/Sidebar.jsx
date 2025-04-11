import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
  Button,
} from '@mui/material';
import {
  HomeOutlined as HomeIcon,
  CreateOutlined as CreateIcon,
  SearchOutlined as SearchIcon,
  InfoOutlined as ApplicationIcon,
  AssignmentOutlined as UnderwritingIcon,
  SettingsOutlined as SettingsIcon,
  PersonOutlined as PersonIcon,
  Apps as MenuIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';

function Sidebar() {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const dispatch = useDispatch();

  const menuItems = [
    {
      id: 'home',
      icon: <HomeIcon />,
      path: '/',
      label: 'Home'
    },
    {
      id: 'illustration',
      icon: <CreateIcon />,
      label: 'Illustration',
      submenu: [
        { label: 'Search', path: '/illustration/search', icon: <SearchIcon /> },
        { label: 'Create', path: '/illustration/create', icon: <CreateIcon /> }
      ]
    },
    {
      id: 'application',
      icon: <ApplicationIcon />,
      label: 'Application',
      submenu: [
        { label: 'Search', path: '/application/search', icon: <SearchIcon /> },
        { label: 'Create', path: '/application/create', icon: <CreateIcon /> }
      ]
    },
    {
      id: 'underwriting',
      icon: <UnderwritingIcon />,
      label: 'Underwriting',
      path: '/underwriting'
    }
  ];

  const bottomMenuItems = [
    {
      id: 'settings',
      icon: <SettingsIcon />,
      label: 'Settings',
      submenu: [
        { label: 'Option 1', path: '/settings/option1', icon: <SearchIcon /> },
        { label: 'Option 2', path: '/settings/option2', icon: <SearchIcon /> },
        { label: 'Option 3', path: '/settings/option3', icon: <SearchIcon /> }
      ]
    },
    {
      id: 'profile',
      icon: userInfo ? <PersonIcon /> : <LoginIcon />,
      label: userInfo ? 'Profile' : 'Login',
      onClick: () => handleProfileClick()
    }
  ];

  const handleMenuClick = (item, event) => {
    if (item.submenu) {
      setAnchorEl(event.currentTarget);
      setActiveMenu(item.id);
    } else if (item.path) {
      navigate(item.path);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const handleProfileClick = () => {
    // Show profile info popup
    setAnchorEl(document.getElementById('profile-button'));
    setActiveMenu('profile');
  };

  const handleClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  // Add this helper function to check if menu item is active
  const isMenuActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const renderProfileContent = () => {
    if (userInfo) {
      // User is logged in
      return (
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle1">{userInfo.name}</Typography>
          <Typography variant="body2">{userInfo.email}</Typography>
          <Typography variant="body2">
            Security Group: {userInfo.role || 'User'}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={() => {
              dispatch(logout());
              handleClose();
            }}
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>
      );
    } else {
      // User is not logged in
      return (
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Sign in to your account
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              navigate('/login');
              handleClose();
            }}
            sx={{ mb: 1 }}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate('/register');
              handleClose();
            }}
          >
            Register
          </Button>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        width: 55,
        height: '100vh',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <List sx={{ py: 2, flex: 1 }}>
        <ListItem disablePadding sx={{ mb: 2 }}>
          <ListItemButton
            sx={{
              minHeight: 40,
              justifyContent: 'center',
              px: 0,
              '&:hover': {
                bgcolor: 'primary.lighter',
                '& .MuiSvgIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 0,
                justifyContent: 'center',
                color: 'grey.500',
              }}
            >
              <MenuIcon sx={{ fontSize: 24 }} />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>

        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={(e) => handleMenuClick(item, e)}
              sx={{
                minHeight: 40,
                justifyContent: 'center',
                px: 0,
                mx: '6px',
                borderRadius: 1,
                position: 'relative',
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -6,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    transition: 'all 0.2s ease-in-out',
                  },
                },
                ...(isMenuActive(item) && {
                  bgcolor: 'primary.lighter',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -6,
                    width: 3,
                    height: '100%',
                    bgcolor: 'primary.main',
                    borderRadius: 0,
                    transition: 'all 0.2s ease-in-out',
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 0,
                  justifyContent: 'center',
                  color: isMenuActive(item) ? 'primary.main' : 'grey.500',
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List sx={{ py: 2 }}>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              id={`${item.id}-button`}
              onClick={(e) => handleMenuClick(item, e)}
              sx={{
                minHeight: 40,
                justifyContent: 'center',
                px: 0,
                '&:hover': {
                  bgcolor: 'primary.lighter',
                  '& .MuiSvgIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 0,
                  justifyContent: 'center',
                  color: 'grey.500',
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
      >
        {activeMenu === 'profile' ? (
          renderProfileContent()
        ) : (
          <List>
            {menuItems.find(item => item.id === activeMenu)?.submenu.map((subItem) => (
              <ListItem key={subItem.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(subItem.path);
                    handleClose();
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      mr: 0.5
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={subItem.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {bottomMenuItems.find(item => item.id === activeMenu)?.submenu.map((subItem) => (
              <ListItem key={subItem.path} disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate(subItem.path);
                    handleClose();
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      mr: 0.5
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText primary={subItem.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
}

export default Sidebar;