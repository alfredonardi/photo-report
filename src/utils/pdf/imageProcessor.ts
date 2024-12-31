import { PDF_CONFIG } from './constants';

interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export const imageProcessor = {
  async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = src;
    });
  },

  async processImage(dataUrl: string): Promise<ProcessedImage> {
    const img = await this.loadImage(dataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Set maximum dimensions
    const maxWidth = 1200;
    const maxHeight = 1600;
    
    let width = img.width;
    let height = img.height;

    // Calculate new dimensions
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw and compress image
    ctx.drawImage(img, 0, 0, width, height);
    const processedDataUrl = canvas.toDataURL('image/jpeg', PDF_CONFIG.COMPRESSION.quality);

    return {
      dataUrl: processedDataUrl,
      width,
      height
    };
  }
};