import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Photo } from '../types';
import { PDFDocument } from './pdf/PDFDocument';
import { formatters } from './formatters';

interface PDFConfig {
  boNumber: string;
  version: string;
  selectedGroup: string;
  logo: string;
}

export const pdfGenerator = {
  async generatePDF(photos: Photo[], config: PDFConfig): Promise<void> {
    try {
      // Sort photos by position before generating PDF
      const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

      // Generate PDF using react-pdf
      const blob = await pdf(
        <PDFDocument
          boNumber={config.boNumber}
          version={config.version}
          selectedGroup={config.selectedGroup}
          photos={sortedPhotos}
          logo={config.logo}
        />
      ).toBlob();

      // Create download link with formatted filename
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = formatters.formatPDFFilename(config.boNumber);
      
      // Trigger download
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Não foi possível gerar o PDF. Por favor, tente novamente.');
    }
  }
};