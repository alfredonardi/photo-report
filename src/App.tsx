import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  FileDown,
  FileImage,
  RefreshCcw,
  Upload,
} from 'lucide-react';
import { PhotoList } from './components/PhotoList';
import { BOInput } from './components/BOInput';
import { AppFooter } from './components/AppFooter';
import { Login } from './components/Login';
import { SetPassword } from './components/SetPassword';
import { AuthHeader } from './components/AuthHeader';
import { ConfirmDialog } from './components/ConfirmDialog';
import { usePhotos } from './hooks/usePhotos';
import { usePhotoImport } from './hooks/usePhotoImport';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { showToast } from './utils/toast';
import { isSupabaseConfigured, supabase } from './services/supabase/config';
import logo from './assets/logo.jpg';

function App() {
  const {
    user,
    loading: authLoading,
    login,
    logout,
    isAuthenticated,
    isConfigured: isAuthConfigured,
  } = useAuth();
  const [selectedGroup, setSelectedGroup] = useLocalStorage('selectedGroup', '');
  const [boNumber, setBoNumber] = useLocalStorage('boNumber', '');
  const [version, setVersion] = useLocalStorage('version', '');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [isPDFConfirmOpen, setIsPDFConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    flushPendingDescriptions,
  } = usePhotos();

  const { handleImportPhotos, importFiles, isImporting, progress } = usePhotoImport(addPhoto);

  useEffect(() => {
    const checkPasswordSetup = async () => {
      if (!user || !supabase) return;

      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        if (!currentUser) return;

        const passwordSet = currentUser.user_metadata?.password_set;
        const isInviteUser = currentUser.app_metadata?.provider === 'email' &&
          currentUser.invited_at !== null;

        if (isInviteUser && passwordSet !== true) {
          console.log('👤 Usuário veio de convite - precisa definir senha');
          setNeedsPasswordSetup(true);
        } else {
          setNeedsPasswordSetup(false);
        }
      } catch (currentError) {
        console.error('Error checking password setup:', currentError);
        setNeedsPasswordSetup(false);
      }
    };

    checkPasswordSetup();
  }, [user]);

  const describedPhotos = useMemo(
    () => photos.filter((photo) => photo.description.trim().length > 0).length,
    [photos]
  );

  const reportReady = boNumber.length >= 9 && !!version && !!selectedGroup && photos.length > 0;
  const missingItems = [
    boNumber.length >= 9 ? null : 'BO',
    version ? null : 'Versão',
    selectedGroup ? null : 'Grupo',
    photos.length > 0 ? null : 'Fotos',
  ].filter(Boolean) as string[];

  const importStatusText = isImporting && progress
    ? `Importando ${progress.current} de ${progress.total}`
    : photos.length > 0
      ? `${photos.length} foto${photos.length > 1 ? 's' : ''} prontas para revisar`
      : 'Nenhuma foto importada ainda';

  const readinessLabel = reportReady
    ? 'Pronto para gerar'
    : missingItems.length === 1
      ? `Falta ${missingItems[0]}`
      : `Faltam ${missingItems.join(', ')}`;

  const handlePasswordSet = () => {
    setNeedsPasswordSetup(false);
    showToast.success('Bem-vindo ao sistema! 🎉');
  };

  const validateReportForPDF = (): boolean => {
    if (isImporting) {
      showToast.warning('Aguarde a importação terminar antes de gerar o PDF.');
      return false;
    }

    if (!boNumber || boNumber.length < 9) {
      showToast.warning('Por favor, preencha o número do BO corretamente (Ex: AB1234/25)');
      return false;
    }

    if (!version) {
      showToast.warning('Por favor, selecione a versão do relatório antes de continuar.');
      return false;
    }

    if (!selectedGroup) {
      showToast.warning('Por favor, selecione o grupo antes de continuar.');
      return false;
    }

    if (photos.length === 0) {
      showToast.warning('Importe pelo menos uma foto antes de gerar o PDF.');
      return false;
    }

    return true;
  };

  const handleGeneratePDF = () => {
    if (!validateReportForPDF()) {
      return;
    }

    setIsPDFConfirmOpen(true);
  };

  const confirmGeneratePDF = async () => {
    setIsPDFConfirmOpen(false);
    setIsGeneratingPDF(true);

    try {
      await flushPendingDescriptions();
      const { pdfGenerator } = await import('./utils/pdfGenerator');

      await pdfGenerator.generatePDF(photos, {
        boNumber,
        version,
        selectedGroup,
        logo,
        userEmail: user?.email,
      });
      showToast.success('PDF gerado com sucesso!');
    } catch (currentError) {
      console.error('Error generating PDF:', currentError);
      showToast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleClearReport = () => {
    if (isImporting) {
      showToast.warning('Aguarde a importação terminar antes de iniciar um novo relatório.');
      return;
    }

    setIsClearConfirmOpen(true);
  };

  const confirmClearReport = async () => {
    setIsClearConfirmOpen(false);

    try {
      await clearAllPhotos();
      setSelectedGroup('');
      setBoNumber('');
      setVersion('');
      showToast.success('Novo relatório iniciado!');
    } catch (currentError) {
      console.error('Error clearing report:', currentError);
      showToast.error('Erro ao limpar relatório. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    if (isImporting) {
      showToast.warning('Aguarde a importação terminar antes de sair do sistema.');
      return;
    }

    try {
      await flushPendingDescriptions();
      await logout();
    } catch (currentError) {
      console.error('Error logging out:', currentError);
      showToast.error('Erro ao sair do sistema. Tente novamente.');
    }
  };

  const openFilePicker = () => {
    if (!isImporting && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    if (isImporting || isLoading) {
      return;
    }

    const files = event.dataTransfer.files;
    if (!files?.length) {
      return;
    }

    await importFiles(files);
  };

  if (authLoading) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen auth-shell">
          <div className="auth-shell__panel text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg">
              ⏳
            </div>
            <p className="text-lg font-medium text-slate-700">Carregando ambiente seguro...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthConfigured || !isSupabaseConfigured()) {
    return (
      <>
        <Toaster />
        <div className="min-h-screen auth-shell px-4">
          <div className="auth-shell__panel max-w-2xl text-center">
            <img src={logo} alt="Logo" className="mx-auto mb-5 h-28 w-28 object-contain" />
            <p className="auth-shell__eyebrow">Configuração necessária</p>
            <h1 className="auth-shell__title">O acesso depende de uma conexão ativa com o Supabase</h1>
            <p className="auth-shell__description">
              Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para liberar autenticação,
              histórico de sessão e rastreabilidade do relatório.
            </p>
            <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-5 text-left text-sm leading-7 text-slate-600">
              <p>Arquivos de apoio: `SUPABASE_AUTH_SETUP.md` e `SUPABASE_SETUP.md`.</p>
              <p>Enquanto isso, o app permanece bloqueado para evitar gerar relatórios sem autoria.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <Login onLogin={login} />
      </>
    );
  }

  if (needsPasswordSetup) {
    return (
      <>
        <Toaster />
        <SetPassword onPasswordSet={handlePasswordSet} />
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen px-4 pb-10 pt-4 lg:px-6">
        {user && <AuthHeader user={user} onLogout={handleLogout} />}

        <main className="mx-auto mt-4 max-w-7xl">
          <section className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur xl:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-slate-200 bg-white">
                  <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 lg:text-3xl">
                    Relatório Fotográfico
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">{readinessLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm xl:justify-center">
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-slate-700">
                  BO {boNumber || 'pendente'}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-slate-700">
                  Versão {version || 'pendente'}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-slate-700">
                  Grupo {selectedGroup || 'pendente'}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-slate-700">
                  {photos.length} foto{photos.length > 1 ? 's' : ''}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-slate-700">
                  {describedPhotos} descriç{describedPhotos === 1 ? 'ão' : 'ões'}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                <button
                  onClick={handleGeneratePDF}
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isGeneratingPDF || isImporting || isLoading || photos.length === 0}
                >
                  <FileDown size={18} />
                  {isGeneratingPDF ? 'Gerando...' : 'Gerar PDF'}
                </button>
                <button
                  onClick={handleClearReport}
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isGeneratingPDF || isImporting || isLoading}
                >
                  <RefreshCcw size={18} />
                  Novo relatório
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur">
              <div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Dados do relatório
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Informações principais</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Boletim de ocorrência</label>
                  <BOInput value={boNumber} onChange={setBoNumber} required />
                </div>

                <div>
                  <label htmlFor="version" className="mb-2 block text-sm font-medium text-slate-700">
                    Versão do relatório
                  </label>
                  <select
                    id="version"
                    className="version-select"
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Selecione a versão</option>
                    {[...Array(5)].map((_, index) => (
                      <option key={index + 1} value={index + 1}>
                        Versão {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="group" className="mb-2 block text-sm font-medium text-slate-700">
                    Grupo responsável
                  </label>
                  <select
                    id="group"
                    className="group-select"
                    value={selectedGroup}
                    onChange={(event) => setSelectedGroup(event.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Selecione o grupo</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        Grupo {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Importação</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Importar fotos</h2>
                </div>
                <div className="rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-sm text-slate-600">
                  {isImporting && progress ? `${progress.current}/${progress.total} em andamento` : importStatusText}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                className="hidden"
                onChange={handleImportPhotos}
                disabled={isImporting || isLoading}
              />

              <div
                role="button"
                tabIndex={0}
                aria-disabled={isImporting || isLoading}
                onClick={openFilePicker}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openFilePicker();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(event) => void handleDrop(event)}
                className={`mt-6 rounded-[28px] border-2 border-dashed px-6 py-10 transition ${isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-slate-300/90 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-50'} ${isImporting || isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-950 text-white">
                    {isImporting ? <Upload className="animate-bounce" size={24} /> : <FileImage size={24} />}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {isImporting ? 'Importação em andamento' : 'Selecionar imagens'}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
                    {isImporting && progress
                      ? `Processando ${progress.current} de ${progress.total}: ${progress.currentFileName}`
                      : 'Arraste os arquivos ou clique para selecionar.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Fotos</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Organizar imagens</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-slate-600">
                  {photos.length} foto{photos.length > 1 ? 's' : ''}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 text-slate-600">
                  {describedPhotos} com descrição
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
                <div className="text-4xl">⏳</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">Carregando imagens do relatório...</p>
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
          </section>

          <AppFooter />
        </main>
      </div>

      <ConfirmDialog
        open={isPDFConfirmOpen}
        title="Gerar relatório em PDF"
        description={`Gerar o relatório do BO ${boNumber} com ${photos.length} foto${photos.length > 1 ? 's' : ''}?`}
        confirmLabel="Gerar PDF"
        tone="primary"
        onConfirm={confirmGeneratePDF}
        onClose={() => setIsPDFConfirmOpen(false)}
      />

      <ConfirmDialog
        open={isClearConfirmOpen}
        title="Iniciar um novo relatório"
        description="Isso vai limpar as fotos e os dados do relatório atual."
        confirmLabel="Limpar relatório"
        onConfirm={confirmClearReport}
        onClose={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
}

export default App;
