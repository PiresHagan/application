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
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Event as EventIcon,
  Description as ApplicationIcon,
  Add as CreateIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmenuToggle = () => {
    setOpenSubmenu(!openSubmenu);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'App1', icon: <SearchIcon />, path: '/search' },
    { text: 'App2', icon: <InfoIcon />, path: '/policy-info' },
    { text: 'App3', icon: <EventIcon />, path: '/events' },
    {
      text: 'Application',
      icon: <ApplicationIcon />,
      submenu: [
        { text: 'Search', icon: <SearchIcon />, path: '/application/search' },
        { text: 'Create', icon: <CreateIcon />, path: '/application/create' },
      ],
    },
  ];

  const drawer = (
    <List sx={{ pt: 2 }}>
      {menuItems.map((item) => (
        <React.Fragment key={item.text}>
          {item.submenu ? (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleSubmenuToggle}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                  {openSubmenu ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={openSubmenu} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        onClick={() => handleNavigation(subItem.path)}
                        selected={location.pathname === subItem.path}
                        sx={{
                          pl: 4,
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
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: location.pathname === subItem.path ? '#1976d2' : 'inherit'
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiTypography-root': {
                              fontSize: '0.875rem',
                              fontWeight: location.pathname === subItem.path ? 500 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          ) : (
            <ListItem disablePadding>
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
          )}
        </React.Fragment>
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
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 1200,
          color: '#5B5B5B',
          bgcolor: 'background.paper',
          boxShadow: 1,
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
          keepMounted: true,
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