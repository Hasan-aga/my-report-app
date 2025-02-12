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
  const [selectedData, setSelectedData] = useState([]);

  const handleDataSelect = (item) => {
    setSelectedData(prevSelected => {
      const isSelected = prevSelected.includes(item);
      if (isSelected) {
        return prevSelected.filter(selected => selected !== item);
      } else {
        return [...prevSelected, item];
      }
    });
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

  return (
    <div className="data-selection-container">
      <h1>Select Data for Report</h1>
      
      <div className="data-list">
        {dummyData.map((item) => (
          <div
            key={item.id}
            className={`data-item ${selectedData.includes(item) ? 'selected' : ''}`}
            onClick={() => handleDataSelect(item)}
          >
            <input
              type="checkbox"
              checked={selectedData.includes(item)}
              onChange={() => handleDataSelect(item)}
              onClick={(e) => handleDataSelect(item)}
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
          disabled={selectedData.length === 0}
        >
          Print PDF
        </button>
      </div>
    </div>
  );
};

export default DataSelectionPage; 