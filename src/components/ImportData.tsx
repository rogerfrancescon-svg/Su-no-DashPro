import React, { useState } from 'react';
import { preprocessImportData } from '../utils/import-parser';
import { storage } from '../lib/storage';

interface ImportDataProps {
  onImportComplete: () => void;
}

export function ImportData({ onImportComplete }: ImportDataProps) {
  const [rawData, setRawData] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  
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
      setTimeout(() => {
        onImportComplete();
      }, 2000);
      
    } catch (e: any) {
      addLog(`Erro durante a importação: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRawData(content);
        addLog(`Arquivo '${file.name}' carregado. Verifique os dados abaixo e inicie a importação.`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Importar Dados</h2>
      <p className="text-sm text-slate-600 mb-4">
        Anexe o arquivo (.txt, .csv, .tsv) ou cole abaixo os dados extraídos do Excel. 
        O sistema espera as colunas na seguinte ordem: <strong>Data, Integrado, Alojamento, Idade, Recomendação, Consumo acumulado, Mortalidade, Comedouro, Colaborador, Consumos de Ração/meta, Peso aloj, Pontuação Sanitária</strong>.
        As datas devem estar no formato DD/MM/AAAA.
      </p>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-slate-700">Selecione o arquivo de dados:</label>
        <input 
          type="file" 
          accept=".txt,.csv,.tsv" 
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
                await storage.clearAll();
                addLog('Todos os dados foram apagados.');
                setConfirmDeleteAll(false);
                setTimeout(() => {
                  onImportComplete();
                }, 1000);
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
