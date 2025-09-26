import type { Schedule, DashboardData } from '@/types';

export interface ScheduleProject {
  version: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  schedule: Schedule | null;
  dashboard?: DashboardData | null;
  gtfsSource?: {
    filename: string;
    hash?: string;
  };
  metadata?: Record<string, unknown>;
}

const PROJECT_VERSION = 1;

export function createProjectSnapshot(params: {
  name: string;
  description?: string;
  schedule: Schedule | null;
  dashboard?: DashboardData | null;
  gtfsSource?: { filename: string; hash?: string };
  metadata?: Record<string, unknown>;
}): ScheduleProject {
  const timestamp = new Date().toISOString();
  return {
    version: PROJECT_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...params,
  };
}

export function updateProjectSnapshot(existing: ScheduleProject, updates: Partial<Omit<ScheduleProject, 'version' | 'createdAt'>>): ScheduleProject {
  return {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

export function serializeProject(project: ScheduleProject): string {
  return JSON.stringify(project, null, 2);
}

export function parseProject(json: string): ScheduleProject {
  const parsed = JSON.parse(json);
  if (typeof parsed.version !== 'number') {
    throw new Error('Invalid project file: missing version number');
  }
  return parsed as ScheduleProject;
}

export async function downloadProject(project: ScheduleProject, filename = 'schedule_project.json'): Promise<void> {
  const blob = new Blob([serializeProject(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}

export async function importProjectFile(file: File): Promise<ScheduleProject> {
  const content = await readFileAsText(file);
  return parseProject(content);
}
