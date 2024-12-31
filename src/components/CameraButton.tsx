import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface CameraButtonProps {
  onPhotoCapture: (photoData: string) => Promise<void>;
}

export const CameraButton: React.FC<CameraButtonProps> = ({ onPhotoCapture }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (typeof e.target?.result === 'string') {
        await onPhotoCapture(e.target.result);
      }
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
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 active:bg-green-800 transition-all w-full"
      >
        <Camera size={20} />
        <span>Tirar Foto</span>
      </button>
    </div>
  );
};