import React from 'react';
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

  const {
    photos,
    addPhoto,
    updatePhotoDescription,
    updatePhotoPosition,
    rotatePhoto,
    removePhoto,
    clearAllPhotos,
  } = usePhotos();

  const { handleImportPhotos } = usePhotoImport(addPhoto);

  const handleGeneratePDF = async () => {
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

    if (!confirmations.confirmPDFGeneration(boNumber, photos)) {
      return;
    }
    
    await pdfGenerator.generatePDF(photos, {
      boNumber,
      version,
      selectedGroup,
      logo,
    });
  };

  const handleClearReport = async () => {
    const confirmClear = window.confirm(
      'Você realmente deseja iniciar um novo relatório? Isso apagará todas as fotos, descrições e rotações.'
    );
    if (confirmClear) {
      await clearAllPhotos();
      setSelectedGroup('');
      setBoNumber('');
      setVersion('');
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <img src={logo} alt="Logo da Aplicação" className="app-logo" />
        <h1 className="font-bold">Gerador de Relatório Fotográfico</h1>
      </div>

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
        >
          <option value="">Selecione o grupo</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              Grupo {num}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <input
          type="file"
          accept="image/*"
          multiple
          id="import-input"
          className="hidden"
          onChange={handleImportPhotos}
        />
        <button 
          onClick={() => document.getElementById('import-input')?.click()}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 active:bg-blue-700 transition-all"
        >
          Importar Fotos
        </button>
        <CameraButton onPhotoCapture={addPhoto} />
      </div>

      <PhotoList
        photos={photos}
        onDescriptionChange={updatePhotoDescription}
        onPositionChange={updatePhotoPosition}
        onRotate={rotatePhoto}
        onRemove={removePhoto}
      />

      <div className="action-buttons">
        <button onClick={handleGeneratePDF} className="export-button">
          Exportar como PDF
        </button>
        <button onClick={handleClearReport} className="start-button">
          Iniciar Novo Relatório
        </button>
      </div>
    </div>
  );
}

export default App;