import type { Photo } from '../types';

export const sortPhotosByPosition = (photos: Photo[]): Photo[] => {
  return [...photos].sort((a, b) => a.position - b.position);
};

export const movePhotoToPosition = (
  photos: Photo[],
  photoId: number,
  newPosition: number
): Photo[] => {
  const currentPhotos = sortPhotosByPosition(photos);
  const targetPhoto = currentPhotos.find((photo) => photo.id === photoId);

  if (!targetPhoto || targetPhoto.position === newPosition) {
    return currentPhotos;
  }

  return sortPhotosByPosition(
    currentPhotos.map((photo) => {
      if (photo.id === photoId) {
        return { ...photo, position: newPosition };
      }

      if (
        targetPhoto.position < newPosition &&
        photo.position > targetPhoto.position &&
        photo.position <= newPosition
      ) {
        return { ...photo, position: photo.position - 1 };
      }

      if (
        targetPhoto.position > newPosition &&
        photo.position >= newPosition &&
        photo.position < targetPhoto.position
      ) {
        return { ...photo, position: photo.position + 1 };
      }

      return photo;
    })
  );
};

export const removePhotoAndReindex = (photos: Photo[], photoId: number): Photo[] => {
  const currentPhotos = sortPhotosByPosition(photos);
  const removedPhoto = currentPhotos.find((photo) => photo.id === photoId);

  if (!removedPhoto) {
    return currentPhotos;
  }

  return sortPhotosByPosition(
    currentPhotos
      .filter((photo) => photo.id !== photoId)
      .map((photo) =>
        photo.position > removedPhoto.position
          ? { ...photo, position: photo.position - 1 }
          : photo
      )
  );
};
