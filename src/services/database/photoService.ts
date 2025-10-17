import { dbPromise } from './indexedDB';
import { Photo } from '../../types';

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
    return db.getAll('photos');
  },

  /**
   * Adiciona uma nova foto ao banco
   * Calcula automaticamente a próxima posição disponível
   */
  async addPhoto(photoData: string): Promise<number> {
    const db = await dbPromise;
    const photos = await this.getAllPhotos();
    const maxPosition = photos.length > 0 
      ? Math.max(...photos.map(p => p.position))
      : 0;

    const newPhoto: Omit<Photo, 'id'> = {
      photo: photoData,
      description: '',
      position: maxPosition + 1,
      rotation: 0,
    };

    return db.add('photos', newPhoto as Photo);
  },

  /**
   * Atualiza uma foto existente
   * Se a posição mudar, faz swap com a foto na posição alvo
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
      const targetPhoto = allPhotos.find(p => p.position === updates.position);
      
      if (targetPhoto) {
        await db.put('photos', { ...targetPhoto, position: photo.position });
      }
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

    await db.delete('photos', id);

    // Reordena as fotos que vinham depois
    const allPhotos = await this.getAllPhotos();
    const photosToUpdate = allPhotos
      .filter(p => p.position > photo.position)
      .sort((a, b) => a.position - b.position);

    for (const p of photosToUpdate) {
      await db.put('photos', { ...p, position: p.position - 1 });
    }
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
