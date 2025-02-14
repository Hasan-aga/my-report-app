import { PDFDocument, StandardFonts } from 'pdf-lib';
import { PDF_COORDINATES, SPACE } from '../constants/config';

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
}

export default new PDFService(); 