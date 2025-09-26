import React from 'react';
import type { Schedule, Driver, DayOfWeek } from '../types';

interface ScheduleViewProps {
  schedule: Schedule | null;
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
  isLoading: boolean;
  error: string | null;
  driverMap: Record<string, Driver>;
  routeMap: Record<string, { id: string; name: string; startTime: string; endTime: string; }>;
  drivers: Driver[];
  progress: number;
}

const colors = [
  '#22d3ee', '#4ade80', '#a78bfa', '#fb923c',
  '#f87171', '#facc15', '#818cf8', '#f472b6',
  '#2dd4bf', '#38bdf8'
];

const getColorForRoute = (routeId: string) => {
  let hash = 0;
  for (let i = 0; i < routeId.length; i++) {
    hash = routeId.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const DaySelector: React.FC<{ selectedDay: DayOfWeek; setSelectedDay: (day: DayOfWeek) => void }> = ({ selectedDay, setSelectedDay }) => {
    const days: DayOfWeek[] = ['月', '火', '水', '木', '金', '土', '日'];
    return (
        <div className="flex space-x-1 rounded-lg bg-slate-700 p-1">
            {days.map(day => (
                <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`w-full rounded-md py-2 text-sm font-medium leading-5 transition-colors
                        ${selectedDay === day ? 'bg-white text-slate-900 shadow' : 'text-slate-200 hover:bg-slate-600/50'}
                        focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-800 ring-white ring-opacity-60`}
                >
                    {day}
                </button>
            ))}
        </div>
    );
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, selectedDay, setSelectedDay, isLoading, error, routeMap, drivers, progress }) => {
  const START_HOUR = 5;
  const END_HOUR = 26; // 2:00 next day
  const TOTAL_HOURS = END_HOUR - START_HOUR;

  const parseTimeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
  };

  const totalMinutesInView = TOTAL_HOURS * 60;
  const startMinutesInView = START_HOUR * 60;
  
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

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-lg shadow-lg p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h2 className="text-2xl font-bold text-slate-300">準備完了</h2>
        <p className="text-slate-400 mt-2">左のパネルで条件を設定し、「AIでシフトを自動生成」ボタンを押してください。</p>
      </div>
    );
  }

  const timeHeaders = Array.from({ length: TOTAL_HOURS }, (_, i) => {
    const hour = (START_HOUR + i) % 24;
    return `${String(hour).padStart(2, '0')}:00`;
  });
  const dailySchedule = schedule[selectedDay] || [];

  return (
    <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-slate-200">{selectedDay}曜日のシフト</h2>
          <div className="w-96">
              <DaySelector selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
          </div>
      </div>
      
      <div className="flex-grow overflow-auto p-4">
        <div className="grid min-w-[2400px]" style={{gridTemplateColumns: '150px 1fr'}}>
            <div className="sticky top-0 bg-slate-900 z-20 p-2 border-b border-r border-slate-700 font-semibold text-slate-300 text-center">ID</div>
            <div className="sticky top-0 bg-slate-900 z-20 border-b border-slate-700" >
                <div className="grid" style={{ gridTemplateColumns: `repeat(${TOTAL_HOURS}, minmax(0, 1fr))` }}>
                   {timeHeaders.map(time => <div key={time} className="text-center text-xs text-slate-400 p-2 border-r border-slate-800">{time}</div>)}
                </div>
            </div>

            {drivers.map((driver, index) => {
                const driverShifts = dailySchedule.filter(shift => shift.driverId === driver.id);
                return (
                    <React.Fragment key={driver.id}>
                        <div className="p-2 border-r border-b border-slate-700 font-medium text-slate-300 bg-slate-800/50 flex items-center justify-center text-sm">{driver.name}</div>
                        <div className="border-b border-slate-700 relative bg-grid" style={{backgroundSize: `calc(100% / ${TOTAL_HOURS}) 100%`}}>
                            {driverShifts.map(shift => {
                                const route = routeMap[shift.routeId];
                                if (!route) return null;
                                
                                const routeStartMinutes = parseTimeToMinutes(route.startTime);
                                const routeEndMinutes = parseTimeToMinutes(route.endTime);

                                const left = ((routeStartMinutes - startMinutesInView) / totalMinutesInView) * 100;
                                const width = ((routeEndMinutes - routeStartMinutes) / totalMinutesInView) * 100;
                                
                                if (width <= 0) return null;

                                const color = getColorForRoute(route.id);

                                return (
                                    <div
                                        key={shift.routeId}
                                        className="absolute top-1/2 -translate-y-1/2 h-10 rounded-md flex items-center justify-center px-2 text-white text-xs font-bold shadow-lg overflow-hidden"
                                        style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, border: `1px solid ${color}` }}
                                        title={`${route.name}: ${route.startTime} - ${route.endTime}`}
                                    >
                                        <div className="truncate">{route.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
      </div>
    </div>
  );
};