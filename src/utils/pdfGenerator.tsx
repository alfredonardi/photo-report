import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Photo } from '../types';
import { PDFDocument } from './pdf/PDFDocument';
import { formatters } from './formatters';
import { pdfUploadService } from '../services/supabase/pdfUploadService';

interface PDFConfig {
  boNumber: string;
  version: string;
  selectedGroup: string;
  logo: string;
  userEmail?: string; // Email do usuário logado (para rastreabilidade)
}

/**
 * Detecta se é dispositivo móvel
 * Usa uma combinação de user agent e características do dispositivo
 */
const isMobileDevice = (): boolean => {
  // Checa user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

  // Checa se tem touch screen E tela pequena
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  // É mobile se: tem keywords mobile OU (tem touch + tela pequena)
  return isMobileUA || (hasTouchScreen && isSmallScreen);
};

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

      // UPLOAD AUTOMÁTICO PARA A NUVEM (em segundo plano, não bloqueia)
      // Se o Supabase estiver configurado, faz upload automático
      if (config.userEmail) {
        pdfUploadService.uploadPDF(blob, {
          boNumber: config.boNumber,
          version: config.version,
          selectedGroup: config.selectedGroup,
          photoCount: sortedPhotos.length,
          generatedBy: config.userEmail,
          generatedAt: new Date().toISOString(),
          fileSize: blob.size,
          fileName: filename,
        }).catch(error => {
          // Não bloqueia se falhar - apenas loga
          console.error('⚠️ Falha no upload para nuvem (não crítico):', error);
        });
      }

      // Detecta se é mobile
      const isMobile = isMobileDevice();

      // MOBILE: Tenta usar Web Share API para compartilhamento
      if (isMobile && navigator.share && navigator.canShare) {
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
            return; // Sucesso! Compartilhou
          }
        } catch (shareError: any) {
          // Se usuário cancelou, faz download direto
          if (shareError.name === 'AbortError') {
            console.log('Compartilhamento cancelado, fazendo download...');
            // Continua para o download abaixo
          } else {
            // Outro erro, continua para o download
            console.warn('Erro ao compartilhar, fazendo download:', shareError);
          }
        }
      }

      // DESKTOP ou FALLBACK: Download tradicional
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