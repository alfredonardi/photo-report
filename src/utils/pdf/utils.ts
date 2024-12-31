import { jsPDF } from 'jspdf';
import { PDFDimensions, PDFMargins } from './types';
import { PDF_CONFIG } from './constants';

export const calculateDimensions = (
  doc: jsPDF,
  margins: PDFMargins
): PDFDimensions => {
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  const contentHeight = height - margins.top - margins.bottom - 
    PDF_CONFIG.HEADER_HEIGHT - PDF_CONFIG.FOOTER_HEIGHT - 
    (PDF_CONFIG.PHOTOS_PER_PAGE - 1) * PDF_CONFIG.SPACING.betweenElements;
  
  const maxBlockHeight = contentHeight / PDF_CONFIG.PHOTOS_PER_PAGE;
  const maxImageWidth = width - margins.left - margins.right;
  
  return {
    width,
    height,
    headerHeight: PDF_CONFIG.HEADER_HEIGHT,
    footerHeight: PDF_CONFIG.FOOTER_HEIGHT,
    contentHeight,
    maxBlockHeight,
    maxImageWidth,
    maxImageHeight: maxBlockHeight * 0.8,
    maxDescriptionHeight: maxBlockHeight * 0.6,
    spacingBetweenElements: PDF_CONFIG.SPACING.betweenElements,
    spacingBetweenImageAndDescription: PDF_CONFIG.SPACING.betweenImageAndDescription,
    lineHeight: PDF_CONFIG.LINE_HEIGHT
  };
};