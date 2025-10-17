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
   * FIX: Melhora tratamento de erro e não joga exceção desnecessária
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
      // FIX: Não joga erro aqui, apenas loga - o componente já trata o erro via state
    }
  }, [loadPhotos]);

  /**
   * Atualiza descrição de uma foto
   * FIX: Adiciona validação de entrada
   */
  const updatePhotoDescription = useCallback(async (id: number, description: string): Promise<void> => {
    // FIX: Valida entrada antes de processar
    if (description.length > 78) {
      console.warn('Descrição excede 78 caracteres, truncando...');
      description = description.substring(0, 78);
    }

    try {
      setError(null);
      await photoService.updatePhoto(id, { description });
      
      // FIX: Atualização otimista - atualiza UI antes de recarregar
      setPhotos(prev => prev.map(p => 
        p.id === id ? { ...p, description } : p
      ));
    } catch (err) {
      const errorMessage = 'Erro ao atualizar descrição.';
      setError(errorMessage);
      console.error('Error updating description:', err);
      // Recarrega para sincronizar em caso de erro
      await loadPhotos();
    }
  }, [loadPhotos]);

  /**
   * Atualiza posição de uma foto
   * FIX: Adiciona validação e atualização otimista
   */
  const updatePhotoPosition = useCallback(async (id: number, newPosition: number): Promise<void> => {
    const photo = photos.find(p => p.id === id);
    if (!photo || photo.position === newPosition) return;

    // FIX: Valida range da posição
    if (newPosition < 1 || newPosition > photos.length) {
      console.error('Posição inválida:', newPosition);
      return;
    }

    try {
      setError(null);
      
      // FIX: Atualização otimista da UI
      const oldPosition = photo.position;
      const updatedPhotos = photos.map(p => {
        if (p.id === id) return { ...p, position: newPosition };
        if (oldPosition < newPosition) {
          // Move para baixo: decrementa posições entre old e new
          if (p.position > oldPosition && p.position <= newPosition) {
            return { ...p, position: p.position - 1 };
          }
        } else {
          // Move para cima: incrementa posições entre new e old
          if (p.position >= newPosition && p.position < oldPosition) {
            return { ...p, position: p.position + 1 };
          }
        }
        return p;
      });
      
      setPhotos(updatedPhotos);
      
      await photoService.updatePhoto(id, { position: newPosition });
    } catch (err) {
      const errorMessage = 'Erro ao atualizar posição.';
      setError(errorMessage);
      console.error('Error updating position:', err);
      // Recarrega em caso de erro
      await loadPhotos();
    }
  }, [photos, loadPhotos]);

  /**
   * Rotaciona uma foto
   * FIX: Adiciona validação de rotação
   */
  const rotatePhoto = useCallback(async (id: number, newRotation: number): Promise<void> => {
    // FIX: Valida valores de rotação
    if (![0, 90, 180, 270].includes(newRotation)) {
      console.error('Rotação inválida:', newRotation);
      return;
    }

    try {
      setError(null);
      
      const photo = photos.find(p => p.id === id);
      if (!photo) {
        throw new Error('Foto não encontrada');
      }

      // FIX: Evita processamento desnecessário se rotação é a mesma
      if (photo.rotation === newRotation) {
        return;
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
    }
  }, [photos, loadPhotos]);

  /**
   * Remove uma foto
   */
  const removePhoto = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      
      // FIX: Atualização otimista
      setPhotos(prev => prev.filter(p => p.id !== id));
      
      await photoService.removePhoto(id);
    } catch (err) {
      const errorMessage = 'Erro ao remover foto.';
      setError(errorMessage);
      console.error('Error removing photo:', err);
      // Recarrega em caso de erro
      await loadPhotos();
    }
  }, [loadPhotos]);

  /**
   * Limpa todas as fotos
   */
  const clearAllPhotos = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await photoService.clearAllPhotos();
      setPhotos([]); // FIX: Limpa state imediatamente
    } catch (err) {
      const errorMessage = 'Erro ao limpar fotos.';
      setError(errorMessage);
      console.error('Error clearing photos:', err);
      await loadPhotos();
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
