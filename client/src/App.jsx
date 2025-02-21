// client/src/App.jsx
import { Settings } from "@mui/icons-material"
import { Box, IconButton, ThemeProvider, createTheme } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useSettings } from "../hooks/useSettings" // Import useSettings
import "./App.css"
import "./assets/fonts/fonts.css"
import ReportGeneratorPage from "./components/ReportGeneratorPage" // Keep this import
import SettingsModal from "./components/SettingsModal"
import { darkTheme, lightTheme } from "./themes"

function App() {
  const { fontSize } = useSettings() // Get fontSize from context
  const [openSettings, setOpenSettings] = useState(false)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    localStorage.setItem("theme", mode)
  }, [mode])

  const theme = useMemo(
    () =>
      createTheme(
        mode === "light" ? lightTheme(fontSize) : darkTheme(fontSize)
      ),
    [mode, fontSize]
  )

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          backgroundColor: "background.default"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 1
          }}
        >
          <IconButton
            onClick={() => setOpenSettings(true)} // Open settings modal
            color={theme.palette.text.primary}
          >
            <Settings />
          </IconButton>
        </Box>
        <SettingsModal
          currentTheme={mode}
          setTheme={setMode}
          open={openSettings}
          onClose={() => setOpenSettings(false)}
        />
        <ReportGeneratorPage />
      </Box>
    </ThemeProvider>
  )
}

export default App
