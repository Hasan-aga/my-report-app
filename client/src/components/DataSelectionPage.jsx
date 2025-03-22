import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Add,
  Clear,
  Download,
  DragHandle,
  Edit,
  Print
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Typography
} from "@mui/material"
import { useEffect, useState } from "react"
import { REPORT_DATA } from "../constants/config"
import PDFService from "../services/PDFService"
import SettingsModal from "./SettingsModal"
import TextEditor from "./TextEditor"

// A component to render the Draggable item
const SortableItem = ({
  finding,
  index,
  handleFindingChange,
  handleRemoveFinding,
  handleEditFinding
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: finding.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab"
  }
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "") {
      e.preventDefault()
      handleRemoveFinding(index)
    }
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        px: 2,
        py: 1,
        "&:hover": {
          bgcolor: "action.hover"
        }
      }}
    >
      <ListItemButton
        {...listeners}
        {...attributes}
        sx={{ cursor: "grab", width: "30px" }}
      >
        <DragHandle fontSize="small" />
      </ListItemButton>
      <ListItemText
        primary={
          <TextField
            fullWidth
            variant="standard"
            value={finding.text}
            onChange={(e) => handleFindingChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            autoFocus={index === 0 && finding.text === ""} // Only autoFocus first item when it is empty
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
  )
}

const DataSelectionPage = ({ category, templatePath }) => {
  const [findings, setFindings] = useState([])
  const [error, setError] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [activeId, setActiveId] = useState(null)

  const categoryData = REPORT_DATA[category]

  // Initialize findings from category data
  useEffect(() => {
    if (categoryData?.findings) {
      setFindings(
        categoryData.findings.map((finding) => ({
          text: finding,
          id: crypto.randomUUID()
        }))
      )
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
    setFindings((prev) => [...prev, { text: "", id: crypto.randomUUID() }])
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

  const handlePrint = async () => {
    try {
      const selectedData = [
        {
          category: categoryData.name,
          findings: findings.map((f) => f.text),
          patientName: patientName
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
          patientName: patientName
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFindings((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setActiveId(null)
  }

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
  }
  const arrayMove = (arr, oldIndex, newIndex) => {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1
      while (k--) {
        arr.push(undefined)
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0])
    return arr
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

      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            {categoryData.name} Findings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Edit or add findings for your report
          </Typography>
        </Box>
        <Box sx={{ width: "400px" }}>
          <TextField
            fullWidth
            label="Patient Name (Optional)"
            variant="outlined"
            size="small"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            inputProps={{
              "aria-label": "Patient Name",
              "aria-describedby": "patient-name-description"
            }}
          />
        </Box>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <SortableContext
              items={findings.map((finding) => finding.id)}
              strategy={verticalListSortingStrategy}
            >
              <List sx={{ width: "100%", overflow: "auto" }}>
                {findings.map((finding, index) => (
                  <SortableItem
                    key={finding.id}
                    finding={finding}
                    index={index}
                    handleFindingChange={handleFindingChange}
                    handleRemoveFinding={handleRemoveFinding}
                    handleEditFinding={handleEditFinding}
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>

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

      <SettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    </Paper>
  )
}

export default DataSelectionPage
