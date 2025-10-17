import { useCallback, useState } from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ImportProgress {
  total: number;
  current: number;
  currentFileName: string;
}

/**
 * Hook para importar múltiplas fotos com validação e feedback
 */
export const usePhotoImport = (onPhotoAdd: (photoData: string) => Promise<void>) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  /**
   * Valida arquivo antes de processar
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Valida tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Formato não suportado: ${file.name}. Use JPEG, PNG ou WebP.`,
      };
    }

    // Valida tamanho
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `Arquivo muito grande: ${file.name} (${sizeMB}MB). Máximo: 10MB.`,
      };
    }

    return { valid: true };
  };

  /**
   * Processa um único arquivo
   */
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error('Formato de arquivo inválido'));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Erro ao ler arquivo: ${file.name}`));
      };

      reader.readAsDataURL(file);
    });
  };

  /**
   * Manipula importação de múltiplos arquivos
   */
  const handleImportPhotos = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;

      setIsImporting(true);
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      const errors: string[] = [];

      try {
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];

          // Atualiza progresso
          setProgress({
            total: totalFiles,
            current: i + 1,
            currentFileName: file.name,
          });

          // Valida arquivo
          const validation = validateFile(file);
          if (!validation.valid) {
            errors.push(validation.error!);
            continue;
          }

          try {
            // Processa e adiciona foto
            const photoData = await processFile(file);
            await onPhotoAdd(photoData);
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            errors.push(`Erro ao processar: ${file.name}`);
          }
        }

        // Mostra resumo
        if (errors.length > 0) {
          const successCount = totalFiles - errors.length;
          alert(
            `Importação concluída:\n` +
            `✓ ${successCount} foto(s) importada(s)\n` +
            `✗ ${errors.length} erro(s):\n\n` +
            errors.join('\n')
          );
        } else {
          alert(`✓ ${totalFiles} foto(s) importada(s) com sucesso!`);
        }
      } catch (error) {
        console.error('Error importing photos:', error);
        alert('Erro inesperado durante importação. Tente novamente.');
      } finally {
        setIsImporting(false);
        setProgress(null);
        // Limpa input para permitir reimportação dos mesmos arquivos
        event.target.value = '';
      }
    },
    [onPhotoAdd]
  );

  return {
    handleImportPhotos,
    isImporting,
    progress,
  };
};
