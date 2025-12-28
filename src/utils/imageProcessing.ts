export const imageUtils = {
  async resizeAndRotateToLandscape(
    base64Str: string, 
    maxWidth = 1024, 
    maxHeight = 1024
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          if (width !== height && width < height) {
            canvas.width = height;
            canvas.height = width;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Não foi possível obter contexto do canvas'));
              return;
            }
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((90 * Math.PI) / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);
          } else {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Não foi possível obter contexto do canvas'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.5));
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

  async rotateImage(imageDataUrl: string, rotation: number): Promise<string> {
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

          // Usa dimensões originais da imagem (sem redimensionar)
          const width = img.width;
          const height = img.height;

          // Define tamanho do canvas baseado na rotação
          if (rotation === 90 || rotation === 270) {
            // Para rotações de 90° e 270°, inverte largura e altura
            canvas.width = height;
            canvas.height = width;
          } else {
            // Para 0° e 180°, mantém dimensões
            canvas.width = width;
            canvas.height = height;
          }

          // Limpa o canvas com branco (evita faixas pretas)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Aplica rotação
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);

          // Desenha a imagem centralizada
          ctx.drawImage(img, -width / 2, -height / 2, width, height);

          // Qualidade 0.85 para reduzir perda em múltiplas rotações
          resolve(canvas.toDataURL('image/jpeg', 0.85));
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
  }
};
