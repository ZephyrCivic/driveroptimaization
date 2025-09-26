
import React from 'react';
import type { Driver } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface DriverManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

export const DriverManagementModal: React.FC<DriverManagementModalProps> = ({ isOpen, onClose, drivers, setDrivers }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">ドライバー管理</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => (
              <div key={driver.id} className="bg-slate-900 p-4 border border-slate-700 rounded-md shadow-sm">
                <p className="font-semibold text-slate-200 text-lg">{driver.name}</p>
                <p className="text-sm text-slate-400 mt-1">ID: {driver.id}</p>
                <p className="text-sm text-slate-400 mt-2">勤務可能日:</p>
                <p className="text-sm text-cyan-300 font-mono">{driver.availability.join(', ')}</p>
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
