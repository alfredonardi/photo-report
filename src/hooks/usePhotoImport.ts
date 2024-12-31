import { useCallback } from 'react';

export const usePhotoImport = (onPhotoAdd: (photoData: string) => Promise<void>) => {
  const handleImportPhotos = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const files = Array.from(event.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (typeof e.target?.result === 'string') {
          await onPhotoAdd(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onPhotoAdd]);

  return { handleImportPhotos };
};