import React, { createContext, useContext, useState } from "react"
import { UI_FONT_SIZE } from "../src/constants/config"

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("fontSize")
    return savedFontSize ? JSON.parse(savedFontSize) : UI_FONT_SIZE
  }) // Get font size from local storage or use default

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
