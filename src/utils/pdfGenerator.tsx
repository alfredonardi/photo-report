import { Photo, ShareError } from '../types';
import { formatters } from './formatters';
import { pdfUploadService } from '../services/supabase/pdfUploadService';
import { imageUtils } from './imageProcessing';

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

      // PROCESSA FOTOS: Aplica rotação física UMA VEZ da imagem original
      const processedPhotos = await Promise.all(
        sortedPhotos.map(async (photo) => {
          const rotationAngle = photo.rotationMetadata || photo.rotation || 0;

          // Se não precisa rotacionar, usa a imagem original direto
          if (rotationAngle === 0) {
            return {
              ...photo,
              photo: photo.originalPhoto || photo.photo,
            };
          }

          // Aplica rotação física UMA VEZ da imagem original (quality 0.85 para PDF)
          const rotatedImage = await imageUtils.rotatePhysically(
            photo.originalPhoto || photo.photo,
            rotationAngle,
            0.85 // Quality otimizada para PDF (balanço tamanho/qualidade)
          );

          return {
            ...photo,
            photo: rotatedImage,
          };
        })
      );

      const [{ pdf }, { PDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./pdf/PDFDocument'),
      ]);

      // Generate PDF using react-pdf
      const blob = await pdf(
        <PDFDocument
          boNumber={config.boNumber}
          version={config.version}
          selectedGroup={config.selectedGroup}
          photos={processedPhotos}
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
        } catch (shareError) {
          const error = shareError as ShareError;
          // Se usuário cancelou, faz download direto
          if (error.name === 'AbortError') {
            // Continua para o download abaixo
          }
        }
      }

      // DESKTOP ou FALLBACK: Download tradicional
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);

      // Trigger download
      link.click();
      link.remove();

      // Alguns navegadores precisam de um pequeno atraso para iniciar o download
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Não foi possível gerar o PDF. Por favor, tente novamente.');
    }
  }
};
