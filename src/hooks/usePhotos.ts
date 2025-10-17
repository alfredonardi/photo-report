import { useState, useEffect, useCallback } from 'react';
import { Photo, photoService } from '../services/database/photoService';
import { imageUtils } from '../utils/imageProcessing';

/**
 * Hook personalizado para gerenciar fotos
 * Provê interface reativa para operações CRUD de fotos
 */
export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega todas as fotos do banco de dados
   */
  const loadPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedPhotos = await photoService.getAllPhotos();
      setPhotos(loadedPhotos);
    } catch (err) {
      const errorMessage = 'Erro ao carregar fotos. Tente recarregar a página.';
      setError(errorMessage);
      console.error('Error loading photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega fotos na inicialização
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  /**
   * Adiciona uma nova foto
   * Processa imagem (redimensiona e rotaciona se necessário)
   */
  const addPhoto = useCallback(async (photoData: string): Promise<void> => {
    try {
      setError(null);
      
      // Processa imagem para formato landscape e redimensiona
      const resizedPhoto = await imageUtils.resizeAndRotateToLandscape(photoData);
      
      // Adiciona ao banco
      await photoService.addPhoto(resizedPhoto);
      
      // Recarrega lista
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Não foi possível adicionar a foto. Tente novamente com outra imagem.';
      setError(errorMessage);
      console.error('Error adding photo:', err);
      throw new Error(errorMessage);
    }
  }, [loadPhotos]);

  /**
   * Atualiza descrição de uma foto
   */
  const updatePhotoDescription = useCallback(async (id: number, description: string): Promise<void> => {
    try {
      setError(null);
      await photoService.updatePhoto(id, { description });
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Erro ao atualizar descrição.';
      setError(errorMessage);
      console.error('Error updating description:', err);
      throw new Error(errorMessage);
    }
  }, [loadPhotos]);

  /**
   * Atualiza posição de uma foto
   */
  const updatePhotoPosition = useCallback(async (id: number, newPosition: number): Promise<void> => {
    const photo = photos.find(p => p.id === id);
    if (!photo || photo.position === newPosition) return;

    try {
      setError(null);
      await photoService.updatePhoto(id, { position: newPosition });
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Erro ao atualizar posição.';
      setError(errorMessage);
      console.error('Error updating position:', err);
      throw new Error(errorMessage);
    }
  }, [photos, loadPhotos]);

  /**
   * Rotaciona uma foto
   * Aplica rotação física na imagem
   */
  const rotatePhoto = useCallback(async (id: number, newRotation: number): Promise<void> => {
    try {
      setError(null);
      
      const photo = photos.find(p => p.id === id);
      if (!photo) {
        throw new Error('Foto não encontrada');
      }

      // Calcula diferença de rotação
      const rotationDiff = newRotation - photo.rotation;
      
      // Aplica rotação física na imagem
      const rotatedImage = await imageUtils.rotateImage(photo.photo, rotationDiff);

      // Atualiza banco com nova imagem e rotação
      await photoService.updatePhoto(id, { 
        photo: rotatedImage, 
        rotation: newRotation 
      });
      
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Não foi possível rotacionar a foto. Tente novamente.';
      setError(errorMessage);
      console.error('Error rotating photo:', err);
      throw new Error(errorMessage);
    }
  }, [photos, loadPhotos]);

  /**
   * Remove uma foto
   */
  const removePhoto = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      await photoService.removePhoto(id);
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Erro ao remover foto.';
      setError(errorMessage);
      console.error('Error removing photo:', err);
      throw new Error(errorMessage);
    }
  }, [loadPhotos]);

  /**
   * Limpa todas as fotos
   */
  const clearAllPhotos = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await photoService.clearAllPhotos();
      await loadPhotos();
    } catch (err) {
      const errorMessage = 'Erro ao limpar fotos.';
      setError(errorMessage);
      console.error('Error clearing photos:', err);
      throw new Error(errorMessage);
    }
  }, [loadPhotos]);

  return {
    photos,
    isLoading,
    error,
    addPhoto,
    updatePhotoDescription,
    updatePhotoPosition,
    rotatePhoto,
    removePhoto,
    clearAllPhotos,
    refreshPhotos: loadPhotos,
  };
};
