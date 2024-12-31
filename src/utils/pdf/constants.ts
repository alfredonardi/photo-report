export const PDF_CONFIG = {
  FONT: {
    family: 'Helvetica',
    sizes: {
      title: 20,
      header: {
        large: 16,
        medium: 14,
        small: 12
      },
      description: 12,
      footer: 10
    }
  },
  HEADER: {
    height: 100,
    logoWidth: 84,
    logoHeight: 112,
    textSpacing: 15,
    lineSpacing: 15,
    textStartY: 25
  },
  SPACING: {
    page: 20,
    betweenElements: 10,
    betweenImageAndDescription: 12
  },
  PHOTO: {
    maxHeight: 300
  },
  COMPRESSION: {
    quality: 0.7
  }
} as const;