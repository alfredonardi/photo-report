import React, { useMemo } from 'react';
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
  // Otimização: usa useMemo para evitar re-ordenação desnecessária
  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.position - b.position),
    [photos]
  );

  // Adiciona validação para lista vazia
  if (sortedPhotos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma foto adicionada ainda. Comece tirando uma foto ou importando imagens.
      </div>
    );
  }

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
