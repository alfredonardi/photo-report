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
  return (
    <div className="position-selector">
      <div className="position-info">
        <span className="position-label">Posição {currentPosition}</span>
      </div>
      <select
        id={`position-select-${id}`}
        value={currentPosition}
        onChange={(e) => onPositionChange(id, parseInt(e.target.value))}
        className="position-select"
        aria-label="Alterar posição da foto"
      >
        <option key="placeholder" value={currentPosition}>
          Alterar posição...
        </option>
        {Array.from({ length: totalPhotos }, (_, i) => i + 1)
          .filter(pos => pos !== currentPosition)
          .map(position => (
            <option key={`pos-${position}`} value={position}>
              {position}
            </option>
          ))}
      </select>
    </div>
  );
};