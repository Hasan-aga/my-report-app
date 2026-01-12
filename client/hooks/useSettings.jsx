import React, { createContext, useContext, useState } from "react"
import { UI_FONT_SIZE } from "../src/constants/config"

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("fontSize")
    return savedFontSize ? JSON.parse(savedFontSize) : UI_FONT_SIZE
  }) // Get font size from local storage or use default

  const [showAdvancedRecording, setShowAdvancedRecording] = useState(() => {
    const saved = localStorage.getItem("showAdvancedRecording")
    return saved ? JSON.parse(saved) : false
  })

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        showAdvancedRecording,
        setShowAdvancedRecording
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
