import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemplateSelectionPage from './components/TemplateSelectionPage';
import DataSelectionPage from './components/DataSelectionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TemplateSelectionPage />} />
        <Route path="/data-selection/:templateName" element={<DataSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App; 