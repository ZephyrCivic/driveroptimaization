import JSZip from 'jszip';
import Papa from 'papaparse';
import type {
  ParsedGtfsData,
  GtfsRoute,
  GtfsTrip,
  GtfsStopTime,
  GtfsCalendar,
  GtfsStop,
  GtfsCalendarDate,
  GtfsShape,
  GtfsFareAttribute,
  GtfsFareRule,
  TripBlock,
  ValidationIssue,
  ImportOptions,
} from './types';

const REQUIRED_FILES = [
  'routes.txt',
  'trips.txt',
  'stop_times.txt',
  'calendar.txt',
] as const;

type RequiredFile = typeof REQUIRED_FILES[number];

const OPTIONAL_FILES = [
  'stops.txt',
  'calendar_dates.txt',
  'shapes.txt',
  'fare_attributes.txt',
  'fare_rules.txt',
] as const;

type OptionalFile = typeof OPTIONAL_FILES[number];

function parseCsv<T = Record<string, string>>(input: string): T[] {
  const { data, errors } = Papa.parse<T>(input, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    trimHeaders: true,
  });

  if (errors.length) {
    const details = errors
      .map((err) => `${err.code ?? 'PARSE_ERROR'}: ${err.message} (row: ${err.row})`)
      .join('\n');
    throw new Error(`GTFS CSV parse failed:\n${details}`);
  }

  return data;
}

async function readRequiredFile(zip: JSZip, fileName: RequiredFile): Promise<string> {
  const file = zip.file(fileName);
  if (!file) {
    throw new Error(`GTFS archive is missing required file: ${fileName}`);
  }
  return file.async('string');
}

async function readOptionalFile(zip: JSZip, fileName: OptionalFile): Promise<string | null> {
  const file = zip.file(fileName);
  return file ? file.async('string') : null;
}

function mapTripBlocks(trips: GtfsTrip[]): TripBlock[] {
  const blocks = new Map<string, Set<string>>();
  trips.forEach((trip) => {
    const blockId = trip.block_id && trip.block_id.trim().length > 0 ? trip.block_id : `__no_block__::${trip.trip_id}`;
    if (!blocks.has(blockId)) {
      blocks.set(blockId, new Set());
    }
    blocks.get(blockId)!.add(trip.trip_id);
  });

  return Array.from(blocks.entries()).map(([blockId, tripIds]) => ({
    blockId,
    tripIds: Array.from(tripIds),
  }));
}

function detectIssues(data: ParsedGtfsData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const routeIds = new Set(data.routes.map((route) => route.route_id));
  data.trips.forEach((trip) => {
    if (!routeIds.has(trip.route_id)) {
      issues.push({
        type: 'error',
        message: 'Trip references unknown route_id',
        context: { trip_id: trip.trip_id, route_id: trip.route_id },
      });
    }
  });

  const tripIds = new Set(data.trips.map((trip) => trip.trip_id));
  const seenStopTime = new Set<string>();
  data.stopTimes.forEach((stopTime) => {
    if (!tripIds.has(stopTime.trip_id)) {
      issues.push({
        type: 'error',
        message: 'Stop time references unknown trip_id',
        context: { trip_id: stopTime.trip_id },
      });
    }
    const key = `${stopTime.trip_id}:${stopTime.stop_sequence}`;
    if (seenStopTime.has(key)) {
      issues.push({
        type: 'warning',
        message: 'Duplicate stop_sequence detected in stop_times',
        context: { trip_id: stopTime.trip_id, stop_sequence: stopTime.stop_sequence },
      });
    }
    seenStopTime.add(key);
  });

  data.calendarDates.forEach((calDate) => {
    if (!tripIds.size) {
      return;
    }
    if (calDate.exception_type !== '1' && calDate.exception_type !== '2') {
      issues.push({
        type: 'warning',
        message: 'calendar_dates contains unknown exception_type (expected 1 or 2)',
        context: { service_id: calDate.service_id, exception_type: calDate.exception_type },
      });
    }
  });

  return issues;
}

export interface ImportResult {
  data: ParsedGtfsData;
  tripBlocks: TripBlock[];
  issues: ValidationIssue[];
}

export async function importGtfsZip(
  buffer: ArrayBuffer | Uint8Array | Blob,
  options: ImportOptions = {},
): Promise<ImportResult> {
  const arrayBuffer = buffer instanceof Blob ? await buffer.arrayBuffer() : buffer;
  const zip = await JSZip.loadAsync(arrayBuffer);

  const fileContents = await Promise.all(
    REQUIRED_FILES.map(async (fileName) => ({
      fileName,
      content: await readRequiredFile(zip, fileName),
    })),
  );

  const requiredMap = new Map<RequiredFile, string>();
  fileContents.forEach(({ fileName, content }) => requiredMap.set(fileName as RequiredFile, content));

  const optionalMap = new Map<OptionalFile, string>();
  for (const fileName of OPTIONAL_FILES) {
    const content = await readOptionalFile(zip, fileName);
    if (content) {
      optionalMap.set(fileName, content);
    }
  }

  const routes = parseCsv<GtfsRoute>(requiredMap.get('routes.txt')!);
  const trips = parseCsv<GtfsTrip>(requiredMap.get('trips.txt')!);
  const stopTimes = parseCsv<GtfsStopTime>(requiredMap.get('stop_times.txt')!);
  const calendar = parseCsv<GtfsCalendar>(requiredMap.get('calendar.txt')!);

  const stops = optionalMap.has('stops.txt') ? parseCsv<GtfsStop>(optionalMap.get('stops.txt')!) : [];
  const calendarDates = optionalMap.has('calendar_dates.txt')
    ? parseCsv<GtfsCalendarDate>(optionalMap.get('calendar_dates.txt')!)
    : [];
  const shapes = optionalMap.has('shapes.txt') ? parseCsv<GtfsShape>(optionalMap.get('shapes.txt')!) : [];
  const fareAttributes = optionalMap.has('fare_attributes.txt')
    ? parseCsv<GtfsFareAttribute>(optionalMap.get('fare_attributes.txt')!)
    : [];
  const fareRules = optionalMap.has('fare_rules.txt')
    ? parseCsv<GtfsFareRule>(optionalMap.get('fare_rules.txt')!)
    : [];

  const data: ParsedGtfsData = {
    routes,
    trips,
    stopTimes,
    stops,
    calendar,
    calendarDates,
    shapes,
    fareAttributes,
    fareRules,
  };

  const tripBlocks = mapTripBlocks(trips);
  const issues = detectIssues(data);

  return { data, tripBlocks, issues };
}
