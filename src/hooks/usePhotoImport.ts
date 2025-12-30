import { useCallback, useState } from 'react';
import { showToast } from '../utils/toast';
import { imageUtils } from '../utils/imageProcessing';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
];

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
    // Valida tipo (inclui verificação por extensão para HEIC)
    const fileName = file.name.toLowerCase();
    const isHeicByExtension = fileName.endsWith('.heic') || fileName.endsWith('.heif');

    if (!ALLOWED_TYPES.includes(file.type) && !isHeicByExtension) {
      return {
        valid: false,
        error: `Formato não suportado: ${file.name}. Use JPEG, PNG, WebP ou HEIC.`,
      };
    }

    // Valida suporte a HEIC no navegador atual
    if (isHeicByExtension && !imageUtils.isHeicSupported()) {
      return {
        valid: false,
        error: `${file.name}: HEIC não suportado neste navegador. Use o app no celular ou converta para JPEG primeiro.`,
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
   * Processa um único arquivo (com conversão automática de HEIC)
   */
  const processFile = async (file: File): Promise<string> => {
    // Detecta se é HEIC/HEIF e converte para JPEG
    const isHeic =
      file.type.includes('heic') ||
      file.type.includes('heif') ||
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif');

    let fileToRead: Blob = file;

    if (isHeic) {
      try {
        // Converte HEIC para JPEG
        fileToRead = await imageUtils.convertHeicToJpeg(file);
      } catch (error) {
        console.error('Erro ao converter HEIC:', error);
        throw new Error(`Falha ao converter ${file.name} (HEIC). Navegador pode não suportar este formato.`);
      }
    }

    // Lê arquivo (original ou convertido) como base64
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

      reader.readAsDataURL(fileToRead);
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
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error(`Error processing ${file.name}:`, error);
            errors.push(`${file.name}: ${errorMessage}`);
          }
        }

        // Mostra resumo
        if (errors.length > 0) {
          const successCount = totalFiles - errors.length;
          showToast.warning(
            `Importação concluída: ${successCount} foto(s) importada(s), ${errors.length} erro(s). Veja o console para detalhes.`
          );
          console.warn('Erros na importação:');
          errors.forEach((error, index) => {
            console.error(`  ${index + 1}. ${error}`);
          });
        } else {
          showToast.success(`${totalFiles} foto(s) importada(s) com sucesso!`);
        }
      } catch (error) {
        console.error('Error importing photos:', error);
        showToast.error('Erro inesperado durante importação. Tente novamente.');
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
