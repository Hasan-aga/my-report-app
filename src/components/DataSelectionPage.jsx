import React, { useState } from 'react';
import PDFService from '../services/PDFService';
import { PDF_TEMPLATE_PATH, PDF_COORDINATES } from '../constants/config';
import './DataSelectionPage.css';

// Dummy data for demonstration
const dummyData = [
  { id: 1, name: "John Doe", age: 30, department: "IT" },
  { id: 2, name: "Jane Smith", age: 28, department: "HR" },
  { id: 3, name: "Mike Johnson", age: 35, department: "Finance" },
  { id: 4, name: "Sarah Williams", age: 32, department: "Marketing" },
  { id: 5, name: "Tom Brown", age: 27, department: "IT" },
];

const DataSelectionPage = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handlePreview = async () => {
    try {
      const pdfBytes = await PDFService.fillTemplate(
        PDF_TEMPLATE_PATH,
        selectedData,
        PDF_COORDINATES
      );
      const previewUrl = await PDFService.previewPDF(pdfBytes);
      setPreviewUrl(previewUrl);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    }
  };

  const handlePrint = async () => {
    try {
      const pdfBytes = await PDFService.fillTemplate(
        PDF_TEMPLATE_PATH,
        selectedData,
        PDF_COORDINATES
      );
      await PDFService.printPDF(pdfBytes);
    } catch (error) {
      console.error('Error printing PDF:', error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedData(prev => {
      if (prev && prev.id === id) {
        return null;
      } else {
        return dummyData.find(item => item.id === id);
      }
    });
  };

  return (
    <div className="data-selection-container">
      <h1>Select Data for Report</h1>
      
      <div className="data-list">
        {dummyData.map((item) => (
          <div key={item.id} className="data-item">
            <input
              type="checkbox"
              checked={selectedData && selectedData.id === item.id}
              onChange={() => handleCheckboxChange(item.id)}
            />
            <div className="item-details">
              <span className="name">{item.name}</span>
              <span className="age">Age: {item.age}</span>
              <span className="department">Department: {item.department}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="preview-controls">
        <button 
          className="preview-button" 
          onClick={handlePreview}
          disabled={!selectedData}
        >
          Preview PDF
        </button>
        <button 
          className="print-button" 
          onClick={handlePrint}
          disabled={!selectedData}
        >
          Print PDF
        </button>
      </div>

      {previewUrl && (
        <div className="pdf-preview">
          <iframe
            src={previewUrl}
            width="100%"
            height="600px"
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};

export default DataSelectionPage; 