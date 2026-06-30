import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VisitaForm } from './components/VisitForm';
import { VisitsList } from './components/Visits';
import { Integrados } from './components/Integrados';
import { IntegradoForm } from './components/IntegradoForm';
import { ReferenceCurve } from './components/ReferenceCurve';
import { ImportData } from './components/ImportData';
import { Visit, Integrado } from './types';
import { Menu, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { storage } from './lib/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [isIntegradoFormOpen, setIsIntegradoFormOpen] = useState(false);
  
  const [integrados, setIntegrados] = useState<Integrado[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    try {
      const dataIntegrados = storage.getIntegrados();
      const dataVisits = storage.getVisits();
      setIntegrados(dataIntegrados);
      setVisits(dataVisits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let hasChanges = false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedIntegrados = integrados.map(i => {
      if (i.status === 'Em andamento') {
        const [year, month, day] = i.alojamentoDate.split('-');
        const alojamento = new Date(Number(year), Number(month) - 1, Number(day));
        
        const diffTime = today.getTime() - alojamento.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 120) {
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

  const handleAddVisit = (newVisit: Visit) => {
    const updatedVisits = [...visits, newVisit];
    setVisits(updatedVisits);
    storage.saveVisits(updatedVisits);
    setIsVisitFormOpen(false);
  };

  const handleUpdateVisit = (updatedVisit: Visit) => {
    const updatedVisits = visits.map(v => v.id === updatedVisit.id ? updatedVisit : v);
    setVisits(updatedVisits);
    storage.saveVisits(updatedVisits);
    setEditingVisitId(null);
    setIsVisitFormOpen(false);
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
        'Data da Visita': dataFormatada,
        'Integrado': integrado?.name || '',
        'Lote': integrado?.loteNumber || '',
        'Data de Alojamento': integrado?.alojamentoDate ? new Date(Number(integrado.alojamentoDate.split('-')[0]), Number(integrado.alojamentoDate.split('-')[1]) - 1, Number(integrado.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR') : '',
        'Idade (dias)': v.idade,
        'Consumo Real (kg)': v.consumoAcumuladoReal,
        'Mortalidade': v.mortalidade || '',
        'Status do Comedouro': v.comedouro || '',
        'Recomendação Técnica': v.recomendacao || '',
        'Colaborador/Técnico': v.colaborador || ''
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
                initialData={visitToEdit}
                onSave={editingVisitId ? handleUpdateVisit : handleAddVisit} 
                onCancel={() => { setIsVisitFormOpen(false); setEditingVisitId(null); }}
              />
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Histórico de Visitas</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button onClick={() => setIsIntegradoFormOpen(true)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-50 transition-colors">
                  + Novo Integrado
                </button>
                <button onClick={() => { setEditingVisitId(null); setIsVisitFormOpen(true); }} className="bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-slate-800 transition-colors">
                  + Novo Lançamento
                </button>
              </div>
            </div>
            {isIntegradoFormOpen && (
              <div className="mb-8">
                <IntegradoForm 
                  onSave={(i) => {
                    const newIntegrados = [...integrados, i];
                    setIntegrados(newIntegrados);
                    storage.saveIntegrados(newIntegrados);
                    setIsIntegradoFormOpen(false);
                  }}
                  onCancel={() => setIsIntegradoFormOpen(false)}
                />
              </div>
            )}
            <VisitsList visits={visits} integrados={integrados} onEditVisit={handleEditVisitClick} />
          </div>
        )
      }
      case 'integrados':
        return (
          <Integrados 
            integrados={integrados} 
            onUpdate={(updated) => {
              const updatedIntegrados = integrados.map(i => i.id === updated.id ? updated : i);
              setIntegrados(updatedIntegrados);
              storage.saveIntegrados(updatedIntegrados);
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
            <button onClick={handleExport} className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded font-medium text-xs md:text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">Exportar</button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
