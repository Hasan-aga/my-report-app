import MicIcon from "@mui/icons-material/Mic"
import { IconButton, Tooltip } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"

// Extended type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Simple interfaces for events if needed, or just use any in the implementation
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscript
}) => {
  const [isListening, setIsListening] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const recognitionRef = useRef<any>(null)

  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  // Initialize speech recognition
  useEffect(() => {
    const initSpeechRecognition = async () => {
      try {
        // Check browser support
        const isSupported =
          "webkitSpeechRecognition" in window || "SpeechRecognition" in window
        setIsSupported(isSupported)

        if (!isSupported) {
          setError("Speech recognition not supported in your browser")
          return
        }

        // Request microphone permission
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (err) {
          setError("Microphone access denied")
          return
        }

        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()

        if (recognitionRef.current) {
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = "en-US"

          recognitionRef.current.onstart = () => setIsListening(true)
          recognitionRef.current.onend = () => setIsListening(false)

          recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error)
            setIsListening(false)
            if (event.error !== "aborted") {
              setError(`Error: ${event.error}`)
            }
          }

          recognitionRef.current.onresult = (event: any) => {
            let transcript = ""

            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript
              }
            }
            if (transcript) {
              onTranscriptRef.current(transcript)
            }
          }
        }
      } catch (err) {
        console.error("Speech recognition initialization error:", err)
        setError("Failed to initialize speech recognition")
      }
    }

    initSpeechRecognition()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleSpeechToText = () => {
    if (error) {
      setError(null)
    }

    if (!isSupported) {
      setError("Feature not supported in your browser")
      return
    }

    const recognition = recognitionRef.current
    if (!recognition) {
      setError("Speech recognition not initialized")
      return
    }

    try {
      if (isListening) {
        recognition.stop()
      } else {
        recognition.start()
      }
    } catch (err) {
      console.error("Speech recognition error:", err)
      setError("Error accessing microphone")
    }
  }

  return (
    <Tooltip
      title={error || (isListening ? "Stop recording" : "Start recording")}
      placement="top"
    >
      <IconButton
        size="small"
        onClick={handleSpeechToText}
        color={isListening ? "error" : "primary"}
        sx={{
          borderRadius: "50%",
          p: 1.5,
          transition: "all 0.3s ease",
          ...(isListening && {
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(244, 67, 54, 0.7)" },
              "70%": { boxShadow: "0 0 0 10px rgba(244, 67, 54, 0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(244, 67, 54, 0)" }
            }
          }),
          ...(error && {
            color: "warning.main"
          })
        }}
        disabled={!isSupported}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        <MicIcon fontSize="medium" />
      </IconButton>
    </Tooltip>
  )
}

export default SpeechToTextButton
