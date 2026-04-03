import React, { useMemo } from 'react';
import { ImagePlus } from 'lucide-react';
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
  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.position - b.position),
    [photos]
  );

  if (sortedPhotos.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center sm:rounded-[28px] sm:px-6 sm:py-14">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-slate-700 shadow-sm sm:h-16 sm:w-16 sm:rounded-[22px]">
          <ImagePlus size={28} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950 sm:mt-5 sm:text-xl">Nenhuma foto adicionada</h3>
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
