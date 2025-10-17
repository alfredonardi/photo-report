import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

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

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      if (typeof e.target?.result === 'string') {
        try {
          await onPhotoCapture(e.target.result);
        } catch (error) {
          console.error('Error capturing photo:', error);
          alert('Erro ao capturar foto. Tente novamente.');
        }
      }
    };

    reader.onerror = () => {
      alert('Erro ao ler arquivo da câmera.');
    };

    reader.readAsDataURL(file);

    // Reset input value to allow capturing the same image again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="camera-button-container">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
