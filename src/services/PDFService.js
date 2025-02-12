import { PDFDocument, StandardFonts } from 'pdf-lib';

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
      x: coordinates.date.x,
      y: coordinates.date.y,
      font,
      size: 12,
    });

    // Insert data at specified coordinates
    page.drawText(data.toString(), {
      x: coordinates.data.x,
      y: coordinates.data.y,
      font,
      size: 12,
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
    const printWindow = window.open(url);
    
    printWindow.onload = () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    };
  }
}

export default new PDFService(); 