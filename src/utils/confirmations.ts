import { Photo } from '../types';
import { showToast } from './toast';

export const confirmations = {
  confirmPDFGeneration(boNumber: string, photos: Photo[]): boolean {
    if (!boNumber || boNumber.length < 9) {
      showToast.warning('Por favor, preencha o número do BO corretamente (Ex: AB1234/25) antes de gerar o PDF.');
      return false;
    }

    if (photos.length === 0) {
      showToast.warning('Adicione pelo menos uma foto antes de gerar o PDF.');
      return false;
    }

    return window.confirm(
      'Confirma a geração do relatório em PDF?\n\n' +
      `BO: ${boNumber}\n` +
      `Total de fotos: ${photos.length}`
    );
  }
};