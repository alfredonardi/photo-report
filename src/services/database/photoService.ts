import { dbPromise } from './indexedDB';
import { Photo } from '../../types';

export const photoService = {
  async addPhoto(photo: string, description = '', rotation = 0): Promise<number> {
    const db = await dbPromise;
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');
    
    // Get all photos to determine the next position
    const allPhotos = await store.getAll();
    const nextPosition = allPhotos.length + 1;
    
    // Add new photo with auto-generated ID
    const id = await store.add({
      photo,
      description,
      position: nextPosition,
      rotation
    });
    
    await transaction.done;
    return id;
  },

  async updatePhoto(id: number, updatedData: Partial<Photo>): Promise<void> {
    const db = await dbPromise;
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');
    
    const existingPhoto = await store.get(id);
    if (!existingPhoto) return;

    if (updatedData.position && updatedData.position !== existingPhoto.position) {
      const allPhotos = await store.getAll();
      const oldPosition = existingPhoto.position;
      const newPosition = updatedData.position;

      // Update positions of other photos
      for (const photo of allPhotos) {
        if (photo.id === id) continue;

        let newPos = photo.position;
        if (oldPosition < newPosition) {
          if (photo.position > oldPosition && photo.position <= newPosition) {
            newPos = photo.position - 1;
          }
        } else {
          if (photo.position >= newPosition && photo.position < oldPosition) {
            newPos = photo.position + 1;
          }
        }

        if (newPos !== photo.position) {
          await store.put({ ...photo, position: newPos });
        }
      }
    }

    // Update the target photo
    await store.put({ ...existingPhoto, ...updatedData });
    await transaction.done;
  },

  async removePhoto(id: number): Promise<void> {
    const db = await dbPromise;
    const transaction = db.transaction('photos', 'readwrite');
    const store = transaction.objectStore('photos');
    
    const photo = await store.get(id);
    if (!photo) return;

    // Remove the photo
    await store.delete(id);

    // Get remaining photos and update positions
    const allPhotos = await store.getAll();
    const sortedPhotos = allPhotos
      .sort((a, b) => a.position - b.position)
      .filter(p => p.id !== id);
    
    // Update positions to be sequential
    for (let i = 0; i < sortedPhotos.length; i++) {
      const newPosition = i + 1;
      if (sortedPhotos[i].position !== newPosition) {
        await store.put({ ...sortedPhotos[i], position: newPosition });
      }
    }

    await transaction.done;
  },

  async getAllPhotos(): Promise<Photo[]> {
    const db = await dbPromise;
    const photos = await db.getAll('photos');
    return photos.sort((a, b) => a.position - b.position);
  },

  async clearAllPhotos(): Promise<void> {
    const db = await dbPromise;
    const transaction = db.transaction('photos', 'readwrite');
    await transaction.objectStore('photos').clear();
    await transaction.done;
  }
};