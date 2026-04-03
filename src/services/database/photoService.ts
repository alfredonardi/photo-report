import { dbPromise } from './indexedDB';
import { Photo } from '../../types';
import { movePhotoToPosition, removePhotoAndReindex, sortPhotosByPosition } from '../../utils/photoOrder';

/**
 * Serviço para gerenciar operações CRUD de fotos no IndexedDB
 * Usa a conexão compartilhada de indexedDB.ts
 */
export const photoService = {
  /**
   * Retorna todas as fotos do banco de dados
   */
  async getAllPhotos(): Promise<Photo[]> {
    const db = await dbPromise;
    const photos = await db.getAllFromIndex('photos', 'by-position');
    return sortPhotosByPosition(photos);
  },

  /**
   * Adiciona uma nova foto ao banco
   * Calcula automaticamente a próxima posição disponível
   *
   * @param photoData - Imagem já processada (comprimida com compressOnce)
   */
  async addPhoto(photoData: string): Promise<Photo> {
    const db = await dbPromise;
    const photos = await this.getAllPhotos();
    const maxPosition = photos.length > 0
      ? Math.max(...photos.map(p => p.position))
      : 0;

    const newPhoto: Omit<Photo, 'id'> = {
      photo: photoData, // Mantido para compatibilidade
      originalPhoto: photoData, // Nova estrutura: imagem comprimida UMA VEZ
      description: '',
      position: maxPosition + 1,
      rotation: 0, // Mantido para compatibilidade
      rotationMetadata: 0, // Nova estrutura: apenas metadata (0, 90, 180, 270)
    };

    const id = await db.add('photos', newPhoto as Photo);

    return {
      ...newPhoto,
      id: Number(id),
    };
  },

  /**
   * Atualiza uma foto existente
   * Se a posição mudar, reordena todas as posições afetadas
   */
  async updatePhoto(id: number, updates: Partial<Omit<Photo, 'id'>>): Promise<void> {
    const db = await dbPromise;
    const photo = await db.get('photos', id);
    
    if (!photo) {
      throw new Error('Foto não encontrada');
    }

    // Se mudou a posição, troca com a foto que está na posição alvo
    if (updates.position !== undefined && updates.position !== photo.position) {
      const allPhotos = await this.getAllPhotos();

      const reorderedPhotos = movePhotoToPosition(allPhotos, id, updates.position).map((currentPhoto) =>
        currentPhoto.id === id
          ? { ...currentPhoto, ...updates, position: updates.position }
          : currentPhoto
      );

      const tx = db.transaction('photos', 'readwrite');

      for (const reorderedPhoto of reorderedPhotos) {
        await tx.store.put(reorderedPhoto);
      }

      await tx.done;
      return;
    }

    await db.put('photos', { ...photo, ...updates });
  },

  /**
   * Remove uma foto do banco
   * Reordena automaticamente as posições das fotos seguintes
   */
  async removePhoto(id: number): Promise<void> {
    const db = await dbPromise;
    const photo = await db.get('photos', id);
    
    if (!photo) return;

    const allPhotos = await this.getAllPhotos();
    const remainingPhotos = removePhotoAndReindex(allPhotos, id);
    const tx = db.transaction('photos', 'readwrite');

    await tx.store.delete(id);

    for (const currentPhoto of remainingPhotos) {
      await tx.store.put(currentPhoto);
    }

    await tx.done;
  },

  /**
   * Remove todas as fotos do banco
   */
  async clearAllPhotos(): Promise<void> {
    const db = await dbPromise;
    await db.clear('photos');
  },

  /**
   * Retorna uma foto específica por ID
   */
  async getPhotoById(id: number): Promise<Photo | undefined> {
    const db = await dbPromise;
    return db.get('photos', id);
  },

  /**
   * Retorna o total de fotos no banco
   */
  async getPhotoCount(): Promise<number> {
    const db = await dbPromise;
    return db.count('photos');
  },
};

// Re-exporta o tipo Photo para conveniência
export type { Photo };
