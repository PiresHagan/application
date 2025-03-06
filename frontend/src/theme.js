import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#F5F5F5',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F5F5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#F5F5F5',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ddd',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6246EA', 
            borderWidth: '2px',
          },
        },
        notchedOutline: {
          borderColor: '#eee',
        },
        input: {
          padding: '14px 14px',
        }
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: '8px',
          backgroundColor: '#F5F5F5',
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(98, 70, 234, 0.1)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(98, 70, 234, 0.2)',
          },
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: 'white',
          '&::before': {
            display: 'none',
          },
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 16px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '10px 20px',
          boxShadow: 'none',
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export default theme; 