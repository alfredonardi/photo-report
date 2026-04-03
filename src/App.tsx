import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
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

interface SummaryCardProps {
  label: string;
  value: string;
  detail: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, detail }) => (
  <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
  </div>
);

interface ChecklistItemProps {
  done: boolean;
  title: string;
  description: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ done, title, description }) => {
  const Icon = done ? CheckCircle2 : AlertCircle;
  const iconClassName = done ? 'text-emerald-600' : 'text-amber-600';

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3">
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconClassName}`} />
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
};

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

  const readyFieldsCount = [
    boNumber.length >= 9,
    version.length > 0,
    selectedGroup.length > 0,
  ].filter(Boolean).length;

  const reportReady = boNumber.length >= 9 && !!version && !!selectedGroup && photos.length > 0;

  const importStatusText = isImporting && progress
    ? `Importando ${progress.current} de ${progress.total}`
    : photos.length > 0
      ? `${photos.length} foto${photos.length > 1 ? 's' : ''} prontas para revisar`
      : 'Nenhuma foto importada ainda';

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
          <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] xl:items-start">
              <div>
                <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Workspace de preparação
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                      Monte o relatório no app, preserve o PDF exatamente como ele já sai hoje.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
                      O fluxo agora fica mais claro para importar, revisar, ordenar e descrever as
                      imagens antes da exportação. A geração do documento final permanece intacta.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700">
                    BO {boNumber || 'não informado'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700">
                    Versão {version || 'pendente'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700">
                    Grupo {selectedGroup || 'pendente'}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <SummaryCard
                  label="Fotos"
                  value={`${photos.length}`}
                  detail={importStatusText}
                />
                <SummaryCard
                  label="Descrições"
                  value={`${describedPhotos}/${photos.length || 0}`}
                  detail={describedPhotos === photos.length && photos.length > 0
                    ? 'Todas as imagens já têm contexto preenchido.'
                    : 'As descrições ajudam a revisar rapidamente antes do PDF.'}
                />
                <SummaryCard
                  label="Checklist"
                  value={`${readyFieldsCount}/3`}
                  detail={reportReady
                    ? 'Tudo pronto para exportar o relatório.'
                    : 'Complete os campos do relatório e finalize a importação.'}
                />
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Contexto do relatório
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Configure o documento antes de revisar as imagens</h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Esses dados continuam alimentando o mesmo PDF. Só estamos melhorando a preparação.
                </p>
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

            <aside className="rounded-[32px] border border-white/70 bg-slate-950 p-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.18)] xl:sticky xl:top-24">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Pronto para exportar</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Checklist do relatório</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                O PDF continua igual. Esta área só ajuda a evitar exportações incompletas.
              </p>

              <div className="mt-5 space-y-3">
                <ChecklistItem
                  done={boNumber.length >= 9}
                  title="BO informado"
                  description={boNumber.length >= 9 ? boNumber : 'Preencha no formato AB1234/25.'}
                />
                <ChecklistItem
                  done={!!version && !!selectedGroup}
                  title="Versão e grupo definidos"
                  description={!!version && !!selectedGroup
                    ? `Versão ${version} no Grupo ${selectedGroup}.`
                    : 'Selecione a versão do relatório e o grupo responsável.'}
                />
                <ChecklistItem
                  done={photos.length > 0}
                  title="Imagens carregadas"
                  description={photos.length > 0
                    ? `${photos.length} foto${photos.length > 1 ? 's' : ''} pronta${photos.length > 1 ? 's' : ''} para o PDF.`
                    : 'Importe as imagens antes de exportar.'}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleGeneratePDF}
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-white px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isGeneratingPDF || isImporting || isLoading || photos.length === 0}
                >
                  <FileDown size={18} />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
                </button>
                <button
                  onClick={handleClearReport}
                  className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isGeneratingPDF || isImporting || isLoading}
                >
                  <RefreshCcw size={18} />
                  Iniciar novo relatório
                </button>
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Importação de imagens</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Traga as fotos para dentro do relatório</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Arraste arquivos para esta área ou clique para escolher imagens do dispositivo.
                  O fluxo segue focado exclusivamente em fotos importadas.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
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
                : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-slate-50'} ${isImporting || isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-lg">
                  {isImporting ? <Upload className="animate-bounce" size={28} /> : <FileImage size={28} />}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">
                  {isImporting ? 'Importação em andamento' : 'Importar novas imagens'}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  {isImporting && progress
                    ? `Processando ${progress.current} de ${progress.total}: ${progress.currentFileName}`
                    : 'Aceita JPEG, PNG, WebP e HEIC/HEIF. As imagens entram na ordem em que forem importadas e podem ser reorganizadas depois.'}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                  <Upload size={16} />
                  Arraste e solte aqui ou clique para selecionar
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Painel de revisão</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Revise, descreva e reordene as fotos</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600">
                  {photos.length} foto{photos.length > 1 ? 's' : ''}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600">
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
        description={`Vamos exportar o relatório do BO ${boNumber} com ${photos.length} foto${photos.length > 1 ? 's' : ''}. O layout do PDF permanece exatamente o mesmo; esta confirmação serve só para evitar exportações por engano.`}
        confirmLabel="Gerar PDF"
        tone="primary"
        onConfirm={confirmGeneratePDF}
        onClose={() => setIsPDFConfirmOpen(false)}
      />

      <ConfirmDialog
        open={isClearConfirmOpen}
        title="Iniciar um novo relatório"
        description="Isso vai limpar as fotos, descrições, rotações e os campos do relatório atual. Essa ação não afeta PDFs já exportados."
        confirmLabel="Limpar relatório"
        onConfirm={confirmClearReport}
        onClose={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
}

export default App;
