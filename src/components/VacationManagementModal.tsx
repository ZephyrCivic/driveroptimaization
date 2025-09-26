
import React from 'react';
import type { Driver, DayOfWeek } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface VacationManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

export const VacationManagementModal: React.FC<VacationManagementModalProps> = ({ isOpen, onClose, drivers, setDrivers }) => {
    if (!isOpen) return null;
    
    const daysOfWeek: DayOfWeek[] = ['月', '火', '水', '木', '金', '土', '日'];
    
    const handleVacationChange = (driverId: string, day: DayOfWeek, isChecked: boolean) => {
        setDrivers(prevDrivers => 
          prevDrivers.map(driver => {
            if (driver.id === driverId) {
              const newVacationDays = isChecked
                ? [...driver.preferences.vacationDays, day]
                : driver.preferences.vacationDays.filter(d => d !== day);
              return { ...driver, preferences: { ...driver.preferences, vacationDays: newVacationDays } };
            }
            return driver;
          })
        );
      };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                <header className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-white">休暇・希望管理</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-slate-900 p-4 border border-slate-700 rounded-md shadow-sm flex items-center justify-between">
                                <p className="font-semibold text-slate-200 text-lg w-48">{driver.name}</p>
                                <div className="flex space-x-4 items-center">
                                    {daysOfWeek.map(day => (
                                        <label key={day} className="flex flex-col items-center cursor-pointer p-2 rounded-md hover:bg-slate-700/50">
                                            <span className="text-sm font-medium text-slate-400">{day}</span>
                                            <input
                                                type="checkbox"
                                                checked={driver.preferences.vacationDays.includes(day)}
                                                onChange={(e) => handleVacationChange(driver.id, day, e.target.checked)}
                                                className="mt-2 h-5 w-5 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-600"
                                            />
                                        </label>
                                    ))}
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
