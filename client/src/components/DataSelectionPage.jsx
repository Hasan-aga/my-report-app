import { Add, Clear, Edit, Download, Print } from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useTheme
} from "@mui/material"
import { useEffect, useState } from "react"
import { REPORT_DATA } from "../constants/config"
import PDFService from "../services/PDFService"
import TextEditor from "./TextEditor"

const DataSelectionPage = ({ category, templatePath }) => {
  const [findings, setFindings] = useState([])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const theme = useTheme()

  const categoryData = REPORT_DATA[category]

  // Initialize findings from category data
  useEffect(() => {
    if (categoryData?.findings) {
      setFindings(categoryData.findings.map((finding) => ({ text: finding })))
    }
  }, [category])

  const handleFindingChange = (index, newText) => {
    setFindings((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], text: newText }
      return updated.filter((finding) => finding.text.trim() !== "") // Remove empty findings
    })
  }

  const handleAddNewFinding = () => {
    setFindings((prev) => [...prev, { text: "" }])
  }

  const handleRemoveFinding = (index) => {
    setFindings((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEditFinding = (index) => {
    setEditingIndex(index)
    setShowEditor(true)
  }

  const handleEditorSave = (newText) => {
    handleFindingChange(editingIndex, newText)
    setShowEditor(false)
    setEditingIndex(null)
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setEditingIndex(null)
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "") {
      e.preventDefault()
      handleRemoveFinding(index)
    }
  }

  const handlePrint = async () => {
    try {
      const selectedData = [
        {
          category: categoryData.name,
          findings: findings.map((f) => f.text),
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
      const selectedData = [
        {
          category: categoryData.name,
          findings: findings.map((f) => f.text),
          notes: notes.trim()
        }
      ]

      const pdfBytes = await PDFService.fillTemplate(templatePath, selectedData)
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
          Edit or add findings for your report
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
            {findings.map((finding, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 2,
                  py: 1,
                  "&:hover": {
                    bgcolor: "action.hover"
                  }
                }}
              >
                <ListItemText
                  primary={
                    <TextField
                      fullWidth
                      variant="standard"
                      value={finding.text}
                      onChange={(e) =>
                        handleFindingChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      autoFocus={
                        index === findings.length - 1 && finding.text === ""
                      }
                    />
                  }
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFinding(index)}
                  sx={{ ml: 1 }}
                >
                  <Clear fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEditFinding(index)}
                  sx={{ ml: 1 }}
                >
                  <Edit fontSize="small" />
                </IconButton>
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

        {showEditor && (
          <TextEditor
            initialText={findings[editingIndex]?.text || ""}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        )}

        <Box
          sx={{
            position: "fixed",
            bottom: 35,
            right: 20,
            display: "flex",
            gap: 1
          }}
        >
          <IconButton
            color="secondary"
            onClick={handleSave}
            disabled={findings.length === 0}
            aria-label="Save Report"
            title="Save the report as a PDF"
          >
            <Download />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handlePrint}
            disabled={findings.length === 0}
            aria-label="Print Report"
            title="Print the report"
          >
            <Print />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  )
}

export default DataSelectionPage
