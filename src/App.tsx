import { ErrorBoundary } from './components/ErrorBoundary';
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VisitaForm } from './components/VisitForm';
import { VisitsList } from './components/Visits';
import { Integrados } from './components/Integrados';
import { IntegradoForm } from './components/IntegradoForm';
import { ReferenceCurve } from './components/ReferenceCurve';
import { ImportData } from './components/ImportData';
import { Login } from './components/Login';
import { Notifications } from './components/Notifications';
import { Visit, Integrado } from './types';
import { Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from './lib/storage';
import { supabase } from './lib/supabase';
import { saveBackupToIndexedDB } from './lib/backup';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  
  const [integrados, setIntegrados] = useState<Integrado[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      await loadData();
      setIsSyncing(false);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    await loadData();
    setIsSyncing(false);
  };

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('registros').select('id').limit(1);
      if (error) {
        if ((error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed'))) {
          setDbError(null); // Ignore in offline mode
        } else if (error?.message?.includes('relation "public.profiles" does not exist')) {
          setDbError(`Erro no Supabase: A tabela 'registros' possui uma regra (Policy/RLS) que tenta acessar a tabela 'profiles', que foi deletada. Desative o RLS ou remova a regra no painel do Supabase.`);
        } else {
          setDbError(`Erro ao conectar com a tabela 'registros': ${error.message}`);
        }
      } else {
        setDbError(null);
      }
    } catch (err: any) {
      if (!(err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed'))) {
        setDbError(`Falha inesperada ao conectar: ${err.message}`);
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    await checkConnection();
    try {
      const dataIntegrados = await storage.getIntegrados();
      const dataVisits = await storage.getVisits();
      setIntegrados(dataIntegrados);
      setVisits(dataVisits);
    } catch (e) {
      console.warn('loadData failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOfflineLogin = () => {
      setSession({ user: { id: 'offline' } });
      loadData();
    };
    window.addEventListener('offline-login', handleOfflineLogin);
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error && (error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed'))) {
        handleOfflineLogin();
      } else {
        setSession(session);
        if (session) {
          loadData();
        } else {
          setLoading(false);
        }
      }
    }).catch((err) => {
      if ((err?.message?.includes('fetch') || err?.message?.includes('Failed') || err?.code === '0' || String(err).includes('fetch') || String(err).includes('Failed'))) {
        handleOfflineLogin();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadData();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('offline-login', handleOfflineLogin);
    };
  }, []);

  useEffect(() => {
    let hasChanges = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedIntegrados = integrados.map(i => {
      if (i.status === 'Em andamento' && i.alojamentoDate) {
        const [year, month, day] = i.alojamentoDate.split('-');
        const alojamento = new Date(Number(year), Number(month) - 1, Number(day));
        
        const diffTime = today.getTime() - alojamento.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 110) {
          hasChanges = true;
          return { 
            ...i, 
            status: 'Fechado' as const, 
            fechamentoDate: new Date().toISOString().split('T')[0] 
          };
        }
      }
      return i;
    });

    if (hasChanges) {
      setIntegrados(updatedIntegrados);
      storage.saveIntegrados(updatedIntegrados);
    }

  }, [integrados]);

  const processIntegradoFromVisit = async (newVisit: Visit, integradoNome?: string, alojamentoDate?: string) => {
    if (!integradoNome || !alojamentoDate) return;
    const existing = integrados.find(i => i.id === newVisit.integradoId);
    if (!existing) {
      const newIntegrado: Integrado = {
        id: newVisit.integradoId,
        name: integradoNome,
        alojamentoDate,
        status: 'Em andamento'
      };
      const updatedIntegrados = [...integrados, newIntegrado];
      setIntegrados(updatedIntegrados);
      await storage.saveIntegrados(updatedIntegrados);
    }
  };

  const handleAddVisit = async (newVisit: Visit, integradoNome?: string, alojamentoDate?: string) => {
    setIsVisitFormOpen(false);
    try {
      await processIntegradoFromVisit(newVisit, integradoNome, alojamentoDate);
      const updatedVisits = [...visits, newVisit];
      setVisits(updatedVisits);
      const savedVisits = await storage.saveVisits(updatedVisits, [newVisit]);
      setVisits([...savedVisits]);
      
      // Create local backup to IndexedDB
      await saveBackupToIndexedDB();
    } catch (error: any) {
      alert(`Erro ao salvar lançamento:\n\n${error.message}\n\nSe for um erro de RLS (Row-Level Security), vá ao painel do Supabase, acesse o SQL Editor e execute:\nALTER TABLE registros DISABLE ROW LEVEL SECURITY;`);
      // Revert the optimistic update if needed, but for now we just show the error.
    }
  };

  const handleUpdateVisit = async (updatedVisit: Visit, integradoNome?: string, alojamentoDate?: string) => {
    setEditingVisitId(null);
    setIsVisitFormOpen(false);
    try {
      await processIntegradoFromVisit(updatedVisit, integradoNome, alojamentoDate);
      const updatedVisits = visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
      setVisits(updatedVisits);
      const savedVisits = await storage.saveVisits(updatedVisits, [updatedVisit]);
      setVisits([...savedVisits]);
      
      // Create local backup to IndexedDB
      await saveBackupToIndexedDB();
    } catch (error: any) {
      alert(`Erro ao atualizar lançamento:\n\n${error.message}\n\nSe for um erro de RLS (Row-Level Security), vá ao painel do Supabase, acesse o SQL Editor e execute:\nALTER TABLE registros DISABLE ROW LEVEL SECURITY;`);
    }
  };

  const handleDeleteVisit = async (id: string) => {
    try {
      const updatedVisits = visits.filter(v => v.id !== id);
      setVisits(updatedVisits);
      await storage.deleteVisit(id);
    } catch (error: any) {
      alert(`Erro ao deletar lançamento:\n\n${error.message}\n\nSe for um erro de RLS (Row-Level Security), vá ao painel do Supabase, acesse o SQL Editor e execute:\nALTER TABLE registros DISABLE ROW LEVEL SECURITY;`);
    }
  };

  const handleEditVisitClick = (id: string) => {
    setEditingVisitId(id);
    setIsVisitFormOpen(true);
  };

  const handleNavigateToEditVisit = (id: string) => {
    setCurrentTab('visitas');
    handleEditVisitClick(id);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setIsSidebarOpen(false);
    setIsVisitFormOpen(false);
    setEditingVisitId(null);
  };


    const handleExport = (filteredVisits?: Visit[] | any) => {
    // Check if filteredVisits is truly an array (and not an Event object)
    const isArray = Array.isArray(filteredVisits);
    const listToExport = isArray && filteredVisits.length > 0 ? filteredVisits : visits;
    
    if (!listToExport || listToExport.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
    
    // Explicit headers
    const header = [
      'Data', 'Integrado', 'Alojamento', 'Idade', 'Animais Alojados', 
      'Animais Mortos', 'Vol. Cargas (kg)', 'Recomendação', 'Consumo acumulado', 
      'Comedouro', 'Colaborador', 'Meta Aloj', 'Cons. Aloj', 
      'Meta Cresc 1', 'Cons. Cresc 1', 'Meta Cresc 2', 'Cons. Cresc 2', 
      'Meta Cresc 3', 'Cons. Cresc 3', 'Meta Term 1', 'Cons. Term 1', 
      'Meta Term 2', 'Cons. Term 2', 'Meta Acum.', 'Peso aloj', 'Pontuação Sanitária'
    ];

    // Explicit data matrix
    const dataToExport = [
      header,
      ...listToExport.map((v: Visit) => {
        const integrado = integrados.find(i => i.id === v.integradoId);
        
        let dataFormatada = '';
        if (v.date) {
          const parts = v.date.split('-');
          if (parts.length === 3) {
            dataFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            dataFormatada = v.date;
          }
        }
        
        let alojamentoFormatado = '';
        if (integrado?.alojamentoDate) {
          const parts = integrado.alojamentoDate.split('-');
          if (parts.length === 3) {
            alojamentoFormatado = `${parts[2]}/${parts[1]}/${parts[0]}`;
          } else {
            alojamentoFormatado = integrado.alojamentoDate;
          }
        }
        
        return [
          dataFormatada,
          integrado?.name || '',
          alojamentoFormatado,
          v.idade !== undefined && v.idade !== null ? String(v.idade) : '',
          v.animaisAlojados !== undefined && v.animaisAlojados !== null ? String(v.animaisAlojados) : '',
          v.animaisMortos !== undefined && v.animaisMortos !== null ? String(v.animaisMortos) : '',
          v.volumeTotalCargas !== undefined && v.volumeTotalCargas !== null ? String(v.volumeTotalCargas) : '',
          v.recomendacao || '',
          v.consumoAcumuladoReal !== undefined && v.consumoAcumuladoReal !== null ? String(v.consumoAcumuladoReal) : '',
          
          v.comedouro || '',
          v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '',
          v.metaAlojamento !== undefined && v.metaAlojamento !== null ? String(v.metaAlojamento) : '',
          v.consumoAlojamento !== undefined && v.consumoAlojamento !== null ? String(v.consumoAlojamento) : '',
          v.metaCrescimento1 !== undefined && v.metaCrescimento1 !== null ? String(v.metaCrescimento1) : '',
          v.consumoCrescimento1 !== undefined && v.consumoCrescimento1 !== null ? String(v.consumoCrescimento1) : '',
          v.metaCrescimento2 !== undefined && v.metaCrescimento2 !== null ? String(v.metaCrescimento2) : '',
          v.consumoCrescimento2 !== undefined && v.consumoCrescimento2 !== null ? String(v.consumoCrescimento2) : '',
          v.metaCrescimento3 !== undefined && v.metaCrescimento3 !== null ? String(v.metaCrescimento3) : '',
          v.consumoCrescimento3 !== undefined && v.consumoCrescimento3 !== null ? String(v.consumoCrescimento3) : '',
          v.metaTerminacao1 !== undefined && v.metaTerminacao1 !== null ? String(v.metaTerminacao1) : '',
          v.consumoTerminacao1 !== undefined && v.consumoTerminacao1 !== null ? String(v.consumoTerminacao1) : '',
          v.metaTerminacao2 !== undefined && v.metaTerminacao2 !== null ? String(v.metaTerminacao2) : '',
          v.consumoTerminacao2 !== undefined && v.consumoTerminacao2 !== null ? String(v.consumoTerminacao2) : '',
          v.metaAcumulada !== undefined && v.metaAcumulada !== null ? String(v.metaAcumulada) : '',
          v.pesoAloj !== undefined && v.pesoAloj !== null ? String(v.pesoAloj) : '',
          v.pontuacaoSanitaria || ''
        ];
      })
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitas");
    
    // Fallback manual blob download for better mobile support
    try {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_visitas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting:', err);
      XLSX.writeFile(workbook, `relatorio_visitas_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  const renderContent = () => {
    return (
      <>
        <div style={{ display: currentTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard visits={visits} integrados={integrados} onNavigateToVisit={handleNavigateToEditVisit} />
        </div>
        
        {currentTab === 'visitas' && (
          isVisitFormOpen ? (
            <div className="space-y-6">
              <VisitaForm 
                integrados={integrados} 
                visits={visits}
                initialData={editingVisitId ? visits.find(v => v.id === editingVisitId) : undefined}
                onSave={editingVisitId ? handleUpdateVisit : handleAddVisit} 
                onCancel={() => { setIsVisitFormOpen(false); setEditingVisitId(null); }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <VisitsList 
                visits={visits} 
                integrados={integrados} 
                onEditVisit={handleEditVisitClick} 
                onDeleteVisit={handleDeleteVisit} 
                onExport={handleExport}
                onNewVisit={() => { setEditingVisitId(null); setIsVisitFormOpen(true); }}
              />
            </div>
          )
        )}
        
        {currentTab === 'integrados' && (
          <Integrados 
            integrados={integrados} 
            visits={visits}
            totalVisits={visits.length}
            onUpdate={async (updated) => {
              const updatedIntegrados = integrados.map(i => i.id === updated.id ? updated : i);
              setIntegrados(updatedIntegrados);
              await storage.saveIntegrados(updatedIntegrados);
              const visitsToSync = visits.filter(v => v.integradoId === updated.id);
              await storage.saveVisits(visits, visitsToSync);
            }}
            onDelete={async (id) => {
              try {
                const updatedIntegrados = integrados.filter(i => i.id !== id);
                setIntegrados(updatedIntegrados);
                
                const visitsToDelete = visits.filter(v => v.integradoId === id).map(v => v.id);
                const updatedVisits = visits.filter(v => v.integradoId !== id);
                setVisits(updatedVisits);
                
                await storage.deleteIntegrado(id, visitsToDelete as string[]);
              } catch (error: any) {
                alert(`Erro ao deletar integrado:\n\n${error.message}\n\nSe for um erro de RLS (Row-Level Security), vá ao painel do Supabase, acesse o SQL Editor e execute:\nALTER TABLE registros DISABLE ROW LEVEL SECURITY;`);
              }
            }}
          />
        )}
        
        {currentTab === 'curva' && <ReferenceCurve />}
        {currentTab === 'importar' && <ImportData onImportComplete={() => { loadData(); setCurrentTab('dashboard'); }} />}
      </>
    );
  };

  const getPageTitle = () => {
    switch(currentTab) {
      case 'dashboard': return 'Dashboard de Desempenho';
      case 'visitas': return isVisitFormOpen ? (editingVisitId ? 'Editar Lançamento' : 'Novo Lançamento') : 'Visitas';
      case 'integrados': return 'Histórico de Integrados';
      case 'curva': return 'Curva de Referência';
      case 'importar': return 'Importar Base de Dados';
      default: return 'Visão Geral';
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-500 font-medium">Carregando dados...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 transition-transform duration-300 ease-in-out`}>
        <Sidebar currentTab={currentTab.startsWith('visitas') ? 'visitas' : currentTab} setCurrentTab={handleTabChange} />
      </div>

      <main className="flex-1 flex flex-col w-full min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline-block">Data de Campo: {new Date().toLocaleDateString('pt-BR')}</span>
            
            <div className="flex items-center gap-2 mr-2">
              {isOnline ? (
                <button 
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-200"
                  title="Sincronizar dados agora"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Online</span>
                  {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
            </div>
            <Notifications visits={visits} integrados={integrados} />
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {dbError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Falha na conexão com banco de dados</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{dbError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
