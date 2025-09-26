
import React from 'react';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface SidebarProps {
  onGenerate: () => void;
  isLoading: boolean;
  onOpenDriverModal: () => void;
  onOpenRouteModal: () => void;
  onOpenVacationModal: () => void;
}

const ManagementButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, icon, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center p-4 text-slate-200 hover:bg-slate-800 transition-colors duration-200"
    >
      {icon}
      <span className="text-lg font-semibold ml-3">{label}</span>
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ onGenerate, isLoading, onOpenDriverModal, onOpenRouteModal, onOpenVacationModal }) => {
  return (
    <aside className="w-80 bg-slate-900 shadow-lg flex flex-col h-full shrink-0 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">AIバス運行シフト</h1>
          <p className="text-sm text-slate-400">最適化ジェネレーター</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="py-2">
            <ManagementButton 
                label="ドライバー管理" 
                icon={<UserGroupIcon className="w-6 h-6 text-cyan-400" />}
                onClick={onOpenDriverModal}
            />
            <ManagementButton 
                label="ルート (ダイヤ) 管理"
                icon={<ClockIcon className="w-6 h-6 text-green-400" />}
                onClick={onOpenRouteModal}
            />
            <ManagementButton 
                label="休暇・希望管理"
                icon={<CalendarIcon className="w-6 h-6 text-yellow-400" />}
                onClick={onOpenVacationModal}
            />
        </nav>
      </div>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {isLoading ? '生成中...' : 'シフトを自動生成'}
        </button>
      </div>
    </aside>
  );
};
