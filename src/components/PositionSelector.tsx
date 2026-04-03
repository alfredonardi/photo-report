import React from 'react';

interface PositionSelectorProps {
  id: number;
  currentPosition: number;
  totalPhotos: number;
  onPositionChange: (id: number, position: number) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  id,
  currentPosition,
  totalPhotos,
  onPositionChange,
}) => {
  if (totalPhotos <= 1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        Posição {currentPosition}
      </div>
    );
  }

  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Posição
      </span>
      <select
        id={`position-select-${id}`}
        value={currentPosition}
        onChange={(event) => onPositionChange(id, parseInt(event.target.value, 10))}
        className="position-select"
        aria-label={`Alterar posição da foto ${currentPosition}`}
      >
        <option key="placeholder" value={currentPosition}>
          Foto {currentPosition}
        </option>
        {Array.from({ length: totalPhotos }, (_, index) => index + 1)
          .filter((position) => position !== currentPosition)
          .map((position) => (
            <option key={`pos-${position}`} value={position}>
              Mover para {position}
            </option>
          ))}
      </select>
    </label>
  );
};
