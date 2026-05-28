import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { SettingsProvider } from "../hooks/useSettings.jsx"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </SettingsProvider>
)
