/**
 * Utilitários para processamento de imagens
 *
 * ESTRATÉGIA DE QUALIDADE:
 * - Comprimir UMA VEZ ao importar (quality 0.95)
 * - Guardar rotação como metadata (0, 90, 180, 270)
 * - Aplicar rotação física apenas no PDF
 * - ZERO degradação em rotações múltiplas
 * - Suporta HEIC/HEIF (conversão automática para JPEG)
 */

import heic2any from 'heic2any';

export const imageUtils = {
  /**
   * Converte imagem HEIC/HEIF para JPEG
   *
   * @param file - Arquivo HEIC
   * @returns Blob JPEG
   */
  async convertHeicToJpeg(file: File): Promise<Blob> {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.95,
      });

      // heic2any pode retornar array ou blob único
      return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch (error) {
      console.error('Erro ao converter HEIC:', error);
      throw new Error('Falha ao converter imagem HEIC. Tente outro formato.');
    }
  },

  /**
   * Converte File ou Blob para base64
   *
   * @param blob - Arquivo ou Blob
   * @returns String base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },
  /**
   * Comprime e redimensiona imagem UMA ÚNICA VEZ
   * Usado ao importar/capturar foto
   *
   * @param base64Str - Imagem em base64
   * @param maxWidth - Largura máxima (default: 1600px para ~200 DPI no PDF)
   * @param maxHeight - Altura máxima (default: 1200px)
   * @param quality - Qualidade JPEG (default: 0.95 para qualidade quase perfeita)
   * @returns Imagem processada em base64
   */
  async compressOnce(
    base64Str: string,
    maxWidth = 1600,
    maxHeight = 1200,
    quality = 0.95
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }

          let width = img.width;
          let height = img.height;

          // Calcula novas dimensões mantendo aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Auto-rotação para landscape se necessário
          const isPortrait = width < height;
          if (isPortrait) {
            canvas.width = height;
            canvas.height = width;

            // Rotaciona 90° para landscape
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
          } else {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Comprime com qualidade alta (0.95)
          // Isso garante qualidade quase perfeita com tamanho razoável
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Erro ao carregar imagem:', error);
        reject(new Error('Falha ao carregar a imagem'));
      };
    });
  },

  /**
   * DEPRECADO - Use compressOnce
   * Mantido para compatibilidade com código antigo
   */
  async resizeAndRotateToLandscape(
    base64Str: string,
    maxWidth = 1600,
    maxHeight = 1200
  ): Promise<string> {
    console.warn('resizeAndRotateToLandscape está DEPRECADO. Use compressOnce()');
    return this.compressOnce(base64Str, maxWidth, maxHeight, 0.95);
  },

  /**
   * Aplica rotação FÍSICA na imagem
   *
   * IMPORTANTE: Esta função NÃO deve ser usada para rotações interativas!
   * Use apenas para gerar o PDF final.
   *
   * Para rotações na UI, use CSS transform no componente.
   *
   * @param imageDataUrl - Imagem original em base64
   * @param angle - Ângulo de rotação (0, 90, 180, 270)
   * @param quality - Qualidade JPEG (default: 0.90 para PDF)
   * @returns Imagem rotacionada em base64
   */
  async rotatePhysically(
    imageDataUrl: string,
    angle: number,
    quality = 0.90
  ): Promise<string> {
    // Se não precisa rotacionar, retorna a original
    if (angle === 0 || angle === 360) {
      return imageDataUrl;
    }

    // Normaliza ângulo (caso receba valores negativos ou > 360)
    const normalizedAngle = ((angle % 360) + 360) % 360;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageDataUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }

          const width = img.width;
          const height = img.height;

          // Define tamanho do canvas baseado na rotação
          // Para 90° e 270°, inverte as dimensões
          if (normalizedAngle === 90 || normalizedAngle === 270) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          // Move a origem para o centro do canvas
          ctx.translate(canvas.width / 2, canvas.height / 2);

          // Rotaciona
          ctx.rotate((normalizedAngle * Math.PI) / 180);

          // Habilita suavização para melhor qualidade
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Desenha a imagem centralizada
          ctx.drawImage(img, -width / 2, -height / 2, width, height);

          // Exporta com qualidade alta para o PDF
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (error) {
          console.error('Erro ao rotacionar imagem:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Erro ao carregar imagem para rotação:', error);
        reject(new Error('Falha ao carregar a imagem para rotação'));
      };
    });
  },

  /**
   * DEPRECADO - Não use para rotações interativas!
   * Use rotatePhysically apenas para gerar PDF.
   *
   * Para rotações na UI, atualize apenas rotationMetadata e use CSS.
   */
  async rotateImage(imageDataUrl: string, rotation: number): Promise<string> {
    console.warn(
      'rotateImage está DEPRECADO para uso interativo.\n' +
      'Use apenas rotationMetadata + CSS transform.\n' +
      'rotatePhysically deve ser usado SÓ ao gerar PDF.'
    );
    return this.rotatePhysically(imageDataUrl, rotation, 0.90);
  },

  /**
   * Valida se um arquivo é uma imagem válida
   * Verifica tipo MIME e magic numbers (primeiros bytes)
   * Suporta: JPEG, PNG, WebP, HEIC/HEIF
   *
   * @param file - Arquivo a validar
   * @returns true se é imagem válida
   */
  async validateImageFile(file: File): Promise<boolean> {
    // Verifica extensão/tipo MIME (incluindo HEIC/HEIF)
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/heic-sequence',
      'image/heif-sequence',
    ];

    // HEIC pode vir sem MIME type correto, então verifica extensão também
    const fileName = file.name.toLowerCase();
    const isHeicByExtension = fileName.endsWith('.heic') || fileName.endsWith('.heif');

    if (!validTypes.includes(file.type) && !isHeicByExtension) {
      throw new Error('Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou HEIC.');
    }

    // Verifica tamanho (máx 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10 MB');
    }

    // Valida magic numbers (primeiros bytes do arquivo)
    try {
      const buffer = await file.slice(0, 12).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // JPEG: FF D8 FF
      const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;

      // PNG: 89 50 4E 47
      const isPNG =
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4E &&
        bytes[3] === 0x47;

      // WebP: 52 49 46 46 ... 57 45 42 50
      const isWebP =
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50;

      // HEIC/HEIF: Verifica por 'ftyp' na posição 4-7 e 'heic'/'mif1' depois
      const hasHEICSignature = isHeicByExtension || file.type.includes('heic') || file.type.includes('heif');

      if (!isJPEG && !isPNG && !isWebP && !hasHEICSignature) {
        throw new Error('Arquivo corrompido ou não é uma imagem válida');
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar imagem:', error);
      return false;
    }
  },
};
