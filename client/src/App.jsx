import { Brightness4, Brightness7 } from "@mui/icons-material"
import { Box, IconButton, ThemeProvider, createTheme } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import ReportGeneratorPage from "./components/ReportGeneratorPage"
import { darkTheme, lightTheme } from "./themes"

function App() {
  const [mode, setMode] = useState(() => {
    // Get saved theme from localStorage or default to light
    return localStorage.getItem("theme") || "light"
  })

  // Save theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", mode)
  }, [mode])

  const theme = useMemo(
    () => createTheme(mode === "light" ? lightTheme : darkTheme),
    [mode]
  )

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

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
        <IconButton
          onClick={toggleTheme}
          color={theme.palette.text.primary}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <ReportGeneratorPage />
      </Box>
    </ThemeProvider>
  )
}

export default App
