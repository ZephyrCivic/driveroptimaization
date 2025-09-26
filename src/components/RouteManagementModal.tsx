
import React from 'react';
import type { Route } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface RouteManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

export const RouteManagementModal: React.FC<RouteManagementModalProps> = ({ isOpen, onClose, routes, setRoutes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">ルート (ダイヤ) 管理</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {routes.map(route => (
              <div key={route.id} className="bg-slate-900 p-3 border border-slate-700 rounded-md shadow-sm grid grid-cols-4 gap-4 items-center">
                <div>
                    <p className="font-semibold text-slate-200">{route.name}</p>
                    <p className="text-xs text-slate-500">ID: {route.id}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-slate-400">{route.startTime} - {route.endTime}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-slate-300 bg-green-500/20 rounded-full px-2 py-1 inline-block">{route.day}</p>
                </div>
                <div className="text-sm text-slate-400 text-right">
                    <p>{route.startLocation} → {route.endLocation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="p-4 border-t border-slate-700 flex justify-end space-x-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md font-semibold hover:bg-slate-600 transition text-sm">閉じる</button>
            <button className="px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 transition text-sm">変更を保存</button>
        </footer>
      </div>
    </div>
  );
};
