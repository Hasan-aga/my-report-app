import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PDF_COORDINATES, SPACE, FONT_SIZES } from '../constants/config';

// Helper function for date formatting
const formatDate = (date) => {
  return date.toLocaleDateString('en-CA', { // en-CA gives yyyy/mm/dd format
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/-/g, '/'); // Replace hyphens with slashes
};

class PDFService {
  async loadTemplate(templatePath) {
    const response = await fetch(templatePath);
    const templateBytes = await response.arrayBuffer();
    return await PDFDocument.load(templateBytes);
  }

  async fillTemplate(templatePath, data, coordinates) {
    const pdfDoc = await this.loadTemplate(templatePath);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Insert current date
    const currentDate = new Date().toLocaleDateString();
    page.drawText(currentDate, {
      x: PDF_COORDINATES.date.x,
      y: PDF_COORDINATES.date.y,
      font,
      size: 12,
    });

    // Insert data items with bullet points
    data.forEach((item, index) => {
      // Draw bullet point
      page.drawText('•', {
        x: PDF_COORDINATES.data.x - 15,
        y: PDF_COORDINATES.data.y - (index * SPACE),
        font,
        size: 12,
      });

      // Draw item name
      page.drawText(item.name, {
        x: PDF_COORDINATES.data.x,
        y: PDF_COORDINATES.data.y - (index * SPACE),
        font,
        size: 12,
      });
    });

    return await pdfDoc.save();
  }

  async previewPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }

  async printPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Open in a popup window with specific dimensions
    const printWindow = window.open(
      url,
      'Print',
      'width=800,height=600,toolbar=0,scrollbars=1,status=0'
    );
    
    printWindow.onload = () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    };
  }

  static async fetchAndValidatePDF(url) {
    console.log('Fetching PDF from:', url);
    
    try {
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Verify content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      console.log('PDF bytes received:', pdfBuffer.byteLength);
      
      if (pdfBuffer.byteLength === 0) {
        throw new Error('Received empty PDF file');
      }

      return pdfBuffer;
    } catch (error) {
      console.error('Error fetching PDF:', error);
      throw error;
    }
  }

  static async fillTemplate(templatePath, data) {
    try {
      console.log('Filling template:', {
        url: templatePath,
        data: data
      });
      
      // Fetch and validate PDF
      const pdfBuffer = await this.fetchAndValidatePDF(templatePath);

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const page = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Get page dimensions
      const { width, height } = page.getSize();
      
      // Set text options
      const fontSize = 12;
      const lineHeight = SPACE || fontSize * 1.2;

      // Draw category with title font size
      if (data[0]?.category) {
        page.drawText(data[0].category, {
          x: PDF_COORDINATES.data.x,
          y: PDF_COORDINATES.data.y,
          size: FONT_SIZES.title,
          font: font,
          color: rgb(0, 0, 0)
        });
      }

      // Draw findings with content font size
      if (data[0]?.findings) {
        const findings = data[0].findings;
        findings.forEach((finding, index) => {
          const yPosition = PDF_COORDINATES.data.y - SPACE * (index + 1);
          
          // Draw bullet point
          page.drawText('•', {
            x: PDF_COORDINATES.data.x - 15,
            y: yPosition,
            size: FONT_SIZES.content,
            font: font,
            color: rgb(0, 0, 0)
          });

          // Draw finding text
          page.drawText(finding, {
            x: PDF_COORDINATES.data.x,
            y: yPosition,
            size: FONT_SIZES.content,
            font: font,
            color: rgb(0, 0, 0)
          });
        });

        // Draw notes with notes font size
        if (data[0]?.notes) {
          const notesYPosition = PDF_COORDINATES.data.y - SPACE * (findings.length + 2);
          page.drawText('Notes:', {
            x: PDF_COORDINATES.data.x,
            y: notesYPosition,
            size: FONT_SIZES.content,
            font: font,
            color: rgb(0, 0, 0)
          });

          page.drawText(data[0].notes, {
            x: PDF_COORDINATES.data.x,
            y: notesYPosition - SPACE,
            size: FONT_SIZES.notes,
            font: font,
            color: rgb(0, 0, 0)
          });
        }
      }

      // Draw date with date font size
      const currentDate = formatDate(new Date());
      page.drawText(currentDate, {
        x: PDF_COORDINATES.date.x,
        y: PDF_COORDINATES.date.y,
        size: FONT_SIZES.date,
        font: font,
        color: rgb(0, 0, 0)
      });

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Error in fillTemplate:', error);
      throw error;
    }
  }

  static async previewTemplate(templatePath) {
    try {
      const templateUrl = `http://localhost:5002/api/templates/file${templatePath}`;
      
      // Fetch and validate PDF
      const pdfBuffer = await this.fetchAndValidatePDF(templateUrl);

      // Create blob and URL
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(blob);
      
      return objectUrl;
    } catch (error) {
      console.error('Error in previewTemplate:', error);
      throw error;
    }
  }

  static async printPDF(pdfBytes) {
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const printWindow = window.open(
        url,
        '_blank',
        'width=800,height=600,menubar=no,toolbar=no,location=no,status=no'
      );

      if (!printWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for PDF preview.');
      }

      printWindow.onload = () => {
        printWindow.onunload = () => {
          URL.revokeObjectURL(url);
        };
      };
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw error;
    }
  }
}

export default PDFService; 