import React from 'react';
import type { DashboardData, Driver } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { CogIcon } from './icons/CogIcon';

interface DashboardProps {
    dashboardData: DashboardData | null;
    isLoading: boolean;
    error: string | null;
    driverMap: Record<string, Driver>;
    progress: number;
}

const DashboardCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string; }> = ({ title, value, icon, subtext }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex items-start space-x-4">
        <div className="bg-slate-700 p-3 rounded-md">
            {icon}
        </div>
        <div>
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtext && <p className="text-slate-500 text-xs mt-1">{subtext}</p>}
        </div>
    </div>
);

const WorkloadBar: React.FC<{ name: string; value: number; maxValue: number; color: string }> = ({ name, value, maxValue, color }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-4">
            <span className="w-28 text-sm text-slate-300 truncate">{name}</span>
            <div className="flex-1 bg-slate-700 rounded-full h-6">
                <div
                    className="rounded-full h-6 flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                >
                   <span className="text-xs font-bold text-slate-900">{value.toFixed(1)}h</span>
                </div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ dashboardData, isLoading, error, driverMap, progress }) => {
    if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-lg shadow-lg">
            <div className="w-3/4 max-w-lg text-center">
                <p className="text-xl font-semibold text-slate-300 mb-2">AIがシフトを作成しています... ({progress}%)</p>
                <div className="w-full bg-slate-700 rounded-full h-4">
                    <div className="bg-cyan-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-slate-400 mt-3">最適な割り当てを計算中です。しばらくお待ちください。</p>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex items-center justify-center h-full bg-red-900/50 border border-red-700 rounded-lg shadow-lg p-6">
            <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-red-200">エラーが発生しました</h3>
                <p className="text-red-300 mt-1">{error}</p>
            </div>
          </div>
        );
      }
    
      if (!dashboardData) {
        return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-lg shadow-lg p-6 text-center">
            <ChartBarIcon className="h-16 w-16 text-slate-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300">データがありません</h2>
            <p className="text-slate-400 mt-2">シフトを生成すると、ここに分析結果が表示されます。</p>
          </div>
        );
      }
    
    const { summary, workloadAnalysis, unassignedRoutes } = dashboardData;
    const maxHours = Math.max(...workloadAnalysis.map(w => w.totalHours), 0);
    const sortedWorkload = [...workloadAnalysis].sort((a, b) => b.totalHours - a.totalHours);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard title="総シフト数" value={summary.totalShifts} icon={<ClockIcon className="w-6 h-6 text-cyan-400"/>} subtext={`合計 ${summary.totalHours.toFixed(1)} 時間`} />
                <DashboardCard title="未割り当て" value={summary.unassignedCount} icon={<CogIcon className="w-6 h-6 text-red-400"/>} subtext="要確認のルート" />
                <DashboardCard title="稼働ドライバー" value={workloadAnalysis.filter(w => w.totalHours > 0).length} icon={<UserGroupIcon className="w-6 h-6 text-green-400"/>} subtext={`/ ${Object.keys(driverMap).length} 人中`} />
                <DashboardCard title="公平性スコア" value={summary.fairnessScore} icon={<ChartBarIcon className="w-6 h-6 text-purple-400"/>} subtext="100点満点" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">ドライバー別 週間稼働時間</h3>
                    <div className="space-y-4">
                        {sortedWorkload.map(workload => (
                             <WorkloadBar
                                key={workload.driverId}
                                name={driverMap[workload.driverId]?.name || '不明'}
                                value={workload.totalHours}
                                maxValue={maxHours}
                                color="#22d3ee" // cyan-400
                             />
                        ))}
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">未割り当てルート</h3>
                    {unassignedRoutes.length > 0 ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                           {unassignedRoutes.map(route => (
                               <li key={route.routeId} className="bg-slate-700 p-3 rounded-md">
                                   <p className="font-bold text-sm text-red-300">{route.routeId}</p>
                                   <p className="text-xs text-slate-400">{route.reason}</p>
                               </li>
                           ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-slate-300 mt-2 font-semibold">素晴らしい！</p>
                            <p className="text-sm text-slate-400">全てのルートが割り当てられました。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};