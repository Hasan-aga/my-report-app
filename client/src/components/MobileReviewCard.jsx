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
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
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
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuFindingId, setMenuFindingId] = useState(null);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const filteredFindings = findings.filter((f) => f.text.trim() !== "");
  const editingFinding = editingFindingId
    ? findings.find((f) => f.id === editingFindingId)
    : null;

  const handleOpenMenu = (id, event) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuFindingId(id);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuFindingId(null);
  };

  const handleEditFromMenu = () => {
    const finding = findings.find((f) => f.id === menuFindingId);
    if (finding) {
      setEditingFindingId(finding.id);
      setEditingText(finding.text);
    }
    handleCloseMenu();
  };

  const handleDeleteFromMenu = (id) => {
    const updated = findings.filter((f) => f.id !== id);
    onFindingsChange(updated);
    if (editingFindingId === id) {
      setEditingFindingId(null);
      setEditingText("");
    }
    handleCloseMenu();
  };

  const handleModalTextChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleCommitEdit = () => {
    if (editingFindingId) {
      const finding = findings.find((f) => f.id === editingFindingId);
      if (finding && editingText.trim() === "") {
        onFindingsChange(findings.filter((f) => f.id !== editingFindingId));
      } else if (finding) {
        onFindingsChange(
          findings.map((f) =>
            f.id === editingFindingId ? { ...f, text: editingText } : f,
          ),
        );
      }
    }
    setEditingFindingId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    if (editingFindingId) {
      const finding = findings.find((f) => f.id === editingFindingId);
      if (finding && editingText !== finding.text) {
        setDiscardDialogOpen(true);
      } else {
        setEditingFindingId(null);
        setEditingText("");
      }
    }
  };

  const handleRequestClose = () => {
    if (editingFinding) {
      if (editingText !== editingFinding.text) {
        setDiscardDialogOpen(true);
      } else {
        setEditingFindingId(null);
        setEditingText("");
      }
    }
  };

  const handleDiscard = () => {
    setEditingFindingId(null);
    setEditingText("");
    setDiscardDialogOpen(false);
  };

  const handleSaveDiscard = () => {
    handleCommitEdit();
    setDiscardDialogOpen(false);
  };

  const handleAddFinding = () => {
    const id = generateId();
    const newFinding = { text: "", id };
    onFindingsChange([...findings, newFinding]);
    setEditingFindingId(id);
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
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="review-finding-card"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "#f8f9fa",
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
                  }`,
                }}
              >
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
                  onClick={(e) => handleOpenMenu(finding.id, e)}
                  aria-label="Finding options"
                  sx={{ flexShrink: 0 }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </div>
            ))}

            <button
              className="review-add-btn"
              onClick={handleAddFinding}
              aria-label="Add finding"
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
                {filteredFindings.map((f) => (
                  <li key={f.id}>{f.text}</li>
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
          <MenuItem onClick={() => handleDeleteFromMenu(menuFindingId)}>
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={editingFindingId !== null}
          onClose={handleRequestClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 2 },
          }}
        >
          <DialogTitle>Edit Finding</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              multiline
              minRows={4}
              maxRows={12}
              fullWidth
              variant="outlined"
              placeholder="Enter finding..."
              value={editingText}
              onChange={handleModalTextChange}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRequestClose}>Cancel</Button>
            <Button onClick={handleCommitEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

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
