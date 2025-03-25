import MicIcon from "@mui/icons-material/Mic"
import { IconButton, Tooltip } from "@mui/material"
import React, { useEffect, useRef, useState } from "react"

// Extended type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  new (): SpeechRecognition
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode
  message: string
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported"

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscript
}) => {
  const [isListening, setIsListening] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

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
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => setIsListening(true)
        recognitionRef.current.onend = () => setIsListening(false)

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
          if (event.error !== "aborted") {
            setError(`Error: ${event.error}`)
          }
        }

        recognitionRef.current.onresult = (event) => {
          let transcript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            console.log(i)

            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript
            }
          }
          if (transcript) {
            onTranscript(transcript)
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
  }, [onTranscript])

  const handleSpeechToText = () => {
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
      <div>
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
            })
          }}
          disabled={!!error || !isSupported}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          <MicIcon fontSize="medium" />
        </IconButton>
      </div>
    </Tooltip>
  )
}

export default SpeechToTextButton
