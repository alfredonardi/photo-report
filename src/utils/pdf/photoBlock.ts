import { jsPDF } from 'jspdf';
import { Photo, PDFMargins } from './types';
import { PDF_CONFIG } from './constants';

export const addPhotoBlock = async (
  doc: jsPDF,
  photo: Photo,
  startY: number,
  pageWidth: number,
  margins: PDFMargins
): Promise<number> => {
  try {
    // Calculate dimensions
    const photoWidth = pageWidth - margins.left - margins.right;
    const photoHeight = PDF_CONFIG.PHOTO.maxHeight;
    
    // Add photo
    doc.addImage(
      photo.photo,
      'JPEG',
      margins.left,
      startY,
      photoWidth,
      photoHeight,
      undefined,
      'MEDIUM'
    );

    // Add description
    const descriptionY = startY + photoHeight + PDF_CONFIG.SPACING.betweenImageAndDescription;
    doc.setFontSize(PDF_CONFIG.FONT.sizes.description);
    doc.setFont(PDF_CONFIG.FONT.family, 'normal');
    
    const description = `Foto ${photo.position}: ${photo.description || 'Sem descrição'}`;
    doc.text(description, pageWidth / 2, descriptionY, { align: 'center' });

    // Return next Y position
    return descriptionY + PDF_CONFIG.SPACING.betweenElements;
  } catch (error) {
    console.error('Error adding photo block:', error);
    throw error;
  }
}