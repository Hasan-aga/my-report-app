import React from 'react';
import PDFService from '../services/PDFService';
import { PDF_TEMPLATE_PATH, PDF_COORDINATES, REPORT_DATA } from '../constants/config';
import './DataSelectionPage.css';

const DataSelectionPage = () => {
  const handlePrint = async () => {
    try {
      const checkedBoxes = document.querySelectorAll('input[name="report"]:checked');
      const selectedData = Array.from(checkedBoxes).map(box => 
        REPORT_DATA.find(item => item.name === box.value)
      );
      
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
      <form>
        <div className="data-list">
          {REPORT_DATA.map((item) => (
            <div key={item.name} className="data-item">
              <input
                type="checkbox"
                name="report"
                value={item.name}
                className="data-checkbox"
              />
              <div className="item-details">
                <span className="name">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="print-controls">
          <button 
            type="button"
            className="print-button" 
            onClick={handlePrint}
          >
            Print PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataSelectionPage; 