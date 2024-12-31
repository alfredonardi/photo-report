import { useState, useEffect } from 'react';
import { Photo, photoService } from '../services/database/photoService';
import { imageUtils } from '../utils/imageProcessing';

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const loadedPhotos = await photoService.getAllPhotos();
    setPhotos(loadedPhotos);
  };

  const addPhoto = async (photoData: string) => {
    const resizedPhoto = await imageUtils.resizeAndRotateToLandscape(photoData);
    await photoService.addPhoto(resizedPhoto);
    await loadPhotos();
  };

  const updatePhotoDescription = async (id: number, description: string) => {
    await photoService.updatePhoto(id, { description });
    await loadPhotos();
  };

  const updatePhotoPosition = async (id: number, newPosition: number) => {
    const photo = photos.find(p => p.id === id);
    if (!photo || photo.position === newPosition) return;

    // Update positions of other photos
    if (newPosition < photo.position) {
      const photosToUpdate = photos.filter(
        p => p.position >= newPosition && p.position < photo.position && p.id !== id
      );
      for (const p of photosToUpdate) {
        await photoService.updatePhoto(p.id, { position: p.position + 1 });
      }
    } else {
      const photosToUpdate = photos.filter(
        p => p.position <= newPosition && p.position > photo.position && p.id !== id
      );
      for (const p of photosToUpdate) {
        await photoService.updatePhoto(p.id, { position: p.position - 1 });
      }
    }

    await photoService.updatePhoto(id, { position: newPosition });
    await loadPhotos();
  };

  const rotatePhoto = async (id: number, newRotation: number) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    const rotationDiff = newRotation - photo.rotation;
    const rotatedImage = await imageUtils.rotateImage(photo.photo, rotationDiff);

    await photoService.updatePhoto(id, { 
      photo: rotatedImage, 
      rotation: newRotation 
    });
    await loadPhotos();
  };

  const removePhoto = async (id: number) => {
    await photoService.removePhoto(id);
    await loadPhotos();
  };

  const clearAllPhotos = async () => {
    await photoService.clearAllPhotos();
    await loadPhotos();
  };

  return {
    photos,
    addPhoto,
    updatePhotoDescription,
    updatePhotoPosition,
    rotatePhoto,
    removePhoto,
    clearAllPhotos,
  };
};