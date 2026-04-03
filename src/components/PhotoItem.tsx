import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, RotateCcw, Trash2 } from 'lucide-react';
import { Photo } from '../services/database/photoService';
import { PositionSelector } from './PositionSelector';
import { ConfirmDialog } from './ConfirmDialog';

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
  const [localDescription, setLocalDescription] = useState(photo.description);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;

    if (newValue.length <= 78) {
      setLocalDescription(newValue);
      adjustTextareaHeight();
      onDescriptionChange(photo.id, newValue);
    }
  };

  const handleRotateRight = () => {
    const newRotation = (rotation + 90) % 360;
    onRotate(photo.id, newRotation);
  };

  const handleRotateLeft = () => {
    const newRotation = (rotation - 90 + 360) % 360;
    onRotate(photo.id, newRotation);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    if (value.length >= 78 && event.key !== 'Backspace' && event.key !== 'Delete' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
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
    setLocalDescription(photo.description);
  }, [photo.description]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [localDescription]);

  const rotation = photo.rotationMetadata || photo.rotation || 0;
  const isRotatedPortrait = rotation === 90 || rotation === 270;
  const rotationScale = isRotatedPortrait ? 0.75 : 1;
  const descriptionLength = localDescription.length;

  return (
    <>
      <article className="photo-item-container">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 xl:px-2.5 xl:py-0.5">
              Foto {photo.position}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium xl:px-2.5 xl:py-0.5 ${descriptionLength > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {descriptionLength > 0 ? 'Descrição pronta' : 'Sem descrição'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsRemoveDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 xl:px-3 xl:py-1.5 xl:text-xs"
          >
            <Trash2 size={16} />
            Remover
          </button>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)] xl:items-start xl:gap-5 2xl:grid-cols-[minmax(0,1.14fr)_minmax(280px,0.86fr)]">
          <div
            className="photo-image-container"
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background:
                'radial-gradient(circle at top, rgba(255,255,255,0.95), rgba(241,245,249,0.85) 55%, rgba(226,232,240,0.8))',
            }}
          >
            <img
              src={photo.originalPhoto || photo.photo}
              alt={`Foto ${photo.position}`}
              className="photo-item"
              style={{
                transform: `rotate(${rotation}deg) scale(${rotationScale})`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="min-w-0 space-y-4 xl:space-y-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor={`description-${photo.id}`} className="text-sm font-semibold text-slate-800">
                  Descrição
                </label>
                <span className="text-xs font-medium text-slate-500">{descriptionLength}/78</span>
              </div>
              <textarea
                id={`description-${photo.id}`}
                ref={textareaRef}
                placeholder="Descreva rapidamente o que deve aparecer no relatório."
                value={localDescription}
                onChange={handleDescriptionChange}
                onKeyDown={handleKeyDown}
                className="photo-description"
                maxLength={78}
              />
            </div>

            <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <PositionSelector
                id={photo.id}
                currentPosition={photo.position}
                totalPhotos={totalPhotos}
                onPositionChange={onPositionChange}
              />

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Ajuste rápido
                </span>
                <div className="grid grid-cols-2 gap-2 2xl:grid-cols-1">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 xl:py-2.5 xl:text-[13px]"
                    title="Rotacionar para esquerda"
                  >
                    <RotateCcw size={16} />
                    Esquerda
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="inline-flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 xl:py-2.5 xl:text-[13px]"
                    title="Rotacionar para direita"
                  >
                    <RotateCw size={16} />
                    Direita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <ConfirmDialog
        open={isRemoveDialogOpen}
        title={`Remover a foto ${photo.position}`}
        description="A imagem será excluída deste relatório e as posições serão reorganizadas automaticamente."
        confirmLabel="Apagar foto"
        onConfirm={() => {
          setIsRemoveDialogOpen(false);
          onRemove(photo.id);
        }}
        onClose={() => setIsRemoveDialogOpen(false)}
      />
    </>
  );
};
