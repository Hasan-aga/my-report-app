// client/src/App.jsx
import Settings from "@mui/icons-material/Settings";
import {
  Box,
  IconButton,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSettings } from "../hooks/useSettings";
import "./App.css";
import ReportGeneratorPage from "./components/ReportGeneratorPage";
import { darkTheme, lightTheme } from "./themes";
import ErrorBoundary from "./components/ErrorBoundary";

const SettingsModal = lazy(() => import("./components/SettingsModal"));

function App() {
  const { fontSize } = useSettings();
  const [openSettings, setOpenSettings] = useState(false);
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme(
        mode === "light" ? lightTheme(fontSize) : darkTheme(fontSize),
      ),
    [mode, fontSize],
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            backgroundColor: "background.default",
            overflow: "hidden",
          }}
        >
          {!isMobile && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                gap: 1,
              }}
            >
              <IconButton
                onClick={() => setOpenSettings(true)}
                color={theme.palette.text.primary}
              >
                <Settings />
              </IconButton>
            </Box>
          )}
          {openSettings && (
            <Suspense fallback={null}>
              <SettingsModal
                currentTheme={mode}
                setTheme={setMode}
                open={openSettings}
                onClose={() => setOpenSettings(false)}
              />
            </Suspense>
          )}
          <ReportGeneratorPage onOpenSettings={() => setOpenSettings(true)} />
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
