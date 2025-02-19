import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CategorySelectionPage from './components/CategorySelectionPage';
import DataSelectionPage from './components/DataSelectionPage';
import TemplateSelectionPage from './components/TemplateSelectionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CategorySelectionPage />} />
        <Route path="/select-findings" element={<DataSelectionPage />} />
        <Route path="/settings" element={<TemplateSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App; 