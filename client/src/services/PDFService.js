import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { FONT_SIZES, PDF_COORDINATES, SPACE } from "../constants/config"

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

  async fillTemplate(templatePath, data, coordinates) {
    const pdfDoc = await this.loadTemplate(templatePath)
    const page = pdfDoc.getPages()[0]
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Insert current date
    const currentDate = new Date().toLocaleDateString()
    page.drawText(currentDate, {
      x: PDF_COORDINATES.date.x,
      y: PDF_COORDINATES.date.y,
      font,
      size: 12
    })

    // Insert data items with bullet points
    data.forEach((item, index) => {
      // Draw bullet point
      page.drawText("•", {
        x: PDF_COORDINATES.data.x - 15,
        y: PDF_COORDINATES.data.y - index * SPACE,
        font,
        size: 12
      })

      // Draw item name
      page.drawText(item.name, {
        x: PDF_COORDINATES.data.x,
        y: PDF_COORDINATES.data.y - index * SPACE,
        font,
        size: 12
      })
    })

    return await pdfDoc.save()
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

  static async fillTemplate(templatePath, data) {
    try {
      const pdfBuffer = await this.fetchAndValidatePDF(templatePath)
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const page = pdfDoc.getPages()[0]
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      // Get page dimensions from template
      const { width } = page.getSize()

      // Calculate text boundaries
      const startX = PDF_COORDINATES.data.x
      const endX = width - startX // Mirror left margin on right side
      let currentY = PDF_COORDINATES.data.y

      // Draw category
      if (data[0]?.category) {
        const categoryLines = wrapText(
          data[0].category,
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
          const lines = wrapText(
            finding,
            font,
            FONT_SIZES.content,
            startX,
            endX - 20 // Account for bullet point
          )

          // Check if we need a new page
          if (currentY < SPACE * 2) {
            currentPage = pdfDoc.addPage()
            currentY = PDF_COORDINATES.data.y
          }

          // Draw bullet point
          currentPage.drawText("•", {
            x: startX - 15,
            y: currentY,
            size: FONT_SIZES.content,
            font,
            color: rgb(0, 0, 0)
          })

          // Draw wrapped finding text
          lines.forEach((line, index) => {
            currentPage.drawText(line, {
              x: startX,
              y: currentY - index * SPACE,
              size: FONT_SIZES.content,
              font,
              color: rgb(0, 0, 0)
            })
          })

          currentY -= lines.length * SPACE + SPACE
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
