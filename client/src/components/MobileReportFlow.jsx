import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Home,
  Print,
  Settings,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  IconButton,
  Snackbar,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { PDF_TEMPLATE_PATH, REPORT_DATA } from "../constants/config";
import PDFService from "../services/PDFService";
import "./MobileReportFlow.css";

// Simple unique ID generator that works on all browsers/devices
let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `id-${Date.now().toString(36)}-${idCounter}`;
};

const TOTAL_STEPS = 3;

const MobileReportFlow = ({ onOpenSettings }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [patientName, setPatientName] = useState("");
  const [findings, setFindings] = useState([]);
  const [error, setError] = useState(null);
  const [printing, setPrinting] = useState(false);

  const categoryKeys = Object.keys(REPORT_DATA);
  const categoryData = REPORT_DATA[selectedCategory];

  // Reset findings when category changes (starts a new editing session)
  useEffect(() => {
    if (selectedCategory && categoryData?.findings) {
      setFindings(
        categoryData.findings.map((text) => ({
          id: generateId(),
          text,
        })),
      );
    }
  }, [selectedCategory]);

  const goToStep = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, TOTAL_STEPS - 1)));
  }, []);

  const handleCategorySelect = (key) => {
    setSelectedCategory(key);
    goToStep(1);
  };

  const handleFindingChange = (index, newText) => {
    setFindings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text: newText };
      return updated.filter((f) => f.text.trim() !== "");
    });
  };

  const handleAddFinding = () => {
    setFindings((prev) => [...prev, { text: "", id: generateId() }]);
  };

  const handleRemoveFinding = (index) => {
    setFindings((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePrint = async () => {
    if (findings.length === 0) return;
    setPrinting(true);
    try {
      const selectedData = [
        {
          category: categoryData.name,
          findings: findings.map((f) => f.text),
          patientName,
        },
      ];
      const pdfBytes = await PDFService.fillTemplate(
        PDF_TEMPLATE_PATH,
        selectedData,
      );
      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error("Generated PDF is empty");
      }
      await PDFService.printPDF(pdfBytes);
      // Return to card 1 after printing
      goToStep(0);
    } catch (err) {
      console.error("Print error:", err);
      setError(err.message);
    } finally {
      setPrinting(false);
    }
  };

  const handleGoHome = () => {
    goToStep(0);
  };

  const stepLabels = ["Select Category", "Edit Findings", "Review & Print"];

  return (
    <Box
      className="mobile-flow"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Header */}
      <Box
        className="mobile-header"
        sx={{
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box className="mobile-header-left">
          <Typography className="mobile-header-title" variant="h6">
            Report Generator
          </Typography>
        </Box>
        <Box className="mobile-header-right">
          <IconButton
            size="small"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <Settings fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Card Track */}
      <Box className="mobile-card-container">
        <Box
          className="mobile-card-track"
          sx={{
            transform: `translateX(-${currentStep * 100}%)`,
          }}
        >
          {/* CARD 1: Category Selection */}
          <Box className="mobile-card">
            <div className="category-select-content">
              <h2>Select Report Type</h2>
              <p>Choose a category to start generating your report</p>
              {categoryKeys.map((key) => {
                const cat = REPORT_DATA[key];
                return (
                  <div
                    key={key}
                    className="mobile-category-card"
                    onClick={() => handleCategorySelect(key)}
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "#fff",
                      boxShadow: isDark
                        ? "0 2px 8px rgba(0,0,0,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <h3 style={{ color: theme.palette.primary.main }}>
                      {cat.name}
                    </h3>
                    <p>{cat.findings.length} findings available</p>
                  </div>
                );
              })}
            </div>
          </Box>

          {/* CARD 2: Findings Editor */}
          <Box className="mobile-card">
            <div className="findings-editor-content">
              <h2>{categoryData?.name || "Category"} Findings</h2>

              <TextField
                fullWidth
                label="Patient Name (Optional)"
                variant="outlined"
                size="small"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                sx={{ flexShrink: 0 }}
              />

              <div className="findings-list">
                {findings.map((finding, index) => (
                  <div
                    key={finding.id}
                    className="mobile-finding-item"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#f8f9fa",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  >
                    <textarea
                      value={finding.text}
                      onChange={(e) =>
                        handleFindingChange(index, e.target.value)
                      }
                      placeholder="Enter finding..."
                      rows={2}
                      style={{ color: "inherit" }}
                    />
                    <div className="mobile-finding-actions">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFinding(index)}
                        aria-label="Remove finding"
                        sx={{ fontSize: "16px" }}
                      >
                        <span>✕</span>
                      </IconButton>
                    </div>
                  </div>
                ))}
                <button
                  className="mobile-add-finding"
                  onClick={handleAddFinding}
                  style={{
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  }}
                >
                  + Add Finding
                </button>
              </div>
            </div>
          </Box>

          {/* CARD 3: Review & Print */}
          <Box className="mobile-card">
            <div className="review-content">
              <CheckCircle
                sx={{ fontSize: 56, color: theme.palette.primary.main }}
              />
              <h2>Ready to Print</h2>
              <p className="review-summary">
                {categoryData?.name} report with {findings.length} finding
                {findings.length !== 1 ? "s" : ""}
                {patientName ? ` for ${patientName}` : ""}
              </p>

              {findings.length > 0 && (
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
                    {findings.map((f, i) => (
                      <li key={i}>{f.text}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="print-button-large"
                disabled={findings.length === 0 || printing}
                onClick={handlePrint}
                style={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <Print /> {printing ? "Printing..." : "Print Report"}
              </button>

              <button
                className="home-button"
                onClick={handleGoHome}
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                  color: "inherit",
                }}
              >
                <Home fontSize="small" /> Back to Categories
              </button>
            </div>
          </Box>
        </Box>
      </Box>

      {/* Step Dots */}
      <Box className="mobile-step-dots">
        {[0, 1, 2].map((step) => (
          <div
            key={step}
            className={`mobile-step-dot ${currentStep === step ? "active" : ""}`}
            style={{
              backgroundColor:
                currentStep === step
                  ? theme.palette.primary.main
                  : isDark
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </Box>

      {/* Navigation Arrows */}
      <Box
        className="mobile-nav-arrows"
        sx={{
          bgcolor: "background.paper",
          borderTop: `1px solid`,
          borderColor: "divider",
        }}
      >
        <button
          className="mobile-nav-btn mobile-nav-btn-back"
          disabled={currentStep === 0}
          onClick={() => goToStep(currentStep - 1)}
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)",
            color:
              currentStep === 0
                ? isDark
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.2)"
                : "inherit",
            visibility: currentStep === 0 ? "hidden" : "visible",
          }}
        >
          <ArrowBack fontSize="small" /> Back
        </button>

        <span
          style={{
            fontSize: "0.85rem",
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
          }}
        >
          {stepLabels[currentStep]}
        </span>

        {currentStep < TOTAL_STEPS - 1 ? (
          <button
            className="mobile-nav-btn mobile-nav-btn-forward"
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep === 0 && !selectedCategory}
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              opacity: currentStep === 0 && !selectedCategory ? 0.4 : 1,
            }}
          >
            Next <ArrowForward fontSize="small" />
          </button>
        ) : (
          <button
            className="mobile-nav-btn mobile-nav-btn-forward"
            onClick={handleGoHome}
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Home fontSize="small" /> Home
          </button>
        )}
      </Box>

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
    </Box>
  );
};

export default MobileReportFlow;
