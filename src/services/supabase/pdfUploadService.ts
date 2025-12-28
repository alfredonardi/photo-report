import { supabase, isSupabaseConfigured } from './config';

/**
 * Interface para metadados do PDF
 */
export interface PDFMetadata {
  boNumber: string;
  version: string;
  selectedGroup: string;
  photoCount: number;
  generatedBy: string; // Email do usuário que gerou
  generatedAt: string; // ISO timestamp
  fileSize: number; // Tamanho do arquivo em bytes
  fileName: string;
}

/**
 * Serviço para fazer upload automático de PDFs para o Supabase
 */
export const pdfUploadService = {
  /**
   * Faz upload do PDF para o Supabase Storage
   * Retorna URL do arquivo ou null se falhar
   *
   * IMPORTANTE: Este upload acontece em segundo plano e não bloqueia a geração do PDF.
   * Se falhar, apenas loga o erro - o usuário ainda consegue baixar/compartilhar o PDF.
   */
  async uploadPDF(
    blob: Blob,
    metadata: PDFMetadata
  ): Promise<string | null> {
    try {
      // Verifica se Supabase está configurado
      if (!isSupabaseConfigured()) {
        console.log('📦 Supabase não configurado - PDF não será salvo na nuvem');
        return null;
      }

      console.log('☁️ Iniciando upload do PDF para a nuvem...');

      // Gera um nome único para o arquivo usando timestamp
      const timestamp = new Date().getTime();
      const sanitizedBO = metadata.boNumber.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `relatorios/${sanitizedBO}_v${metadata.version}_${timestamp}.pdf`;

      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs') // Nome do bucket (você vai criar no Supabase)
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Erro ao fazer upload do PDF:', uploadError);
        return null;
      }

      console.log('✅ PDF enviado para nuvem:', uploadData.path);

      // Salva metadados na tabela
      const { error: metadataError } = await supabase
        .from('pdf_reports') // Nome da tabela (você vai criar no Supabase)
        .insert({
          file_path: uploadData.path,
          file_name: metadata.fileName,
          file_size: metadata.fileSize,
          bo_number: metadata.boNumber,
          version: metadata.version,
          group_number: metadata.selectedGroup,
          photo_count: metadata.photoCount,
          generated_by: metadata.generatedBy,
          generated_at: metadata.generatedAt,
        });

      if (metadataError) {
        console.error('⚠️ PDF salvo mas erro ao salvar metadados:', metadataError);
        // Não retorna null porque o arquivo foi salvo
      } else {
        console.log('✅ Metadados salvos com sucesso!');
      }

      // Retorna a URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(uploadData.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Erro inesperado ao fazer upload:', error);
      return null;
    }
  },

  /**
   * Lista todos os PDFs de um usuário
   * Útil para implementar tela de histórico futuramente
   */
  async listUserPDFs(userEmail: string): Promise<any[]> {
    try {
      if (!isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabase
        .from('pdf_reports')
        .select('*')
        .eq('generated_by', userEmail)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar PDFs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao listar PDFs:', error);
      return [];
    }
  },

  /**
   * Busca PDFs por número de BO
   */
  async searchByBO(boNumber: string): Promise<any[]> {
    try {
      if (!isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabase
        .from('pdf_reports')
        .select('*')
        .eq('bo_number', boNumber)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar PDFs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar PDFs:', error);
      return [];
    }
  },
};
