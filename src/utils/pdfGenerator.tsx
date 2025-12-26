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

      const filename = formatters.formatPDFFilename(config.boNumber);

      // Verifica se o navegador suporta Web Share API (mobile principalmente)
      if (navigator.share && navigator.canShare) {
        try {
          // Cria um arquivo a partir do blob
          const file = new File([blob], filename, { type: 'application/pdf' });

          // Verifica se pode compartilhar arquivos
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Relatório Fotográfico',
              text: `Relatório do BO ${config.boNumber}`,
            });
            return; // Sucesso! Saiu do compartilhamento
          }
        } catch (shareError: any) {
          // Se usuário cancelou o compartilhamento, não é erro
          if (shareError.name === 'AbortError') {
            console.log('Compartilhamento cancelado pelo usuário');
            return;
          }
          // Se falhou por outro motivo, continua para o download tradicional
          console.warn('Falha ao compartilhar, usando download tradicional:', shareError);
        }
      }

      // Fallback: Download tradicional (desktop ou se Share API falhou)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

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