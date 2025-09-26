
import type { Schedule, DashboardData } from '@/types';

const MOCK_SCHEDULE: Schedule = {
    "月": [
        { "routeId": "r1-月", "driverId": "d1" }, { "routeId": "r2-月", "driverId": "d2" },
        { "routeId": "r3-月", "driverId": "d3" }, { "routeId": "r4-月", "driverId": "d5" },
        { "routeId": "r5-月", "driverId": "d6" }, { "routeId": "r6-月", "driverId": "d1" },
        { "routeId": "r7-月", "driverId": "d2" }, { "routeId": "r8-月", "driverId": "d8" },
        { "routeId": "r9-月", "driverId": "d9" }, { "routeId": "r10-月", "driverId": "d3" },
        { "routeId": "r11-月", "driverId": "d5" }, { "routeId": "r12-月", "driverId": "d6" }
    ],
    "火": [
        { "routeId": "r1-火", "driverId": "d1" }, { "routeId": "r2-火", "driverId": "d2" },
        { "routeId": "r4-火", "driverId": "d4" }, { "routeId": "r5-火", "driverId": "d5" },
        { "routeId": "r6-火", "driverId": "d6" }, { "routeId": "r7-火", "driverId": "d7" },
        { "routeId": "r8-火", "driverId": "d1" }, { "routeId": "r9-火", "driverId": "d2" },
        { "routeId": "r10-火", "driverId": "d4" }, { "routeId": "r11-火", "driverId": "d5" },
        { "routeId": "r12-火", "driverId": "d6" }, { "routeId": "r3-火", "driverId": "d9" }
    ],
    "水": [
        { "routeId": "r1-水", "driverId": "d1" }, { "routeId": "r2-水", "driverId": "d2" },
        { "routeId": "r3-水", "driverId": "d3" }, { "routeId": "r5-水", "driverId": "d5" },
        { "routeId": "r6-水", "driverId": "d6" }, { "routeId": "r8-水", "driverId": "d8" },
        { "routeId": "r9-水", "driverId": "d9" }, { "routeId": "r10-水", "driverId": "d1" },
        { "routeId": "r11-水", "driverId": "d2" }, { "routeId": "r12-水", "driverId": "d3" },
        { "routeId": "r4-水", "driverId": "d5" }, { "routeId": "r7-水", "driverId": "d6" }
    ],
    "木": [
        { "routeId": "r1-木", "driverId": "d1" }, { "routeId": "r2-木", "driverId": "d2" },
        { "routeId": "r4-木", "driverId": "d4" }, { "routeId": "r5-木", "driverId": "d5" },
        { "routeId": "r6-木", "driverId": "d6" }, { "routeId": "r7-木", "driverId": "d7" },
        { "routeId": "r8-木", "driverId": "d9" }, { "routeId": "r9-木", "driverId": "d1" },
        { "routeId": "r10-木", "driverId": "d2" }, { "routeId": "r11-木", "driverId": "d4" },
        { "routeId": "r12-木", "driverId": "d5" }, { "routeId": "r3-木", "driverId": "d6" }
    ],
    "金": [
        { "routeId": "r1-金", "driverId": "d1" }, { "routeId": "r2-金", "driverId": "d2" },
        { "routeId": "r3-金", "driverId": "d3" }, { "routeId": "r5-金", "driverId": "d5" },
        { "routeId": "r6-金", "driverId": "d6" }, { "routeId": "r8-金", "driverId": "d8" },
        { "routeId": "r9-金", "driverId": "d9" }, { "routeId": "r10-金", "driverId": "d1" },
        { "routeId": "r11-金", "driverId": "d2" }, { "routeId": "r12-金", "driverId": "d3" },
        { "routeId": "r4-金", "driverId": "d5" }, { "routeId": "r7-金", "driverId": "d6" }
    ],
    "土": [
        { "routeId": "r13-土", "driverId": "d2" }, { "routeId": "r14-土", "driverId": "d4" },
        { "routeId": "r15-土", "driverId": "d5" }, { "routeId": "r16-土", "driverId": "d7" },
        { "routeId": "r13-土", "driverId": "d8" }, { "routeId": "r14-土", "driverId": "d10" }
    ],
    "日": [
        { "routeId": "r13-日", "driverId": "d3" }, { "routeId": "r14-日", "driverId": "d4" },
        { "routeId": "r15-日", "driverId": "d5" }, { "routeId": "r16-日", "driverId": "d7" },
        { "routeId": "r13-日", "driverId": "d9" }, { "routeId": "r14-日", "driverId": "d10" }
    ]
};

const MOCK_DASHBOARD_DATA: DashboardData = {
    summary: { totalShifts: 70, totalHours: 350.5, unassignedCount: 0, fairnessScore: 92 },
    workloadAnalysis: [
        { driverId: 'd1', totalHours: 42.5, shiftCount: 8 },
        { driverId: 'd2', totalHours: 43.0, shiftCount: 8 },
        { driverId: 'd3', totalHours: 35.5, shiftCount: 6 },
        { driverId: 'd4', totalHours: 35.0, shiftCount: 6 },
        { driverId: 'd5', totalHours: 44.0, shiftCount: 9 },
        { driverId: 'd6', totalHours: 42.0, shiftCount: 8 },
        { driverId: 'd7', totalHours: 34.0, shiftCount: 4 },
        { driverId: 'd8', totalHours: 20.5, shiftCount: 4 },
        { driverId: 'd9', totalHours: 34.0, shiftCount: 6 },
        { driverId: 'd10', totalHours: 20.0, shiftCount: 2 },
    ],
    unassignedRoutes: [],
};


export const generateMockSchedule = async (
  onProgress: (progress: number) => void
): Promise<{ schedule: Schedule, dashboardData: DashboardData }> => {
  
  return new Promise((resolve) => {
    let progress = 0;
    onProgress(progress);

    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve({ schedule: MOCK_SCHEDULE, dashboardData: MOCK_DASHBOARD_DATA });
      }
    }, 1000); // 10 seconds total
  });
};
