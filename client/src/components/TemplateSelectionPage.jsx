import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PDFService from '../services/PDFService';
import ErrorNotification from './ErrorNotification';
import './TemplateSelectionPage.css';

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

  if (loading) return <div className="loading">Loading templates...</div>;

  return (
    <div className="template-selection-container">
      <ErrorNotification 
        message={error} 
        onClose={() => setError(null)} 
      />
      <h1>Report Template Settings</h1>
      <div className="templates-grid">
        {templates.map((template) => (
          <div 
            key={template.name} 
            className={`template-card ${selectedTemplate?.name === template.name ? 'selected' : ''}`}
            onClick={() => handleTemplateSelect(template)}
          >
            <h3>{template.name}</h3>
            <div className="template-actions">
              <button 
                className="preview-button"
                onClick={(e) => handlePreview(template, e)}
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="template-controls">
        <button 
          className="confirm-button"
          onClick={handleConfirm}
          disabled={!selectedTemplate}
        >
          Save Template Selection
        </button>
      </div>
    </div>
  );
}

export default TemplateSelectionPage; 