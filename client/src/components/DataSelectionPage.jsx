import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFService from '../services/PDFService';
import './DataSelectionPage.css';
import { dummyData } from '../data/dummyData';

const DataSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const templatePath = location.state?.templatePath;

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePrint = async () => {
    try {
      const selectedData = dummyData.filter(item => selectedItems.includes(item.id));
      
      const pdfBytes = await PDFService.fillTemplate(
        templatePath,
        selectedData
      );
      await PDFService.printPDF(pdfBytes);
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="data-selection-container">
      <button onClick={handleBack} className="back-button">← Back to Templates</button>
      <h1>Select Data for Report</h1>
      
      <div className="data-list">
        {dummyData.map((item) => (
          <div key={item.id} className="data-item">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleCheckboxChange(item.id)}
              className="data-checkbox"
            />
            <div className="item-details">
              <span className="name">{item.name}</span>
              <span className="age">Age: {item.age}</span>
              <span className="department">Department: {item.department}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="print-controls">
        <button 
          className="print-button" 
          onClick={handlePrint}
          disabled={selectedItems.length === 0}
        >
          Print PDF
        </button>
      </div>
    </div>
  );
};

export default DataSelectionPage; 