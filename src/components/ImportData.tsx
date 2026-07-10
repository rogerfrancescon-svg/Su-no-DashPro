import React, { useState, useEffect } from 'react';
import { preprocessImportData } from '../utils/import-parser';
import { storage } from '../lib/storage';
import * as XLSX from 'xlsx';

interface ImportDataProps {
  onImportComplete: () => void;
}

interface ErrorHistoryEntry {
  timestamp: string;
  errors: string[];
}

export function ImportData({ onImportComplete }: ImportDataProps) {
  const [rawData, setRawData] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [errorHistory, setErrorHistory] = useState<ErrorHistoryEntry[]>([]);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [showErrorHistory, setShowErrorHistory] = useState(false);

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('IMPORT_ERRORS_HISTORY');
      if (historyStr) {
        setErrorHistory(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error('Failed to load error history', e);
    }
  }, []);

  const saveToErrorHistory = (newErrors: string[]) => {
    if (newErrors.length === 0) return;
    
    const entry: ErrorHistoryEntry = {
      timestamp: new Date().toLocaleString('pt-BR'),
      errors: newErrors
    };
    
    const updatedHistory = [entry, ...errorHistory].slice(0, 10); // Keep last 10 imports with errors
    setErrorHistory(updatedHistory);
    try {
      localStorage.setItem('IMPORT_ERRORS_HISTORY', JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save error history', e);
    }
  };

  const clearErrorHistory = () => {
    setErrorHistory([]);
    localStorage.removeItem('IMPORT_ERRORS_HISTORY');
  };
  
  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const parseAndImport = async () => {
    if (!rawData.trim()) {
      alert("Cole os dados primeiro.");
      return;
    }
    
    setLoading(true);
    setLogs(['Iniciando importação...']);
    setErrors([]);
    
    try {
      const { integrados, visits, logs: processLogs, errors: processErrors } = preprocessImportData(rawData);
      
      setLogs(prev => [...prev, ...processLogs]);
      setErrors(processErrors);
      saveToErrorHistory(processErrors);
      
      if (integrados.length === 0 && visits.length === 0) {
        if (processErrors.length > 0) {
          addLog('A importação falhou. Nenhum registro válido foi encontrado.');
        } else {
          addLog('Nenhum registro para importar.');
        }
        setLoading(false);
        return;
      }

      if (processErrors.length > 0) {
        addLog(`Foram encontrados ${processErrors.length} erros. Importando registros válidos...`);
      }
      
      addLog(`Dados validados: ${integrados.length} integrados e ${visits.length} visitas encontradas.`);
      addLog('Dados validados. Salvando no banco de dados...');
      
      const currentIntegrados = await storage.getIntegrados();
      const currentVisits = await storage.getVisits();
      
      const newIntegrados = [...currentIntegrados];
      integrados.forEach(i => {
         if (!newIntegrados.find(existing => existing.id === i.id)) {
            newIntegrados.push(i);
         }
      });
      
      const newVisits = [...currentVisits];
      visits.forEach(v => {
         const existingIndex = newVisits.findIndex(existing => 
             existing.id === v.id || 
             (existing.integradoId === v.integradoId && existing.date === v.date)
         );
         if (existingIndex >= 0) {
            newVisits[existingIndex] = { ...newVisits[existingIndex], ...v, id: newVisits[existingIndex].id }; // Update existing but keep UUID
         } else {
            newVisits.push(v);
         }
      });
      
      await storage.saveIntegrados(newIntegrados);
      await storage.saveVisits(newVisits);
      
      addLog('Importação concluída com sucesso!');
      if (integrados.length > 0 || visits.length > 0) {
        setTimeout(() => {
          onImportComplete();
        }, 3000);
      }
      
    } catch (e: any) {
      addLog(`Erro durante a importação: ${e.message}`);
      setErrors([e.message]);
      saveToErrorHistory([e.message]);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to standard tab-separated string
          const csvData = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t', dateNF: 'YYYY-MM-DD' });
          
          setRawData(csvData);
          addLog(`Arquivo '${file.name}' carregado. Verifique os dados abaixo e inicie a importação.`);
        } catch (err: any) {
          addLog(`Erro ao ler o arquivo Excel: ${err.message}`);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setRawData(content);
          addLog(`Arquivo '${file.name}' carregado como texto. Verifique os dados abaixo e inicie a importação.`);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Importar Dados</h2>
        <button
          onClick={() => setShowErrorHistory(!showErrorHistory)}
          className="text-sm font-medium text-slate-600 hover:text-slate-800 underline decoration-slate-300"
        >
          {showErrorHistory ? 'Ocultar Histórico de Erros' : 'Ver Histórico de Erros'}
        </button>
      </div>

      {showErrorHistory && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-700">Histórico de Erros de Importação</h3>
            {errorHistory.length > 0 && (
              <button 
                onClick={clearErrorHistory}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Limpar Histórico
              </button>
            )}
          </div>
          {errorHistory.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum erro registrado no histórico.</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {errorHistory.map((entry, idx) => (
                <div key={idx} className="bg-white p-3 border border-red-100 rounded shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 mb-2">{entry.timestamp}</p>
                  <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                    {entry.errors.map((err, errIdx) => (
                      <li key={errIdx}>{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-slate-600 mb-4">
        Anexe o arquivo (.txt, .csv, .tsv, .xlsx) ou cole abaixo os dados.
        O sistema reconhece automaticamente as colunas. As datas devem estar no formato DD/MM/AAAA.
      </p>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-slate-700">Selecione o arquivo de dados:</label>
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".txt,.csv,.tsv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain,*/*" 
          onChange={handleFileUpload}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
      </div>

      <textarea
        value={rawData}
        onChange={e => setRawData(e.target.value)}
        className="w-full h-64 p-3 border border-slate-200 rounded text-sm font-mono whitespace-pre outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        placeholder="Os dados carregados do arquivo aparecerão aqui..."
      />
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={parseAndImport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Importando...' : 'Iniciar Importação'}
        </button>
        
        {confirmDeleteAll ? (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-red-600 font-bold">Apagar TUDO?</span>
            <button 
              onClick={async () => {
                try {
                  await storage.clearAll();
                  addLog('Todos os dados foram apagados.');
                  setConfirmDeleteAll(false);
                  setTimeout(() => {
                    onImportComplete();
                  }, 1000);
                } catch (e: any) {
                  alert(`Erro ao apagar os dados:\n\n${e.message}\n\nSe for um erro de RLS (Row-Level Security), vá ao painel do Supabase, acesse o SQL Editor e execute:\nALTER TABLE registros DISABLE ROW LEVEL SECURITY;`);
                }
              }}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              Sim, Apagar
            </button>
            <button 
              onClick={() => setConfirmDeleteAll(false)}
              disabled={loading}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setConfirmDeleteAll(true)}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 ml-auto"
          >
            Apagar Todos os Dados
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-6 bg-slate-900 rounded p-4 text-xs font-mono text-emerald-400 h-32 overflow-y-auto">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-xs font-mono text-red-600 h-32 overflow-y-auto">
          <p className="font-bold mb-2">Erros Encontrados (ignorados):</p>
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </div>
  );
}
