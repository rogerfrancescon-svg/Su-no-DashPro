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
import { Visit, Integrado } from './types';
import { Menu, X, LogOut, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from './lib/storage';
import { supabase } from './lib/supabase';

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

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('registros').select('id').limit(1);
      if (error) {
        if ((error?.message?.includes('fetch') || error?.message?.includes('Failed') || error?.code === '0' || String(error).includes('fetch') || String(error).includes('Failed'))) {
          setDbError(null); // Ignore in offline mode
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
    await processIntegradoFromVisit(newVisit, integradoNome, alojamentoDate);
    const updatedVisits = [...visits, newVisit];
    setVisits(updatedVisits);
    const savedVisits = await storage.saveVisits(updatedVisits, [newVisit]);
    setVisits([...savedVisits]);
  };

  const handleUpdateVisit = async (updatedVisit: Visit, integradoNome?: string, alojamentoDate?: string) => {
    setEditingVisitId(null);
    setIsVisitFormOpen(false);
    await processIntegradoFromVisit(updatedVisit, integradoNome, alojamentoDate);
    const updatedVisits = visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
    setVisits(updatedVisits);
    const savedVisits = await storage.saveVisits(updatedVisits, [updatedVisit]);
    setVisits([...savedVisits]);
  };

  const handleDeleteVisit = async (id: string) => {
    const updatedVisits = visits.filter(v => v.id !== id);
    setVisits(updatedVisits);
    await storage.deleteVisit(id);
  };

  const handleEditVisitClick = (id: string) => {
    setEditingVisitId(id);
    setIsVisitFormOpen(true);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setIsSidebarOpen(false);
    setIsVisitFormOpen(false);
    setEditingVisitId(null);
  };


  const handleExport = () => {
    const dataToExport = visits.map(v => {
      const integrado = integrados.find(i => i.id === v.integradoId);
      const dataFormatada = v.date ? new Date(Number(v.date.split('-')[0]), Number(v.date.split('-')[1]) - 1, Number(v.date.split('-')[2])).toLocaleDateString('pt-BR') : '';
      
      return {
        'Data': dataFormatada,
        'Integrado': integrado?.name || '',
        'Alojamento': integrado?.alojamentoDate ? new Date(Number(integrado.alojamentoDate.split('-')[0]), Number(integrado.alojamentoDate.split('-')[1]) - 1, Number(integrado.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR') : '',
        'Idade': v.idade,
        'Animais Alojados': v.animaisAlojados || '',
        'Recomendação': v.recomendacao || '',
        'Consumo acumulado': v.consumoAcumuladoReal ?? '',
        'Animais Mortos': v.animaisMortos ?? '',
        'Comedouro': v.comedouro || '',
        'Colaborador': v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '',
        'Meta Aloj': v.metaAlojamento || '',
        'Cons. Aloj': v.consumoAlojamento || '',
        'Meta Cresc 1': v.metaCrescimento1 || '',
        'Cons. Cresc 1': v.consumoCrescimento1 || '',
        'Meta Cresc 2': v.metaCrescimento2 || '',
        'Cons. Cresc 2': v.consumoCrescimento2 || '',
        'Meta Cresc 3': v.metaCrescimento3 || '',
        'Cons. Cresc 3': v.consumoCrescimento3 || '',
        'Meta Term 1': v.metaTerminacao1 || '',
        'Cons. Term 1': v.consumoTerminacao1 || '',
        'Meta Term 2': v.metaTerminacao2 || '',
        'Cons. Term 2': v.consumoTerminacao2 || '',
        'Cons. Acum. Real': v.consumoAcumuladoReal ?? '',
        'Meta Acum.': v.metaAcumulada || '',
        'Peso aloj': v.pesoAloj || '',
        'Pontuação Sanitária': v.pontuacaoSanitaria || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Auto-size columns slightly
    const colWidths = [
      { wch: 15 }, // Data
      { wch: 25 }, // Integrado
      { wch: 10 }, // Lote
      { wch: 18 }, // Alojamento
      { wch: 12 }, // Idade
      { wch: 18 }, // Consumo
      { wch: 15 }, // Mortalidade
      { wch: 20 }, // Comedouro
      { wch: 40 }, // Recomendação
      { wch: 25 }  // Colaborador
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitas");
    
    XLSX.writeFile(workbook, `relatorio_visitas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard visits={visits} integrados={integrados} />;
      case 'visitas': {
        if (isVisitFormOpen) {
          const visitToEdit = editingVisitId ? visits.find(v => v.id === editingVisitId) : undefined;
          return (
            <div className="space-y-6">
              <VisitaForm 
                integrados={integrados} 
                visits={visits}
                initialData={visitToEdit}
                onSave={editingVisitId ? handleUpdateVisit : handleAddVisit} 
                onCancel={() => { setIsVisitFormOpen(false); setEditingVisitId(null); }}
              />
            </div>
          );
        }
        return (
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
      }
      case 'integrados':
        return (
          <Integrados 
            integrados={integrados} 
            visits={visits}
            totalVisits={visits.length}
            onUpdate={async (updated) => {
              const updatedIntegrados = integrados.map(i => i.id === updated.id ? updated : i);
              setIntegrados(updatedIntegrados);
              await storage.saveIntegrados(updatedIntegrados);
              // Save visits so that the new Integrado name/alojamento gets updated in all its records in Supabase
              const visitsToSync = visits.filter(v => v.integradoId === updated.id);
              await storage.saveVisits(visits, visitsToSync);
            }}
            onDelete={async (id) => {
              const updatedIntegrados = integrados.filter(i => i.id !== id);
              setIntegrados(updatedIntegrados);
              
              const visitsToDelete = visits.filter(v => v.integradoId === id).map(v => v.id);
              const updatedVisits = visits.filter(v => v.integradoId !== id);
              setVisits(updatedVisits);
              
              await storage.deleteIntegrado(id, visitsToDelete as string[]);
            }}
          />
        );
      case 'curva':
        return <ReferenceCurve />;
      case 'importar':
        return <ImportData onImportComplete={() => { loadData(); setCurrentTab('dashboard'); }} />;
      default:
        return <Dashboard visits={visits} integrados={integrados} />;
    }
  };

  const getPageTitle = () => {
    switch(currentTab) {
      case 'dashboard': return 'Dashboard de Desempenho';
      case 'visitas': return isVisitFormOpen ? (editingVisitId ? 'Editar Lançamento' : 'Novo Lançamento') : 'Lançamentos';
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
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
