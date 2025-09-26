
import React, { useState, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ScheduleView } from './components/ScheduleView';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import type { Driver, Route, Constraint, Schedule, DayOfWeek, DashboardData } from './types';
import { generateMockSchedule } from './services/mockScheduleService';
import { DriverManagementModal } from './components/DriverManagementModal';
import { RouteManagementModal } from './components/RouteManagementModal';
import { VacationManagementModal } from './components/VacationManagementModal';

const App: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 'd1', name: '鈴木 一郎', availability: ['月', '火', '水', '木', '金'], preferences: { vacationDays: [] } },
    { id: 'd2', name: '佐藤 次郎', availability: ['月', '火', '水', '木', '金', '土'], preferences: { vacationDays: [] } },
    { id: 'd3', name: '高橋 三郎', availability: ['月', '水', '金', '日'], preferences: { vacationDays: [] } },
    { id: 'd4', name: '田中 四郎', availability: ['火', '木', '土', '日'], preferences: { vacationDays: [] } },
    { id: 'd5', name: '伊藤 五郎', availability: ['月', '火', '水', '木', '金', '土', '日'], preferences: { vacationDays: [] } },
    { id: 'd6', name: '渡辺 六郎', availability: ['月', '火', '水', '木', '金'], preferences: { vacationDays: [] } },
    { id: 'd7', name: '山本 七郎', availability: ['火', '木', '土', '日'], preferences: { vacationDays: [] } },
    { id: 'd8', name: '中村 八郎', availability: ['月', '水', '金', '土'], preferences: { vacationDays: [] } },
    { id: 'd9', name: '小林 九郎', availability: ['月', '火', '水', '木', '金', '日'], preferences: { vacationDays: [] } },
    { id: 'd10', name: '加藤 十郎', availability: ['土', '日'], preferences: { vacationDays: [] } },
  ]);

  const [routes, setRoutes] = useState<Route[]>([
    { id: 'r1', name: 'A-早朝', startTime: '05:00', endTime: '09:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r2', name: 'A-朝', startTime: '06:00', endTime: '10:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r3', name: 'A-午前', startTime: '09:00', endTime: '13:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r4', name: 'A-昼', startTime: '12:00', endTime: '16:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r5', name: 'A-午後', startTime: '15:00', endTime: '19:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r6', name: 'A-夕', startTime: '17:00', endTime: '21:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r7', name: 'A-夜', startTime: '20:00', endTime: '24:00', requiredDrivers: 1, day: '平日', startLocation: '東車庫', endLocation: '東車庫' },
    { id: 'r8', name: 'B-朝', startTime: '06:30', endTime: '11:00', requiredDrivers: 1, day: '平日', startLocation: '西車庫', endLocation: '西車庫' },
    { id: 'r9', name: 'B-日中', startTime: '10:30', endTime: '17:00', requiredDrivers: 1, day: '平日', startLocation: '西車庫', endLocation: '西車庫' },
    { id: 'r10', name: 'B-夜', startTime: '16:30', endTime: '22:00', requiredDrivers: 1, day: '平日', startLocation: '西車庫', endLocation: '西車庫' },
    { id: 'r11', name: 'C-終日', startTime: '08:00', endTime: '17:30', requiredDrivers: 1, day: '平日', startLocation: '南車庫', endLocation: '南車庫' },
    { id: 'r12', name: '深夜バス', startTime: '22:30', endTime: '25:30', requiredDrivers: 1, day: '平日', startLocation: '中央駅', endLocation: '東車庫' },
    { id: 'r13', name: '週末-快速', startTime: '09:00', endTime: '18:00', requiredDrivers: 1, day: '土日', startLocation: '中央駅', endLocation: '観光地A' },
    { id: 'r14', name: '週末-各停', startTime: '10:00', endTime: '19:00', requiredDrivers: 1, day: '土日', startLocation: '中央駅', endLocation: '観光地B' },
    { id: 'r15', name: '週末-夜景', startTime: '18:00', endTime: '23:00', requiredDrivers: 1, day: '土日', startLocation: '中央駅', endLocation: '展望台' },
    { id: 'r16', name: '週末-循環', startTime: '11:00', endTime: '20:00', requiredDrivers: 1, day: '土日', startLocation: '西車庫', endLocation: '西車庫' },
  ]);

  const [constraints, setConstraints] = useState<Constraint>({
    maxDrivingHoursPerDay: 9,
    maxDrivingHoursPerWeek: 44,
    minRestHoursBetweenShifts: 11,
  });

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('月');
  const [activeView, setActiveView] = useState<'schedule' | 'dashboard'>('schedule');
  const [progress, setProgress] = useState(0);

  const [isDriverModalOpen, setDriverModalOpen] = useState(false);
  const [isRouteModalOpen, setRouteModalOpen] = useState(false);
  const [isVacationModalOpen, setVacationModalOpen] = useState(false);

  const handleGenerateSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSchedule(null);
    setDashboardData(null);
    setActiveView('schedule');
    
    try {
      const { schedule: generatedSchedule, dashboardData: generatedDashboardData } = await generateMockSchedule(setProgress);
      setSchedule(generatedSchedule);
      setDashboardData(generatedDashboardData);
    } catch (err) {
      setProgress(0);
      console.error(err);
      setError('シフト生成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const driverMap = useMemo(() => {
    return drivers.reduce((acc, driver) => {
      acc[driver.id] = driver;
      return acc;
    }, {} as Record<string, Driver>);
  }, [drivers]);

  const routeMap = useMemo(() => {
    const allDaysRoutes = routes.flatMap(r => {
      if (r.day === '平日') {
        const weekdays: DayOfWeek[] = ['月', '火', '水', '木', '金'];
        return weekdays.map(day => ({ ...r, id: `${r.id}-${day}`, day: day }));
      }
      if (r.day === '土日') {
        const weekendDays: DayOfWeek[] = ['土', '日'];
        return weekendDays.map(day => ({ ...r, id: `${r.id}-${day}`, day: day }));
      }
      return [{ ...r, id: `${r.id}-${r.day}`, day: r.day as DayOfWeek }];
    });

    return allDaysRoutes.reduce((acc, route) => {
      acc[route.id] = route;
      return acc;
    }, {} as Record<string, Route & { day: DayOfWeek }>);
  }, [routes]);


  return (
    <>
      <div className="flex h-screen font-sans">
        <Sidebar
          onGenerate={handleGenerateSchedule}
          isLoading={isLoading}
          onOpenDriverModal={() => setDriverModalOpen(true)}
          onOpenRouteModal={() => setRouteModalOpen(true)}
          onOpenVacationModal={() => setVacationModalOpen(true)}
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-800">
          <Header activeView={activeView} setActiveView={setActiveView} />
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {activeView === 'schedule' ? (
              <ScheduleView
                schedule={schedule}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                isLoading={isLoading}
                error={error}
                driverMap={driverMap}
                routeMap={routeMap}
                drivers={drivers}
                progress={progress}
              />
            ) : (
              <Dashboard
                dashboardData={dashboardData}
                isLoading={isLoading}
                error={error}
                driverMap={driverMap}
                progress={progress}
              />
            )}
          </div>
        </main>
      </div>

      <DriverManagementModal 
        isOpen={isDriverModalOpen}
        onClose={() => setDriverModalOpen(false)}
        drivers={drivers}
        setDrivers={setDrivers}
      />
      <RouteManagementModal
        isOpen={isRouteModalOpen}
        onClose={() => setRouteModalOpen(false)}
        routes={routes}
        setRoutes={setRoutes}
      />
      <VacationManagementModal
        isOpen={isVacationModalOpen}
        onClose={() => setVacationModalOpen(false)}
        drivers={drivers}
        setDrivers={setDrivers}
      />
    </>
  );
};

export default App;
