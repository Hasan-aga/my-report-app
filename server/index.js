const express = require('express');
const path = require('path');
const fs = require('fs');           // Regular fs for sync operations
const fsPromises = require('fs').promises;  // Promise-based fs
const cors = require('cors');
const templateRoutes = require('./routes/template');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/', templateRoutes);

// Create templates directory if it doesn't exist
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir);
}

// API Routes
app.get('/api/templates', async (req, res) => {
  try {
    const files = await fsPromises.readdir(templatesDir);
    const pdfTemplates = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file.replace('.pdf', ''),
        path: `/${file}`
      }));
    
    res.json(pdfTemplates);
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Failed to read templates' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 