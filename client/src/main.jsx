import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "../hooks/useSettings.jsx"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SettingsProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </SettingsProvider>
  </BrowserRouter>
)
