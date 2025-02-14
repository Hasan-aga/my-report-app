import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TemplateSelectionPage.css';

function TemplateSelectionPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

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
    navigate(`/data-selection/${template.name}`, { state: { templatePath: template.path } });
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="template-selection-container">
      <h1>Select a Report Template</h1>
      <div className="templates-grid">
        {templates.map((template) => (
          <div 
            key={template.name} 
            className="template-card"
            onClick={() => handleTemplateSelect(template)}
          >
            <h3>{template.name}</h3>
            <p>Click to select this template</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateSelectionPage; 