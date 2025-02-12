import React, { useState } from 'react';
import './DataSelectionPage.css';

// Dummy data for demonstration
const dummyData = [
  { id: 1, name: "John Doe", age: 30, department: "IT" },
  { id: 2, name: "Jane Smith", age: 28, department: "HR" },
  { id: 3, name: "Mike Johnson", age: 35, department: "Finance" },
  { id: 4, name: "Sarah Williams", age: 32, department: "Marketing" },
  { id: 5, name: "Tom Brown", age: 27, department: "IT" },
];

function DataSelectionPage() {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePreviewClick = () => {
    // Navigate to preview page with selected data
    // This will be implemented later
    console.log("Selected items:", selectedItems);
  };

  return (
    <div className="data-selection-container">
      <h1>Select Data for Report</h1>
      
      <div className="data-list">
        {dummyData.map((item) => (
          <div key={item.id} className="data-item">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
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

      <button 
        className="preview-button"
        onClick={handlePreviewClick}
        disabled={selectedItems.length === 0}
      >
        Preview Report
      </button>
    </div>
  );
}

export default DataSelectionPage; 