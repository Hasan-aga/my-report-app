import React, { useState } from 'react';
import {
  Container,
  Typography,
  Checkbox,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Box,
  TextField,
  Divider,
} from '@mui/material';
import { Print } from '@mui/icons-material';
import { REPORT_DATA } from '../constants/config';
import PDFService from '../services/PDFService';

const DataSelectionPage = ({ category, templatePath }) => {
  const [selectedFindings, setSelectedFindings] = useState([]);
  const [editedFindings, setEditedFindings] = useState({});
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  const categoryData = REPORT_DATA[category];

  const handleCheckboxChange = (finding) => {
    setSelectedFindings(prev => {
      if (prev.includes(finding)) {
        return prev.filter(f => f !== finding);
      } else {
        return [...prev, finding];
      }
    });
  };

  const handleFindingEdit = (originalFinding, newText) => {
    setEditedFindings(prev => ({
      ...prev,
      [originalFinding]: newText
    }));
  };

  const getFindingText = (finding) => {
    return editedFindings[finding] || finding;
  };

  const handlePrint = async () => {
    try {
      console.log('Print request:', {
        templatePath,
        category,
        selectedFindings
      });

      const finalFindings = selectedFindings.map(finding => 
        getFindingText(finding)
      );

      const selectedData = finalFindings.length == 0? [{category:"", findings:[], notes: notes.trim()}]:[{
        category: categoryData.name,
        findings: finalFindings,
        notes: notes.trim()
      }];

      if (!templatePath) {
        throw new Error('No template selected. Please select a template in settings.');
      }

      const pdfBytes = await PDFService.fillTemplate(
        templatePath,
        selectedData
      );

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      await PDFService.printPDF(pdfBytes);
    } catch (error) {
      console.error('Print error:', error);
      setError(error.message);
    }
  };

  if (!category) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" color="text.secondary" align="center">
          Select a category to start generating your report
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {categoryData.name} Findings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select and customize findings for your report
        </Typography>
      </Box>

      <List sx={{ width: '100%', flexGrow: 1, overflow: 'auto' }}>
        {categoryData.findings.map((finding) => (
          <ListItem
            key={finding}
            divider
            disablePadding
          >
            <Checkbox
              checked={selectedFindings.includes(finding)}
              onChange={() => handleCheckboxChange(finding)}
              sx={{ ml: 1 }}
            />
            <ListItemText
              primary={
                <TextField
                  fullWidth
                  variant="standard"
                  defaultValue={finding}
                  onBlur={(e) => handleFindingEdit(finding, e.target.value)}
                  InputProps={{
                    disableUnderline: !selectedFindings.includes(finding),
                    style: {
                      color: '#283618',  // Dark green for all text
                      opacity: 1,        // Full opacity always
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      cursor: selectedFindings.includes(finding) ? 'text' : 'default',
                      '&.Mui-disabled': {
                        color: '#283618',  // Keep same color when disabled
                        WebkitTextFillColor: '#283618',  // Override WebKit default
                        opacity: 1,        // Keep full opacity when disabled
                      }
                    }
                  }}
                  disabled={!selectedFindings.includes(finding)}
                />
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          label="Additional Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes here..."
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Print />}
          onClick={handlePrint}
          size="large"
        >
          Print Report
        </Button>
      </Box>
    </Paper>
  );
};

export default DataSelectionPage; 