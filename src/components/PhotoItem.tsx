import React, { useEffect, useRef } from 'react';
import { Photo } from '../services/database/photoService';
import { PositionSelector } from './PositionSelector';

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

  const handleRotationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRotate(photo.id, parseInt(e.target.value));
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

  return (
    <div className="photo-item-container">
      <div className="photo-image-container">
        <img
          src={photo.photo}
          alt={`Foto ${photo.position}`}
          className="photo-item"
        />
      </div>
      <div className="rotation-selector">
        <select
          value={photo.rotation}
          onChange={handleRotationChange}
          className="p-2 text-sm border border-gray-300 rounded w-full mt-2 mb-2"
        >
          <option value="0">Rotação: 0°</option>
          <option value="90">Rotação: 90°</option>
          <option value="180">Rotação: 180°</option>
          <option value="270">Rotação: 270°</option>
        </select>
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