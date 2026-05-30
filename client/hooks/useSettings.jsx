import React, { createContext, useContext, useMemo, useState } from "react"
import { PRINT_MODE, UI_FONT_SIZE } from "../src/constants/config"

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const savedFontSize = localStorage.getItem("fontSize")
    return savedFontSize ? JSON.parse(savedFontSize) : UI_FONT_SIZE
  })

  const [showAdvancedRecording, setShowAdvancedRecording] = useState(() => {
    const saved = localStorage.getItem("showAdvancedRecording")
    return saved ? JSON.parse(saved) : false
  })

  const [showSaveReport, setShowSaveReport] = useState(() => {
    const saved = localStorage.getItem("showSaveReport")
    return saved ? JSON.parse(saved) : false
  })

  const [showCardFindings, setShowCardFindings] = useState(() => {
    const saved = localStorage.getItem("showCardFindings")
    return saved ? JSON.parse(saved) : false
  })

  const [easyNavigationButtons, setEasyNavigationButtons] = useState(() => {
    const saved = localStorage.getItem("easyNavigationButtons")
    return saved ? JSON.parse(saved) : false
  })

  const [printMode, setPrintMode] = useState(() => {
    const saved = localStorage.getItem("printMode")
    return saved || PRINT_MODE.NATIVE
  })

  const value = useMemo(() => ({
    fontSize,
    setFontSize,
    showAdvancedRecording,
    setShowAdvancedRecording,
    showSaveReport,
    setShowSaveReport,
    showCardFindings,
    setShowCardFindings,
    easyNavigationButtons,
    setEasyNavigationButtons,
    printMode,
    setPrintMode
  }), [fontSize, showAdvancedRecording, showSaveReport, showCardFindings, easyNavigationButtons, printMode])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
