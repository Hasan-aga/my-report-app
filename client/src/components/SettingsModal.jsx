import { Clear, DarkMode, LightMode } from "@mui/icons-material" // Import Clear icon
import {
  Box,
  IconButton,
  Modal,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material"
import React from "react"
import { useSettings } from "../../hooks/useSettings"

const SettingsModal = ({ open, onClose, setTheme, currentTheme }) => {
  const { fontSize, setFontSize } = useSettings()

  const handleFontSizeChange = (event, value) => {
    setFontSize(value)
    localStorage.setItem("fontSize", value) // Save to localStorage
  }

  const handleThemeChange = (event, newTheme) => {
    if (newTheme !== null) {
      setTheme(newTheme)
      localStorage.setItem("theme", newTheme) // Save to localStorage
    }
  }

  const commitSHA = import.meta.env.VITE_COMMIT_SHA || "local-dev"
  const commitMessage =
    import.meta.env.VITE_COMMIT_MESSAGE || "No commit info available"

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}
      >
        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="h6" component="h2" color="text.primary">
            Settings
          </Typography>
          <IconButton title="close" onClick={onClose} color="secondary">
            <Clear /> {/* Use Clear icon instead of button */}
          </IconButton>
        </Box>
        <Stack
          spacing={2}
          direction={"row"}
          justifyContent={"space-between"}
          alignItems="center"
          mt={2}
          color="text.primary"
          whiteSpace="nowrap" // Prevent line breaks
        >
          <Typography>Screen font size</Typography>
          <Slider
            value={fontSize}
            onChange={handleFontSizeChange}
            min={12}
            max={24}
            step={1}
            valueLabelDisplay="auto"
          />
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignContent="center"
          mt={1}
        >
          <Typography color="text.primary">Theme</Typography>
          <ToggleButtonGroup
            size="small"
            value={currentTheme}
            exclusive
            onChange={handleThemeChange}
            aria-label="Theme selection"
          >
            <ToggleButton
              value="light"
              aria-label="Light theme"
              title="Light Theme"
            >
              <LightMode />
            </ToggleButton>
            <ToggleButton
              value="dark"
              aria-label="Dark theme"
              title="Dark Theme"
            >
              <DarkMode />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Typography variant="h6" color="text.secondary" mt={2}>
          About
        </Typography>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignContent="center"
          mt={1}
        >
          <Typography variant="caption" color="text.secondary">
            Commit SHA
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {commitSHA}
          </Typography>
        </Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignContent="center"
          mt={2}
        >
          <Typography variant="caption" color="text.secondary">
            Commit Message
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {commitMessage}
          </Typography>
        </Stack>
      </Box>
    </Modal>
  )
}

export default SettingsModal
