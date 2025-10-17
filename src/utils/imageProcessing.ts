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

          // Resize image if it's too large
          let width = img.width;
          let height = img.height;
          const maxDimension = 1024;

          if (width > maxDimension || height > maxDimension) {
            const ratio = maxDimension / Math.max(width, height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          if (rotation === 90 || rotation === 270) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);

          resolve(canvas.toDataURL('image/jpeg', 0.5));
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
