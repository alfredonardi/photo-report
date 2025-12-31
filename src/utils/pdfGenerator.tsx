import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { Photo, ShareError } from '../types';
import { PDFDocument } from './pdf/PDFDocument';
import { formatters } from './formatters';
import { pdfUploadService } from '../services/supabase/pdfUploadService';
import { imageUtils } from './imageProcessing';
import { showToast } from './toast';

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

/**
 * Detecta se o app está sendo executado dentro de uma WebView
 * WebViews (WhatsApp, Gmail, Facebook, etc.) geralmente não suportam navigator.share com arquivos
 */
const isWebView = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();

  // Detecta WebViews comuns em Android e iOS
  const webViewIndicators = [
    'wv',              // Android WebView
    'fb_iab',          // Facebook in-app browser
    'fban',            // Facebook Android
    'fbios',           // Facebook iOS
    'instagram',       // Instagram in-app browser
    'line',            // LINE app
    'micromessenger',  // WeChat
    'kakaotalk',       // KakaoTalk
    'telegram',        // Telegram
    'whatsapp',        // WhatsApp (raro, mas possível)
  ];

  // Verifica se algum indicador está presente
  const hasWebViewIndicator = webViewIndicators.some(indicator =>
    userAgent.includes(indicator)
  );

  // Verifica se é Gmail/Outlook app (não tem indicadores claros, mas podemos tentar)
  const isEmailApp = userAgent.includes('android') &&
                     !userAgent.includes('chrome') &&
                     userAgent.includes('version/');

  return hasWebViewIndicator || isEmailApp;
};

export const pdfGenerator = {
  async generatePDF(photos: Photo[], config: PDFConfig): Promise<void> {
    try {
      // Sort photos by position before generating PDF
      const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

      // PROCESSA FOTOS: Aplica rotação física UMA VEZ da imagem original
      console.log('🔄 Processando fotos para o PDF...');
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
          console.log(`  📐 Rotacionando foto ${photo.position} em ${rotationAngle}° para o PDF...`);
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

      console.log('✅ Fotos processadas com sucesso!');

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

      // Detecta se é mobile e se está em WebView
      const isMobile = isMobileDevice();
      const inWebView = isWebView();

      // MOBILE: Tenta usar Web Share API para compartilhamento
      if (isMobile && navigator.share) {
        try {
          // Cria um arquivo a partir do blob
          const file = new File([blob], filename, { type: 'application/pdf' });

          // Verifica se a API canShare existe e se pode compartilhar arquivos
          const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });

          if (canShareFiles && !inWebView) {
            // Tenta compartilhar
            await navigator.share({
              files: [file],
              title: 'Relatório Fotográfico',
              text: `Relatório do BO ${config.boNumber}`,
            });
            return; // Sucesso! Compartilhou
          } else {
            // Não pode compartilhar arquivos ou está em WebView
            if (inWebView) {
              console.log('📱 Detectado WebView - usando download direto');
              showToast.info('Abrindo no navegador principal permite compartilhar o PDF. Por ora, baixando arquivo...');
            } else {
              console.log('📱 Compartilhamento de arquivos não suportado - usando download direto');
              showToast.info('Compartilhamento não disponível neste navegador. Baixando arquivo...');
            }
            // Continua para download abaixo
          }
        } catch (shareError) {
          const error = shareError as ShareError;
          // Se usuário cancelou, faz download direto
          if (error.name === 'AbortError') {
            console.log('Compartilhamento cancelado pelo usuário');
            showToast.info('Compartilhamento cancelado. Baixando arquivo...');
            // Continua para o download abaixo
          } else {
            // Outro erro, continua para o download
            console.warn('Erro ao compartilhar:', error);
            showToast.warning('Erro ao compartilhar. Baixando arquivo...');
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

      // Mostra mensagem de sucesso do download
      if (!isMobile || inWebView) {
        showToast.success('PDF baixado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Não foi possível gerar o PDF. Por favor, tente novamente.');
    }
  }
};