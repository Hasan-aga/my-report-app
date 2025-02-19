const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');           // Regular fs for sync operations
const fsPromises = require('fs').promises;  // Promise-based fs

// Directory where templates are stored - using absolute path
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');

// Create templates directory if it doesn't exist
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR);
}

// Helper function to sanitize filename
function sanitizeFilename(filename) {
  // Remove any path traversal attempts and special characters
  return filename
    .replace(/[^a-zA-Z0-9-_\.]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, ''); // Remove dots from start and end
}

// Helper function to validate PDF file
function validatePDFFile(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Check file size
    if (fileBuffer.length === 0) {
      throw new Error('Empty file');
    }
    
    // Check PDF signature
    const isPDF = fileBuffer.slice(0, 4).toString() === '%PDF';
    if (!isPDF) {
      throw new Error('Not a valid PDF file');
    }
    
    return fileBuffer;
  } catch (error) {
    throw new Error(`Invalid PDF file: ${error.message}`);
  }
}

// Get all templates
router.get('/api/templates', (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR);
    const pdfTemplates = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => {
        const sanitizedName = sanitizeFilename(file);
        return {
          name: sanitizedName.replace('.pdf', ''),
          path: `/${sanitizedName}`,
          originalName: file
        };
      });
    
    res.json(pdfTemplates);
  } catch (error) {
    console.error('Error reading templates directory:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve PDF template files
router.get('/api/templates/file/:filename', (req, res) => {
  try {
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.resolve(TEMPLATES_DIR, filename);
    
    console.log('Request for template:', {
      originalFilename: req.params.filename,
      sanitizedFilename: filename,
      filePath,
      exists: fs.existsSync(filePath)
    });

    // Verify the file exists
    if (!fs.existsSync(filePath)) {
      console.error('Template file not found:', filePath);
      return res.status(404).json({ 
        error: 'Template not found',
        details: 'The requested template file could not be found'
      });
    }

    // Read the file synchronously to validate
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File details:', {
      size: fileBuffer.length,
      header: fileBuffer.slice(0, 8).toString('ascii')
    });

    // Verify it's a PDF
    if (!fileBuffer.slice(0, 5).toString('ascii').startsWith('%PDF-')) {
      console.error('Invalid PDF header:', fileBuffer.slice(0, 8).toString('ascii'));
      return res.status(400).json({ 
        error: 'Invalid PDF file',
        details: 'The file does not appear to be a valid PDF'
      });
    }

    // Set proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    
    // Send the buffer directly
    res.end(fileBuffer);

  } catch (error) {
    console.error('Detailed server error:', {
      error,
      stack: error.stack,
      message: error.message
    });
    res.status(500).json({ 
      error: 'Server error',
      details: 'An unexpected error occurred while processing the template'
    });
  }
});

module.exports = router; 