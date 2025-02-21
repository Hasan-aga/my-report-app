import { Check, Clear } from "@mui/icons-material"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField
} from "@mui/material"
import React, { useEffect, useState } from "react"

const TextEditor = ({ initialText, onSave, onCancel }) => {
  const [text, setText] = useState(initialText)

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  const handleSave = () => {
    onSave(text)
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="md"
      sx={{ borderRadius: 0 }}
    >
      <DialogTitle>Edit Finding</DialogTitle>
      <DialogContent sx={{ minWidth: 600, minHeight: 400 }}>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <IconButton onClick={onCancel} color="inherit" aria-label="Cancel">
          <Clear />
        </IconButton>
        <IconButton onClick={handleSave} color="primary" aria-label="Save">
          <Check />
        </IconButton>
      </DialogActions>
    </Dialog>
  )
}

export default TextEditor
