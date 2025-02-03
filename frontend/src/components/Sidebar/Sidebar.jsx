import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Event as EventIcon,
} from '@mui/icons-material';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Policy Info', icon: <InfoIcon />, path: '/policy-info' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
  ];

  const drawer = (
    <List sx={{ pt: 2 }}>
      {menuItems.slice(0, 1).map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: 40,
              color: location.pathname === item.path ? '#1976d2' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 500 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}

      <Divider sx={{ my: 1, mx: 2 }} />

      {menuItems.slice(1).map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{
              minWidth: 40,
              color: location.pathname === item.path ? '#1976d2' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 500 : 400,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1200,
          color: '#5B5B5B',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Sidebar;