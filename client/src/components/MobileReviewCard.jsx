import Add from "@mui/icons-material/Add";
import Check from "@mui/icons-material/Check";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import Edit from "@mui/icons-material/Edit";
import Home from "@mui/icons-material/Home";
import MoreVert from "@mui/icons-material/MoreVert";
import Print from "@mui/icons-material/Print";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";

let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `id-${Date.now().toString(36)}-${idCounter}`;
};

const MobileReviewCard = ({
  findings,
  categoryData,
  patientName,
  editableReviewFindings,
  onFindingsChange,
  onPrint,
  printing,
  isDark,
  theme,
  onGoHome,
}) => {
  const [editingFindingIndex, setEditingFindingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuFindingIndex, setMenuFindingIndex] = useState(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const filteredFindings = findings.filter((f) => f.text.trim() !== "");

  const handleOpenMenu = (index, event) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuFindingIndex(index);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuFindingIndex(null);
  };

  const handleEditFromMenu = () => {
    setEditingFindingIndex(menuFindingIndex);
    setEditingText(findings[menuFindingIndex].text);
    handleCloseMenu();
  };

  const handleDeleteFromMenu = (index) => {
    const updated = findings.filter((_, i) => i !== index);
    onFindingsChange(updated);
    if (editingFindingIndex === index) {
      setEditingFindingIndex(null);
      setEditingText("");
    }
    handleCloseMenu();
  };

  const handleUpdateFindingText = (index, text) => {
    const updated = [...findings];
    updated[index] = { ...updated[index], text };
    const cleaned = updated.filter((f) => f.text.trim() !== "");
    onFindingsChange(cleaned);

    if (text.trim() === "") {
      setEditingFindingIndex(null);
      setEditingText("");
    }
  };

  const handleCommitEdit = () => {
    if (editingFindingIndex !== null && findings[editingFindingIndex]?.text.trim() === "") {
      const updated = findings.filter((_, i) => i !== editingFindingIndex);
      onFindingsChange(updated);
    }
    setEditingFindingIndex(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    if (editingFindingIndex === null) return;
    const currentText = findings[editingFindingIndex]?.text || "";
    if (currentText !== editingText) {
      setDiscardDialogOpen(true);
    } else {
      setEditingFindingIndex(null);
      setEditingText("");
    }
  };

  const handleDiscard = () => {
    if (editingFindingIndex !== null) {
      const updated = [...findings];
      updated[editingFindingIndex] = { ...updated[editingFindingIndex], text: editingText };
      onFindingsChange(updated);
    }
    setEditingFindingIndex(null);
    setEditingText("");
    setDiscardDialogOpen(false);
  };

  const handleSaveDiscard = () => {
    handleCommitEdit();
    setDiscardDialogOpen(false);
  };

  const handleAddFinding = () => {
    const newFinding = { text: "", id: generateId() };
    const updated = [...findings, newFinding];
    onFindingsChange(updated);
    setEditingFindingIndex(updated.length - 1);
    setEditingText("");
  };

  return (
    <Box className="mobile-card">
      <div className="review-content">
        <div className="review-actions-row">
          <button
            className="print-button-large"
            disabled={filteredFindings.length === 0 || printing}
            onClick={onPrint}
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Print fontSize="small" /> {printing ? "Printing..." : "Print Report"}
          </button>
          <button
            className="home-button"
            onClick={onGoHome}
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
              color: "inherit",
            }}
          >
            <Home fontSize="small" /> Home
          </button>
        </div>

        <p className="review-summary">
          {categoryData?.name} report with {filteredFindings.length} finding
          {filteredFindings.length !== 1 ? "s" : ""}
          {patientName ? ` for ${patientName}` : ""}
        </p>

        {editableReviewFindings ? (
          <div className="review-editable-findings">
            {filteredFindings.map((finding, i) => (
              <div
                key={finding.id}
                className={`review-finding-card ${editingFindingIndex === i ? "editing" : ""}`}
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#f8f9fa",
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
                  }`,
                }}
              >
                {editingFindingIndex === i ? (
                  <div className="review-finding-edit-area">
                    <textarea
                      value={finding.text}
                      onChange={(e) => handleUpdateFindingText(i, e.target.value)}
                      placeholder="Enter finding..."
                      autoFocus
                      style={{ color: "inherit" }}
                    />
                    <div className="review-finding-edit-actions">
                      <IconButton
                        size="small"
                        onClick={handleCancelEdit}
                        aria-label="Cancel edit"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={handleCommitEdit}
                        aria-label="Confirm edit"
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="review-finding-text">
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {finding.text}
                      </Typography>
                    </div>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(i, e)}
                      aria-label="Finding options"
                      sx={{ flexShrink: 0 }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </>
                )}
              </div>
            ))}

            <button
              className="review-add-btn"
              onClick={handleAddFinding}
              style={{
                color: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
              }}
            >
              <Add fontSize="small" />
            </button>
          </div>
        ) : (
          filteredFindings.length > 0 && (
            <div
              className="review-findings-preview"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#f8f9fa",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
                }`,
              }}
            >
              <h4>FINDINGS:</h4>
              <ul>
                {filteredFindings.map((f, i) => (
                  <li key={i}>{f.text}</li>
                ))}
              </ul>
            </div>
          )
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleEditFromMenu}>
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleDeleteFromMenu(menuFindingIndex)}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        <Dialog open={discardDialogOpen} onClose={() => setDiscardDialogOpen(false)}>
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogActions>
            <Button onClick={handleDiscard} color="error">
              Discard
            </Button>
            <Button onClick={handleSaveDiscard} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );
};

export default MobileReviewCard;
