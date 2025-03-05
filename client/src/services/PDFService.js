import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, rgb } from "pdf-lib"
import rubik from "../assets/fonts/Rubik.ttf"
import {
  FONT_SIZES,
  PDF_COORDINATES,
  SPACE,
  TITLE_TEXT
} from "../constants/config"

// Helper function for date formatting
const formatDate = (date) => {
  return date
    .toLocaleDateString("en-CA", {
      // en-CA gives yyyy/mm/dd format
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
    .replace(/-/g, "/") // Replace hyphens with slashes
}

// Helper function to wrap text
const wrapText = (text, font, fontSize, startX, endX) => {
  const words = text.split(" ")
  const lines = []
  let currentLine = words[0]
  const maxWidth = endX - startX

  for (let i = 1; i < words.length; i++) {
    const width = font.widthOfTextAtSize(currentLine + " " + words[i], fontSize)
    if (width < maxWidth) {
      currentLine += " " + words[i]
    } else {
      lines.push(currentLine)
      currentLine = words[i]
    }
  }
  lines.push(currentLine)
  return lines
}

class PDFService {
  async loadTemplate(templatePath) {
    const response = await fetch(templatePath)
    const templateBytes = await response.arrayBuffer()
    return await PDFDocument.load(templateBytes)
  }

  async previewPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    return URL.createObjectURL(blob)
  }

  async printPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)

    // Open in a popup window with specific dimensions
    const printWindow = window.open(
      url,
      "Print",
      "width=800,height=600,toolbar=0,scrollbars=1,status=0"
    )

    printWindow.onload = () => {
      printWindow.print()
      URL.revokeObjectURL(url)
    }
  }

  static async fetchAndValidatePDF(url) {
    console.log("Fetching PDF from:", url)

    try {
      const response = await fetch(url)
      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response:", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Verify content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/pdf")) {
        throw new Error(`Invalid content type: ${contentType}`)
      }

      const pdfBuffer = await response.arrayBuffer()
      console.log("PDF bytes received:", pdfBuffer.byteLength)

      if (pdfBuffer.byteLength === 0) {
        throw new Error("Received empty PDF file")
      }

      return pdfBuffer
    } catch (error) {
      console.error("Error fetching PDF:", error)
      throw error
    }
  }

  static async getTemplate(templatePath) {
    const pdfBuffer = await this.fetchAndValidatePDF(templatePath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    return await pdfDoc.save()
  }

  static async fillTemplate(templatePath, data) {
    try {
      const pdfBuffer = await this.fetchAndValidatePDF(templatePath)
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      pdfDoc.registerFontkit(fontkit)
      const page = pdfDoc.getPages()[0]
      const fontBytes = await fetch(rubik)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch font: ${res.statusText}`)
          }
          return res.arrayBuffer()
        })
        .catch((error) => {
          console.error("Error fetching font:", error)
          throw error
        })

      const font = await pdfDoc.embedFont(fontBytes)
      const currentDate = new Date().toLocaleDateString("en-CA")
      const formattedDate = currentDate.replace(/-/g, "/")

      page.drawText(formattedDate, {
        x: PDF_COORDINATES.date.x,
        y: PDF_COORDINATES.date.y,
        font,
        size: 12
      })

      // Draw patient name
      if (data[0]?.patientName) {
        const patientName = data[0].patientName
        const textWidth = font.widthOfTextAtSize(
          patientName,
          FONT_SIZES.content
        )
        const adjustedX = PDF_COORDINATES.patient.x - 2 * textWidth

        page.drawText(patientName, {
          x: adjustedX,
          y: PDF_COORDINATES.patient.y,
          font,
          size: FONT_SIZES.content
        })
      }

      const { width } = page.getSize()
      const startX = PDF_COORDINATES.data.x
      const endX = width - startX
      let currentY = PDF_COORDINATES.data.y

      // Draw category
      if (data[0]?.category) {
        const categoryLines = wrapText(
          TITLE_TEXT + data[0].category,
          font,
          FONT_SIZES.title,
          startX,
          endX
        )

        categoryLines.forEach((line, index) => {
          page.drawText(line, {
            x: startX,
            y: currentY - index * SPACE,
            size: FONT_SIZES.title,
            font,
            color: rgb(0, 0, 0)
          })
        })
        currentY -= categoryLines.length * SPACE + SPACE
      }

      // Draw findings
      if (data[0]?.findings) {
        let currentPage = page

        for (const finding of data[0].findings) {
          // Split finding into paragraphs by line breaks
          const paragraphs = finding.split("\n")
          let totalLines = []

          // Wrap each paragraph separately
          paragraphs.forEach((paragraph) => {
            const wrappedLines = wrapText(
              paragraph.trim(),
              font,
              FONT_SIZES.content,
              startX,
              endX - 20
            )
            totalLines = [...totalLines, ...wrappedLines]
            // Add an empty line between paragraphs if this isn't the last paragraph
            if (paragraph !== paragraphs[paragraphs.length - 1]) {
              totalLines.push("")
            }
          })

          // Check if we need a new page
          const requiredHeight = totalLines.length * SPACE + SPACE
          if (currentY - requiredHeight < SPACE * 2) {
            currentPage = pdfDoc.addPage()
            currentY = PDF_COORDINATES.data.y
          }

          // Draw bullet point at the top of the finding
          currentPage.drawText("•", {
            x: startX - 15,
            y: currentY,
            size: FONT_SIZES.content,
            font,
            color: rgb(0, 0, 0)
          })

          // Draw all lines
          totalLines.forEach((line, index) => {
            if (line !== "") {
              // Skip drawing empty lines (paragraph breaks)
              currentPage.drawText(line, {
                x: startX,
                y: currentY - index * SPACE,
                size: FONT_SIZES.content,
                font,
                color: rgb(0, 0, 0)
              })
            }
          })

          currentY -= totalLines.length * SPACE + SPACE
        }

        // Draw notes if they exist
        if (data[0]?.notes) {
          const noteLines = wrapText(
            data[0].notes,
            font,
            FONT_SIZES.notes,
            startX,
            endX
          )

          if (currentY < SPACE * 3) {
            currentPage = pdfDoc.addPage()
            currentY = PDF_COORDINATES.data.y
          }

          currentPage.drawText("Notes:", {
            x: startX,
            y: currentY,
            size: FONT_SIZES.content,
            font,
            color: rgb(0, 0, 0)
          })
          currentY -= SPACE

          noteLines.forEach((line) => {
            if (currentY < SPACE) {
              currentPage = pdfDoc.addPage()
              currentY = PDF_COORDINATES.data.y
            }
            currentPage.drawText(line, {
              x: startX,
              y: currentY,
              size: FONT_SIZES.notes,
              font,
              color: rgb(0, 0, 0)
            })
            currentY -= SPACE
          })
        }
      }

      return await pdfDoc.save()
    } catch (error) {
      console.error("Error in fillTemplate:", error)
      throw error
    }
  }

  static async previewTemplate(templatePath) {
    try {
      const templateUrl = `http://localhost:5002/api/templates/file${templatePath}`

      // Fetch and validate PDF
      const pdfBuffer = await this.fetchAndValidatePDF(templateUrl)

      // Create blob and URL
      const blob = new Blob([pdfBuffer], { type: "application/pdf" })
      const objectUrl = URL.createObjectURL(blob)

      return objectUrl
    } catch (error) {
      console.error("Error in previewTemplate:", error)
      throw error
    }
  }

  static async printPDF(pdfBytes) {
    try {
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      const printWindow = window.open(
        url,
        "_blank",
        "width=800,height=600,menubar=no,toolbar=no,location=no,status=no"
      )

      if (!printWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups for PDF preview.")
      }

      printWindow.onload = () => {
        printWindow.onunload = () => {
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error("Error printing PDF:", error)
      throw error
    }
  }
}

export default PDFService
