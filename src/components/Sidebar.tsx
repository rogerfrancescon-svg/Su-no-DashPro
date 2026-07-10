import React from 'react';
import { Home, Users, ClipboardList, LineChart } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'visitas', label: 'Visitas', icon: ClipboardList },
  { id: 'integrados', label: 'Lotes e Integrados', icon: Users },
  { id: 'curva', label: 'Curva de Referência', icon: LineChart },
  { id: 'importar', label: 'Importar Dados', icon: ClipboardList },
];

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0F172A] flex flex-col min-h-screen shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Suíno DashPro</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-3 transition-colors text-sm font-medium",
                isActive 
                  ? "bg-blue-600/20 text-blue-400 border-l-4 border-blue-500" 
                  : "text-slate-400 hover:bg-slate-800 border-l-4 border-transparent"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
