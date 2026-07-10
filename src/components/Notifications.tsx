import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption } from '../data';

interface NotificationsProps {
  visits: Visit[];
  integrados: Integrado[];
}

interface Notification {
  id: string;
  type: 'fechamento' | 'divergencia';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function Notifications({ visits, integrados }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const activeIntegrados = integrados.filter(i => i.status === 'Em andamento');
    const newNotifs: Notification[] = [];
    
    // Get latest visit for each integrado
    const latestVisitsMap = new Map<string, Visit>();
    visits.forEach(v => {
      const existing = latestVisitsMap.get(v.integradoId);
      if (!existing || new Date(v.date).getTime() > new Date(existing.date).getTime()) {
        latestVisitsMap.set(v.integradoId, v);
      }
    });

    activeIntegrados.forEach(integrado => {
      const latestVisit = latestVisitsMap.get(integrado.id);
      if (!latestVisit) return;

      // Check fechamento (100 days)
      if (latestVisit.idade >= 100) {
        newNotifs.push({
          id: `fechamento_${integrado.id}_${latestVisit.idade}`,
          type: 'fechamento',
          title: 'Lote próximo ao fechamento',
          message: `O lote de ${integrado.name} atingiu ${latestVisit.idade} dias e está pronto para o fechamento.`,
          date: latestVisit.date,
          read: false
        });
      }

      // Check divergência
      if (latestVisit.consumoAcumuladoReal) {
        const expected = getExpectedConsumption(latestVisit.idade, latestVisit.tipoLote);
        const diferenca = latestVisit.consumoAcumuladoReal - expected;
        if (diferenca < -5 || diferenca > 5) {
          newNotifs.push({
            id: `divergencia_${integrado.id}_${latestVisit.id}`,
            type: 'divergencia',
            title: 'Divergência Crítica de Consumo',
            message: `O lote de ${integrado.name} (Idade: ${latestVisit.idade}) apresenta um desvio de ${diferenca > 0 ? '+' : ''}${diferenca.toFixed(2)} kg em relação à meta.`,
            date: latestVisit.date,
            read: false
          });
        }
      }
    });

    // We can merge with existing notifications, keeping read status
    setNotifications(prev => {
      const merged = [...newNotifs];
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [visits, integrados]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-semibold text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                Nenhuma notificação no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'fechamento' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {notif.type === 'fechamento' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(notif.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
