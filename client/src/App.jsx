import React from 'react';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import ReportGeneratorPage from './components/ReportGeneratorPage';

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#283618',
      light: '#606C38',
      contrastText: '#fefae0',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#606c38',
      paper: '#acb785',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: 'background.default'
      }}>
        <ReportGeneratorPage />
      </Box>
    </ThemeProvider>
  );
}

export default App; 