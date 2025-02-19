import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFService from '../services/PDFService';
import ErrorNotification from './ErrorNotification';
import './DataSelectionPage.css';
import { PDF_TEMPLATE_PATH, REPORT_DATA } from '../constants/config';

const DataSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedFindings, setSelectedFindings] = useState([]);
  const templatePath = location.state?.templatePath;
  const category = location.state?.category;
  const [error, setError] = useState(null);

  // Get the category data or redirect if invalid
  const categoryData = REPORT_DATA[category];
  if (!categoryData) {
    navigate('/');
    return null;
  }

  const handleCheckboxChange = (finding) => {
    setSelectedFindings(prev => {
      if (prev.includes(finding)) {
        return prev.filter(f => f !== finding);
      } else {
        return [...prev, finding];
      }
    });
  };

  const handlePrint = async () => {
    try {
      const selectedData = [{
        category: categoryData.name,
        findings: selectedFindings
      }];
      
      console.log('Print request:', {
        data: selectedData,
        templatePath: templatePath
      });

      if (!templatePath) {
        throw new Error('No template selected. Please select a template in settings.');
      }

      const pdfBytes = await PDFService.fillTemplate(
        templatePath,
        selectedData
      );

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      await PDFService.printPDF(pdfBytes);
    } catch (error) {
      console.error('Print error:', error);
      setError(`${error.message}\nPlease check that the template is valid and try again.`);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="data-selection-container">
      <ErrorNotification 
        message={error} 
        onClose={() => setError(null)} 
      />
      <button onClick={handleBack} className="back-button">← Back to Templates</button>
      <h1>{categoryData.name} Report Findings</h1>
      
      <div className="data-list">
        {categoryData.findings.map((finding) => (
          <div key={finding} className="data-item">
            <input
              type="checkbox"
              checked={selectedFindings.includes(finding)}
              onChange={() => handleCheckboxChange(finding)}
              className="data-checkbox"
            />
            <div className="item-details">
              <span className="finding">{finding}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="print-controls">
        <button 
          className="print-button" 
          onClick={handlePrint}
          disabled={selectedFindings.length === 0}
        >
          Print PDF
        </button>
      </div>
    </div>
  );
};

export default DataSelectionPage; 