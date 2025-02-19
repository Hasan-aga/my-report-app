import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PDFService from '../services/PDFService';
import ErrorNotification from './ErrorNotification';
import './TemplateSelectionPage.css';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material';
import { REPORT_DATA } from '../constants/config';

function TemplateSelectionPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewWindow, setPreviewWindow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
    // Check for existing template selection
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(JSON.parse(savedTemplate));
    }
  }, []);

  // Cleanup preview window on unmount
  useEffect(() => {
    return () => {
      if (previewWindow) {
        previewWindow.close();
      }
    };
  }, [previewWindow]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      // Store selected template in localStorage for persistence
      localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
      navigate('/');  // Go back to category selection
    }
  };

  const handlePreview = async (template, event) => {
    try {
      // Close previous preview window if exists
      if (previewWindow) {
        previewWindow.close();
      }

      event.stopPropagation(); // Prevent template selection when clicking preview

      const objectUrl = await PDFService.previewTemplate(template.path);
      
      const newWindow = window.open(
        objectUrl,
        'PDFPreview',
        'width=800,height=600,menubar=no,toolbar=no,location=no,status=no'
      );

      if (!newWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for PDF preview.');
      }

      setPreviewWindow(newWindow);

      // Cleanup when preview window is closed
      newWindow.onload = () => {
        newWindow.onunload = () => {
          URL.revokeObjectURL(objectUrl);
          setPreviewWindow(null);
        };
      };
    } catch (error) {
      console.error('Preview error:', error);
      setError(`Error previewing PDF: ${error.message}`);
    }
  };

  const handleCategorySelect = (category) => {
    navigate('/data-selection', {
      state: {
        category,
        templatePath: REPORT_DATA[category].path
      }
    });
  };

  if (loading) return <div className="loading">Loading templates...</div>;

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            Report Generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Select Report Type
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose a category to generate your report
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {Object.entries(REPORT_DATA).map(([key, category]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card 
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleCategorySelect(key)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.findings.length} findings available
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default TemplateSelectionPage; 