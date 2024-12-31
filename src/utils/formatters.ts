export const formatters = {
  formatBONumber: (value: string): string => {
    // Remove any non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
    
    // Insert slash after the first 6 characters if they exist
    if (cleaned.length >= 6) {
      return cleaned.slice(0, 6) + '/' + cleaned.slice(6, 8);
    }
    
    return cleaned;
  },

  formatPDFFilename: (boNumber: string): string => {
    // Extract the letters and numbers from BO number (e.g., "AB1234/25")
    const cleanBO = boNumber.replace(/[^A-Za-z0-9]/g, '');
    
    // Format as LLNNNN-NN (e.g., "AB1234-25")
    const letters = cleanBO.slice(0, 2);
    const numbers = cleanBO.slice(2, 6);
    const year = cleanBO.slice(6, 8);
    
    return `${letters}${numbers}-${year}_relatorio-fotografico.pdf`;
  }
};