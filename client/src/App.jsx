import React from 'react';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import ReportGeneratorPage from './components/ReportGeneratorPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
      }}>
        <ReportGeneratorPage />
      </Box>
    </ThemeProvider>
  );
}

export default App; 