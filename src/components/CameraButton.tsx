import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import { showToast } from '../utils/toast';
import { imageUtils } from '../utils/imageProcessing';

interface CameraButtonProps {
  onPhotoCapture: (photoData: string) => Promise<void>;
  disabled?: boolean;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onPhotoCapture,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Detecta se é HEIC/HEIF e converte para JPEG
      const isHeic = file.type.includes('heic') ||
                     file.type.includes('heif') ||
                     file.name.toLowerCase().endsWith('.heic') ||
                     file.name.toLowerCase().endsWith('.heif');

      let fileToRead: Blob = file;

      if (isHeic) {
        showToast.info('Convertendo imagem HEIC...');
        try {
          fileToRead = await imageUtils.convertHeicToJpeg(file);
          showToast.success('Imagem convertida com sucesso!');
        } catch (error) {
          console.error('Erro ao converter HEIC:', error);
          showToast.error('Erro ao converter imagem HEIC. Tente outro formato.');
          return;
        }
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          try {
            await onPhotoCapture(e.target.result);
          } catch (error) {
            console.error('Error capturing photo:', error);
            showToast.error('Erro ao capturar foto. Tente novamente.');
          }
        }
      };

      reader.onerror = () => {
        showToast.error('Erro ao ler arquivo da câmera.');
      };

      reader.readAsDataURL(fileToRead);
    } catch (error) {
      console.error('Error processing file:', error);
      showToast.error('Erro ao processar imagem.');
    } finally {
      // Reset input value to allow capturing the same image again
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="camera-button-container">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
        id="camera-input"
        className="hidden"
        onChange={handleCapture}
        disabled={disabled}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 active:bg-green-800 transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        <Camera size={20} />
        <span>Tirar Foto</span>
      </button>
    </div>
  );
};
