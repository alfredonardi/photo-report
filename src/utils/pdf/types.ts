export interface Photo {
  id: number;
  photo: string;
  description: string;
  position: number;
  rotation: number;
}

export interface ReportData {
  boNumber: string;
  version: string;
  selectedGroup: string;
  photos: Photo[];
  logo: string;
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