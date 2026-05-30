import {
  ArrowBack,
  ArrowForward,
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
import { useCallback, useEffect, useState } from "react";
import { PDF_TEMPLATE_PATH, PRINT_PLATFORM, REPORT_DATA } from "../constants/config";
import { useSettings } from "../../hooks/useSettings";
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
  const { showCardFindings, easyNavigationButtons } = useSettings();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentFindingIndex, setCurrentFindingIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [patientName, setPatientName] = useState("");
  const [findings, setFindings] = useState([]);
  const [error, setError] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

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
      setCurrentFindingIndex(0);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!easyNavigationButtons || !window.visualViewport) return;
    const handle = () => {
      const vv = window.visualViewport;
      setKeyboardOffset(Math.max(0, window.innerHeight - vv.height));
    };
    window.visualViewport.addEventListener("resize", handle);
    return () => window.visualViewport.removeEventListener("resize", handle);
  }, [easyNavigationButtons]);

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
    if (findings.filter((f) => f.text.trim() !== "").length === 0) return;
    setPrinting(true);
    try {
      const { default: PDFService } = await import("../services/PDFService");
      const selectedData = [
        {
          category: categoryData.name,
          findings: findings.filter((f) => f.text.trim() !== "").map((f) => f.text),
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
      await PDFService.printPDF(pdfBytes, PRINT_PLATFORM.MOBILE);
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

  const handlePrevCard = () => {
    if (currentFindingIndex > 0) {
      setCurrentFindingIndex((prev) => prev - 1);
    } else {
      goToStep(0);
    }
  };

  const handleNextCard = () => {
    if (currentFindingIndex < findings.length - 1) {
      setCurrentFindingIndex((prev) => prev + 1);
    } else {
      goToStep(2);
    }
  };

  const handleCardFindingChange = (newText) => {
    setFindings((prev) => {
      const updated = [...prev];
      updated[currentFindingIndex] = { ...updated[currentFindingIndex], text: newText };
      return updated;
    });
  };

  const handleRemoveFindingFromCard = () => {
    const idx = currentFindingIndex;
    const newFindings = findings.filter((_, i) => i !== idx);
    setFindings(newFindings);
    if (idx >= newFindings.length && newFindings.length > 0) {
      setCurrentFindingIndex(newFindings.length - 1);
    } else if (newFindings.length === 0) {
      setCurrentFindingIndex(0);
    }
  };

  const handleAddFindingFromReview = () => {
    const nextIndex = findings.length;
    setFindings((prev) => [...prev, { text: "", id: generateId() }]);
    setCurrentFindingIndex(nextIndex);
    goToStep(1);
  };

  const stepLabels = ["Select Category", "Edit Findings", "Review & Print"];

  return (
    <Box
      className="mobile-flow"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        pb: keyboardOffset > 0 ? `${keyboardOffset}px` : undefined,
        transition: easyNavigationButtons ? "padding-bottom 0.15s" : undefined,
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

              {showCardFindings ? (
                <>
                  {findings.length > 0 && currentFindingIndex < findings.length ? (
                    <div className="findings-card"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#f8f9fa",
                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"
                        }`,
                      }}
                    >
                      <textarea
                        value={findings[currentFindingIndex]?.text || ""}
                        onChange={(e) =>
                          handleCardFindingChange(e.target.value)
                        }
                        placeholder="Enter finding..."
                        style={{
                          color: "inherit",
                          width: "100%",
                          resize: "vertical",
                        }}
                      />

                    </div>
                  ) : (
                    <p>No findings available</p>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </Box>

          {/* CARD 3: Review & Print */}
          <Box className="mobile-card">
            <div className="review-content">
              <div className="review-actions-row">
                <button
                  className="print-button-large"
                  disabled={findings.filter((f) => f.text.trim() !== "").length === 0 || printing}
                  onClick={handlePrint}
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  <Print fontSize="small" /> {printing ? "Printing..." : "Print Report"}
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
                  <Home fontSize="small" /> Home
                </button>
              </div>

              <p className="review-summary">
                {categoryData?.name} report with {findings.filter((f) => f.text.trim() !== "").length} finding
                {findings.length !== 1 ? "s" : ""}
                {patientName ? ` for ${patientName}` : ""}
              </p>

              {findings.filter(f => f.text.trim() !== "").length > 0 && (
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
                    {findings.filter(f => f.text.trim() !== "").map((f, i) => (
                      <li key={i}>{f.text}</li>
                    ))}
                  </ul>
                </div>
              )}
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
        {showCardFindings && currentStep === 1 && findings.length > 0 ? (
          <>
            <button
              className="mobile-nav-btn mobile-nav-btn-back"
              onClick={handlePrevCard}
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)",
                color: "inherit",
              }}
            >
              <ArrowBack fontSize="small" />
            </button>

            <span
              style={{
                fontSize: "0.85rem",
                opacity: 0.6,
                display: "flex",
                alignItems: "center",
              }}
            >
              Finding {currentFindingIndex + 1} of {findings.length}
            </span>

            <button
              className="mobile-nav-btn mobile-nav-btn-forward"
              onClick={handleNextCard}
              style={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              <ArrowForward fontSize="small" />
            </button>
          </>
        ) : (
          <>
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
                disabled
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                  color: isDark
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.2)",
                  opacity: 0.4,
                }}
              >
                Next <ArrowForward fontSize="small" />
              </button>
            )}
          </>
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
