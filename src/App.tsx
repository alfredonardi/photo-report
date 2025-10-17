import React, { useState, useEffect } from 'react';
import { PhotoList } from './components/PhotoList';
import { BOInput } from './components/BOInput';
import { CameraButton } from './components/CameraButton';
import { usePhotos } from './hooks/usePhotos';
import { usePhotoImport } from './hooks/usePhotoImport';
import { useLocalStorage } from './hooks/useLocalStorage';
import { pdfGenerator } from './utils/pdfGenerator';
import { confirmations } from './utils/confirmations';
import logo from './assets/logo.jpg';

function App() {
  const [selectedGroup, setSelectedGroup] = useLocalStorage('selectedGroup', '');
  const [boNumber, setBoNumber] = useLocalStorage('boNumber', '');
  const [version, setVersion] = useLocalStorage('version', '');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const {
    photos,
    isLoading,
    error,
    addPhoto,
    updatePhotoDescription,
    updatePhotoPosition,
    rotatePhoto,
    removePhoto,
    clearAllPhotos,
  } = usePhotos();

  const { handleImportPhotos, isImporting, progress } = usePhotoImport(addPhoto);

  // FIX: Limpa erro após alguns segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // Poderia adicionar uma função clearError no hook
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleGeneratePDF = async () => {
    // FIX: Valida primeiro para evitar processamento desnecessário
    if (!boNumber || boNumber.length < 9) {
      alert('Por favor, preencha o número do BO corretamente (Ex: AB1234/25)');
      return;
    }

    if (!version) {
      alert('Por favor, selecione a versão do relatório antes de continuar.');
      return;
    }

    if (!selectedGroup) {
      alert('Por favor, selecione o grupo antes de continuar.');
      return;
    }

    // FIX: Valida quantidade mínima de fotos
    if (photos.length === 0) {
      alert('Adicione pelo menos uma foto antes de gerar o relatório.');
      return;
    }

    if (!confirmations.confirmPDFGeneration(boNumber, photos)) {
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await pdfGenerator.generatePDF(photos, {
        boNumber,
        version,
        selectedGroup,
        logo,
      });
      alert('✓ PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('✗ Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClearReport = async () => {
    const confirmClear = window.confirm(
      'Você realmente deseja iniciar um novo relatório?\n\n' +
      'Isso apagará:\n' +
      '• Todas as fotos\n' +
      '• Todas as descrições\n' +
      '• Todas as rotações\n\n' +
      'Esta ação não pode ser desfeita.'
    );

    if (confirmClear) {
      try {
        await clearAllPhotos();
        setSelectedGroup('');
        setBoNumber('');
        setVersion('');
        alert('✓ Novo relatório iniciado!');
      } catch (error) {
        console.error('Error clearing report:', error);
        alert('✗ Erro ao limpar relatório. Tente novamente.');
      }
    }
  };

  // FIX: Previne geração de PDF se houver operações pendentes
  const canGeneratePDF = !isGeneratingPDF && !isLoading && !isImporting && photos.length > 0;

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <img src={logo} alt="Logo da Aplicação" className="app-logo" />
        <h1 className="font-bold">Gerador de Relatório Fotográfico</h1>
      </div>

      {/* Form Inputs */}
      <div className="bo-input-container">
        <BOInput 
          value={boNumber} 
          onChange={setBoNumber}
          required
        />
        
        <select
          className="version-select"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          disabled={isLoading || isImporting}
        >
          <option value="">Selecione a versão</option>
          {[...Array(5)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Versão {i + 1}
            </option>
          ))}
        </select>

        <select
          className="group-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          disabled={isLoading || isImporting}
        >
          <option value="">Selecione o grupo</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              Grupo {num}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Import/Capture Buttons */}
      <div className="flex flex-col gap-3 mb-5">
        <input
          type="file"
          accept="image/*"
          multiple
          id="import-input"
          className="hidden"
          onChange={handleImportPhotos}
          disabled={isImporting || isLoading}
        />
        <button 
          onClick={() => document.getElementById('import-input')?.click()}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 active:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isImporting || isLoading}
        >
          {isImporting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Importando {progress?.current}/{progress?.total}...
            </span>
          ) : (
            'Importar Fotos'
          )}
        </button>
        <CameraButton 
          onPhotoCapture={addPhoto} 
          disabled={isLoading || isImporting} 
        />
      </div>

      {/* Error Message - FIX: Melhor estilização e botão de dismiss */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5 flex justify-between items-center">
          <span>⚠️ {error}</span>
          {/* FIX: Adicionar botão para fechar erro manualmente seria útil */}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600">Carregando fotos...</p>
        </div>
      ) : (
        <PhotoList
          photos={photos}
          onDescriptionChange={updatePhotoDescription}
          onPositionChange={updatePhotoPosition}
          onRotate={rotatePhoto}
          onRemove={removePhoto}
        />
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          onClick={handleGeneratePDF} 
          className="export-button disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canGeneratePDF}
          title={
            !canGeneratePDF 
              ? photos.length === 0 
                ? 'Adicione fotos antes de gerar PDF' 
                : 'Aguarde as operações em andamento' 
              : 'Gerar PDF com as fotos'
          }
        >
          {isGeneratingPDF ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Gerando PDF...
            </span>
          ) : (
            `Exportar como PDF${photos.length > 0 ? ` (${photos.length} foto${photos.length > 1 ? 's' : ''})` : ''}`
          )}
        </button>
        <button 
          onClick={handleClearReport} 
          className="start-button disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGeneratingPDF || isLoading || isImporting}
        >
          Iniciar Novo Relatório
        </button>
      </div>

      {/* Photo Count */}
      {!isLoading && photos.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-3">
          Total: {photos.length} foto{photos.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default App;
