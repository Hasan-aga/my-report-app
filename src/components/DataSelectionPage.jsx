import React, { useState } from 'react';
import PDFService from '../services/PDFService';
import { PDF_TEMPLATE_PATH, PDF_COORDINATES, REPORT_DATA } from '../constants/config';
import './DataSelectionPage.css';


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
        {REPORT_DATA.map((item) => (
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