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