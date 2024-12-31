import { jsPDF } from 'jspdf';

export const documentSetup = {
  createDocument(): jsPDF {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
  }
};