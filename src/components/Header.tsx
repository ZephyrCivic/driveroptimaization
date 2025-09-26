import React from 'react';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface HeaderProps {
    activeView: 'schedule' | 'dashboard';
    setActiveView: (view: 'schedule' | 'dashboard') => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ isActive, onClick, icon, label }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center space-x-2">
         <NavButton
            isActive={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
            icon={<ChartBarIcon className="w-5 h-5" />}
            label="ダッシュボード"
         />
         <NavButton
            isActive={activeView === 'schedule'}
            onClick={() => setActiveView('schedule')}
            icon={<ListBulletIcon className="w-5 h-5" />}
            label="スケジュール"
         />
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 transition text-sm">保存</button>
        <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md font-semibold hover:bg-slate-600 transition text-sm">破棄</button>
      </div>
    </header>
  );
};