import React from 'react';
import { PhotoItem } from './PhotoItem';
import { Photo } from '../services/database/photoService';

interface PhotoListProps {
  photos: Photo[];
  onDescriptionChange: (id: number, description: string) => void;
  onPositionChange: (id: number, position: number) => void;
 onRotate: (id: number, rotation: number) => void;
  onRemove: (id: number) => void;
}

export const PhotoList: React.FC<PhotoListProps> = ({
  photos,
  onDescriptionChange,
  onPositionChange,
  onRotate,
  onRemove,
}) => {
  // Garantir que as fotos estejam ordenadas por posição
  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

  return (
    <div className="photo-list">
      {sortedPhotos.map((photo) => (
        <PhotoItem
          key={photo.id}
          photo={photo}
          totalPhotos={photos.length}
          onDescriptionChange={onDescriptionChange}
          onPositionChange={onPositionChange}
          onRotate={onRotate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
