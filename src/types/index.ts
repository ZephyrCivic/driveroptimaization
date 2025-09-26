
export type DayOfWeek = '月' | '火' | '水' | '木' | '金' | '土' | '日';
export type DayCategory = '平日' | '土日' | DayOfWeek;

export interface DriverPreference {
  vacationDays: DayOfWeek[];
}

export interface Driver {
  id: string;
  name: string;
  availability: DayOfWeek[];
  preferences: DriverPreference;
}

export interface Route {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  requiredDrivers: number;
  day: DayCategory;
  startLocation: string;
  endLocation: string;
}

export interface Constraint {
  maxDrivingHoursPerDay: number;
  maxDrivingHoursPerWeek: number;
  minRestHoursBetweenShifts: number;
}

export interface Shift {
  routeId: string;
  driverId: string;
}

export interface Schedule {
  [day: string]: Shift[];
}

export interface UnassignedRoute {
  routeId: string;
  reason: string;
}

export interface ScheduleGenerationResult {
  schedule: Schedule;
  dashboardData: DashboardData;
}

export interface Workload {
  driverId: string;
  totalHours: number;
  shiftCount: number;
}

export interface DashboardData {
  summary: {
    totalShifts: number;
    totalHours: number;
    unassignedCount: number;
    fairnessScore: number; // 0-100, 100 is best
  };
  workloadAnalysis: Workload[];
  unassignedRoutes: UnassignedRoute[];
}
