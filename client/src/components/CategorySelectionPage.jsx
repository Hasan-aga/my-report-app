import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySelectionPage.css';
import { REPORT_DATA } from '../constants/config';

function CategorySelectionPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    // Check for saved template on component mount
    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(JSON.parse(savedTemplate));
    }
  }, []);

  const handleCategorySelect = (category) => {
    if (!selectedTemplate) {
      // If no template is selected, redirect to settings
      navigate('/settings');
      return;
    }

    // If template is selected, proceed to data selection
    navigate('/select-findings', {
      state: {
        category,
        templatePath: selectedTemplate.path
      }
    });
  };

  return (
    <div className="category-selection-container">
      {!selectedTemplate && (
        <div className="template-warning">
          Please select a template in settings first
          <button onClick={() => navigate('/settings')}>Go to Settings</button>
        </div>
      )}
      
      <h1>Select Report Category</h1>
      <div className="categories-grid">
        {Object.keys(REPORT_DATA).map((category) => (
          <div
            key={category}
            className="category-card"
            onClick={() => handleCategorySelect(category)}
          >
            <h3>{REPORT_DATA[category].name}</h3>
            <p>{REPORT_DATA[category].description || 'Click to select this category'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategorySelectionPage; 