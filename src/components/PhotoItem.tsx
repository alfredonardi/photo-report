import React, { useEffect, useRef } from 'react';
import { Photo } from '../services/database/photoService';
import { PositionSelector } from './PositionSelector';
import { RotateCw, RotateCcw } from 'lucide-react';

interface PhotoItemProps {
  photo: Photo;
  totalPhotos: number;
  onDescriptionChange: (id: number, description: string) => void;
  onPositionChange: (id: number, position: number) => void;
  onRotate: (id: number, rotation: number) => void;
  onRemove: (id: number) => void;
}

export const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  totalPhotos,
  onDescriptionChange,
  onPositionChange,
  onRotate,
  onRemove,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRemove = () => {
    const confirmRemoval = window.confirm(
      'Você tem certeza que deseja apagar esta foto?'
    );
    if (confirmRemoval) {
      onRemove(photo.id);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 78) {
      onDescriptionChange(photo.id, e.target.value);
      adjustTextareaHeight();
    }
  };

  const handleRotateRight = () => {
    const newRotation = (photo.rotation + 90) % 360;
    onRotate(photo.id, newRotation);
  };

  const handleRotateLeft = () => {
    const newRotation = (photo.rotation - 90 + 360) % 360;
    onRotate(photo.id, newRotation);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    if (value.length >= 78 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [photo.description]);

  // Calcula se a imagem está rotacionada em 90° ou 270° (portrait)
  const rotation = photo.rotationMetadata || photo.rotation || 0;
  const isRotatedPortrait = rotation === 90 || rotation === 270;

  return (
    <div className="photo-item-container">
      <div
        className="photo-image-container"
        style={{
          // Container responsivo com aspect ratio que se adapta
          position: 'relative',
          width: '100%',
          // Aspect ratio: landscape normal, portrait quando rotacionado
          paddingBottom: isRotatedPortrait ? '133.33%' : '75%',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        }}
      >
        <img
          src={photo.originalPhoto || photo.photo}
          alt={`Foto ${photo.position}`}
          className="photo-item"
          style={{
            // Posiciona absolutamente e centraliza
            position: 'absolute',
            top: '50%',
            left: '50%',
            // Combina translate (para centralizar) + rotate
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            // Dimensões adaptativas
            width: isRotatedPortrait ? 'auto' : '100%',
            height: isRotatedPortrait ? '100%' : 'auto',
            maxWidth: isRotatedPortrait ? '75%' : '100%',
            maxHeight: isRotatedPortrait ? '75%' : '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <div className="rotation-selector">
        <div className="flex items-center gap-2 mt-2 mb-2">
          <button
            onClick={handleRotateLeft}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded border border-gray-300 transition-colors"
            title="Rotacionar para esquerda (sentido anti-horário)"
          >
            <RotateCcw size={18} />
            <span className="text-sm">Esquerda</span>
          </button>
          <button
            onClick={handleRotateRight}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded border border-gray-300 transition-colors"
            title="Rotacionar para direita (sentido horário)"
          >
            <span className="text-sm">Direita</span>
            <RotateCw size={18} />
          </button>
        </div>
      </div>
      <div className="photo-item-controls">
        <PositionSelector
          id={photo.id}
          currentPosition={photo.position}
          totalPhotos={totalPhotos}
          onPositionChange={onPositionChange}
        />
        <textarea
          ref={textareaRef}
          placeholder="Adicione uma descrição (máximo 78 caracteres). A descrição será exibida em uma única linha."
          value={photo.description}
          onChange={handleDescriptionChange}
          onKeyDown={handleKeyDown}
          className="photo-description"
          maxLength={78}
        />
        <div className="photo-item-buttons">
          <button onClick={handleRemove}>Apagar</button>
        </div>
      </div>
    </div>
  );
};