export interface Photo {
  id: number;
  photo: string; // Mantido para compatibilidade - será igual a originalPhoto
  originalPhoto: string; // Imagem comprimida UMA VEZ com qualidade alta
  description: string;
  position: number;
  rotation: number; // Mantido para compatibilidade - será igual a rotationMetadata
  rotationMetadata: number; // Apenas o ângulo: 0, 90, 180, 270
}

export interface PDFConfig {
  boNumber: string;
  version: string;
  selectedGroup: string;
  logo: string;
}

export interface PDFMargins {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface PDFDimensions {
  width: number;
  height: number;
  headerHeight: number;
  footerHeight: number;
  contentHeight: number;
  maxBlockHeight: number;
  maxImageWidth: number;
  maxImageHeight: number;
  maxDescriptionHeight: number;
  spacingBetweenElements: number;
  spacingBetweenImageAndDescription: number;
  lineHeight: number;
}

export interface PDFReportRecord {
  id?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  bo_number: string;
  version: string;
  group_number: string;
  photo_count: number;
  generated_by: string;
  generated_at: string;
  created_at?: string;
}

export interface AuthError extends Error {
  message: string;
  status?: number;
  code?: string;
}

export interface ShareError extends Error {
  name: string;
  message: string;
}