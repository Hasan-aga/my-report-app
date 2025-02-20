import { Add, Download, Print } from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme
} from "@mui/material"
import { useState } from "react"
import { REPORT_DATA } from "../constants/config"
import PDFService from "../services/PDFService"

const DataSelectionPage = ({ category, templatePath }) => {
  const [selectedFindings, setSelectedFindings] = useState([])
  const [editedFindings, setEditedFindings] = useState({})
  const [notes, setNotes] = useState("")
  const [error, setError] = useState(null)
  const [customFindings, setCustomFindings] = useState([])
  const theme = useTheme()

  const categoryData = REPORT_DATA[category]
  const allFindings = [...(categoryData?.findings || []), ...customFindings]

  const handleCheckboxChange = (finding) => {
    setSelectedFindings((prev) => {
      if (prev.includes(finding)) {
        return prev.filter((f) => f !== finding)
      } else {
        return [...prev, finding]
      }
    })
  }

  const handleFindingEdit = (originalFinding, newText) => {
    setEditedFindings((prev) => ({
      ...prev,
      [originalFinding]: newText
    }))
  }

  const getFindingText = (finding) => {
    return editedFindings[finding] || finding
  }

  const handleAddNewFinding = () => {
    const newFinding = ""
    setCustomFindings((prev) => [...prev, newFinding])
    setSelectedFindings((prev) => [...prev, newFinding])
    // Focus will be handled by autoFocus prop on TextField
  }

  const handlePrint = async () => {
    try {
      console.log("Print request:", {
        templatePath,
        category,
        selectedFindings
      })

      const finalFindings = selectedFindings.map((finding) =>
        getFindingText(finding)
      )

      const selectedData =
        finalFindings.length == 0
          ? [{ category: "", findings: [], notes: notes.trim() }]
          : [
              {
                category: categoryData.name,
                findings: finalFindings,
                notes: notes.trim()
              }
            ]

      if (!templatePath) {
        throw new Error(
          "No template selected. Please select a template in settings."
        )
      }

      const pdfBytes = await PDFService.fillTemplate(templatePath, selectedData)

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error("Generated PDF is empty")
      }

      await PDFService.printPDF(pdfBytes)
    } catch (error) {
      console.error("Print error:", error)
      setError(error.message)
    }
  }

  const handleSave = async () => {
    try {
      const finalFindings = selectedFindings.map((finding) =>
        getFindingText(finding)
      )
      const selectedData = [
        {
          category: categoryData.name,
          findings: finalFindings,
          notes: notes.trim()
        }
      ]

      const pdfBytes = await PDFService.fillTemplate(templatePath, selectedData)

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${categoryData.name}_Report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Save error:", error)
      setError(error.message)
    }
  }

  if (!category) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Typography variant="h5" color="text.secondary" align="center">
          Select a category to start generating your report
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{ p: 3, height: "90vh", display: "flex", flexDirection: "column" }}
    >
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden"
          }}
        >
          <List sx={{ width: "100%", overflow: "auto" }}>
            {allFindings.map((finding) => (
              <ListItem key={finding} disablePadding>
                <Checkbox
                  checked={selectedFindings.includes(finding)}
                  onChange={() => handleCheckboxChange(finding)}
                  sx={{
                    ml: 1,
                    color: theme.palette.primary.main,
                    "&.Mui-checked": {
                      color: theme.palette.primary.main
                    }
                  }}
                />
                <ListItemText
                  primary={
                    <TextField
                      fullWidth
                      variant="standard"
                      defaultValue={finding}
                      onBlur={(e) => handleFindingEdit(finding, e.target.value)}
                      autoFocus={
                        finding === allFindings[allFindings.length - 1] &&
                        customFindings.includes(finding)
                      }
                      InputProps={{
                        disableUnderline: !selectedFindings.includes(finding),
                        style: {
                          opacity: 1 // Full opacity always
                        }
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          cursor: selectedFindings.includes(finding)
                            ? "text"
                            : "default",
                          "&.Mui-disabled": {
                            color: "text.primary", // Keep same color when disabled
                            WebkitTextFillColor: "text.primary", // Override WebKit default
                            opacity: 1 // Keep full opacity when disabled
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

          <Button
            onClick={handleAddNewFinding}
            startIcon={<Add fontSize="small" />}
            sx={{
              borderRadius: 0,
              py: 0.5,
              fontSize: "0.875rem",
              minHeight: 40
            }}
            size="small"
            color={theme.palette.primary.main}
          >
            Add Finding
          </Button>
        </Box>

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

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonGroup variant="contained">
            <Button
              color="secondary"
              startIcon={<Download />}
              onClick={handleSave}
              size="large"
              disabled={selectedFindings.length === 0}
            >
              Save Report
            </Button>
            <Button
              color="primary"
              startIcon={<Print />}
              onClick={handlePrint}
              size="large"
              disabled={selectedFindings.length === 0}
            >
              Print Report
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Paper>
  )
}

export default DataSelectionPage
