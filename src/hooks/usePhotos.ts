import { useState, useEffect, useCallback, useRef } from 'react';
import { Photo, photoService } from '../services/database/photoService';
import { imageUtils } from '../utils/imageProcessing';
import { movePhotoToPosition, removePhotoAndReindex, sortPhotosByPosition } from '../utils/photoOrder';

/**
 * Hook personalizado para gerenciar fotos
 * Provê interface reativa para operações CRUD de fotos
 */
export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingDescriptionTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const latestDescriptionsRef = useRef<Map<number, string>>(new Map());

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

  const persistDescription = useCallback(async (id: number, description: string): Promise<void> => {
    try {
      await photoService.updatePhoto(id, { description });

      if (latestDescriptionsRef.current.get(id) === description) {
        latestDescriptionsRef.current.delete(id);
      }
    } catch (err) {
      const errorMessage = 'Erro ao atualizar descrição.';
      setError(errorMessage);
      console.error('Error updating description:', err);
    }
  }, []);

  const flushPendingDescriptions = useCallback(async (): Promise<void> => {
    if (latestDescriptionsRef.current.size === 0) {
      return;
    }

    pendingDescriptionTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    pendingDescriptionTimeoutsRef.current.clear();

    const pendingDescriptions = Array.from(latestDescriptionsRef.current.entries());
    await Promise.all(
      pendingDescriptions.map(([id, description]) => persistDescription(id, description))
    );
  }, [persistDescription]);

  useEffect(() => {
    const pendingDescriptionTimeouts = pendingDescriptionTimeoutsRef.current;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushPendingDescriptions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pendingDescriptionTimeouts.forEach((timeout) => clearTimeout(timeout));
      pendingDescriptionTimeouts.clear();
    };
  }, [flushPendingDescriptions]);

  /**
   * Adiciona uma nova foto
   * Comprime UMA VEZ com qualidade alta (0.95)
   */
  const addPhoto = useCallback(async (photoData: string): Promise<void> => {
    try {
      setError(null);

      // Comprime UMA ÚNICA VEZ com qualidade alta
      // Essa será a imagem "original" armazenada
      const compressedPhoto = await imageUtils.compressOnce(photoData, 1600, 1200, 0.95);

      // Adiciona ao banco
      const savedPhoto = await photoService.addPhoto(compressedPhoto);

      setPhotos(prev => sortPhotosByPosition([...prev, savedPhoto]));
    } catch (err) {
      const errorMessage = 'Não foi possível adicionar a foto. Tente novamente com outra imagem.';
      setError(errorMessage);
      console.error('Error adding photo:', err);
      // Propaga erro para que usePhotoImport possa detectar
      throw err;
    }
  }, []);

  /**
   * Atualiza descrição de uma foto
   * Mantém a UI sincronizada imediatamente e persiste com debounce
   */
  const updatePhotoDescription = useCallback((id: number, description: string): void => {
    if (description.length > 78) {
      description = description.substring(0, 78);
    }

    setError(null);
    latestDescriptionsRef.current.set(id, description);

    setPhotos(prev => prev.map((photo) =>
      photo.id === id ? { ...photo, description } : photo
    ));

    const existingTimeout = pendingDescriptionTimeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      pendingDescriptionTimeoutsRef.current.delete(id);
      const latestDescription = latestDescriptionsRef.current.get(id);

      if (latestDescription !== undefined) {
        void persistDescription(id, latestDescription);
      }
    }, 500);

    pendingDescriptionTimeoutsRef.current.set(id, timeout);
  }, [persistDescription]);

  /**
   * Atualiza posição de uma foto
   * FIX: Adiciona validação e atualização otimista
   */
  const updatePhotoPosition = useCallback(async (id: number, newPosition: number): Promise<void> => {
    const photo = photos.find(p => p.id === id);
    if (!photo || photo.position === newPosition) return;

    // FIX: Valida range da posição
    if (newPosition < 1 || newPosition > photos.length) {
      return;
    }

    try {
      setError(null);

      setPhotos(movePhotoToPosition(photos, id, newPosition));
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
   * Rotaciona uma foto (APENAS METADATA - SEM PROCESSAMENTO!)
   * A rotação é aplicada via CSS transform no componente
   * ZERO degradação de qualidade, não importa quantas vezes rotacionar
   */
  const rotatePhoto = useCallback(async (id: number, newRotation: number): Promise<void> => {
    // Valida valores de rotação
    if (![0, 90, 180, 270].includes(newRotation)) {
      return;
    }

    try {
      setError(null);

      const photo = photos.find(p => p.id === id);
      if (!photo) {
        throw new Error('Foto não encontrada');
      }

      // Evita atualização desnecessária se rotação é a mesma
      if (photo.rotationMetadata === newRotation) {
        return;
      }

      // Atualização otimista da UI
      setPhotos(prev => prev.map(p =>
        p.id === id
          ? {
              ...p,
              rotationMetadata: newRotation,
              rotation: newRotation, // Mantém compatibilidade
            }
          : p
      ));

      // Atualiza APENAS metadata no banco (ZERO processamento de imagem!)
      await photoService.updatePhoto(id, {
        rotationMetadata: newRotation,
        rotation: newRotation, // Mantém compatibilidade
      });
    } catch (err) {
      const errorMessage = 'Não foi possível rotacionar a foto. Tente novamente.';
      setError(errorMessage);
      console.error('Error rotating photo:', err);
      // Recarrega em caso de erro
      await loadPhotos();
    }
  }, [photos, loadPhotos]);

  /**
   * Remove uma foto
   */
  const removePhoto = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);

      const pendingTimeout = pendingDescriptionTimeoutsRef.current.get(id);
      if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingDescriptionTimeoutsRef.current.delete(id);
      }
      latestDescriptionsRef.current.delete(id);

      await photoService.removePhoto(id);
      setPhotos(prev => removePhotoAndReindex(prev, id));
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
      pendingDescriptionTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      pendingDescriptionTimeoutsRef.current.clear();
      latestDescriptionsRef.current.clear();
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
    flushPendingDescriptions,
    refreshPhotos: loadPhotos,
  };
};
