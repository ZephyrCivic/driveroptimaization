import type {
  GtfsRoute,
  GtfsTrip,
  GtfsStopTime,
  GtfsStop,
  GtfsCalendar,
  GtfsCalendarDate,
  GtfsShape,
  GtfsFareAttribute,
  GtfsFareRule,
  TripBlock,
  ParsedGtfsData,
} from './types';

export interface TripSummary {
  tripId: string;
  routeId: string;
  serviceId: string;
  blockId?: string;
  directionId?: string;
  shapeId?: string;
  tripHeadsign?: string;
  startTime: string;
  endTime: string;
  startStopId: string;
  endStopId: string;
}

export interface RouteSummary {
  route: GtfsRoute;
  trips: TripSummary[];
}

export interface ServiceException {
  date: string;
  type: 'added' | 'removed';
}

export interface ServiceCalendarSummary {
  serviceId: string;
  activeDays: string[];
  startDate: string;
  endDate: string;
  addedDates: string[];
  removedDates: string[];
  exceptions: ServiceException[];
  hasAddedService: boolean;
  hasRemovedService: boolean;
}

export interface GeographicBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

export interface StopDetails {
  id: string;
  name: string;
  lat: number | null;
  lon: number | null;
  zoneId?: string;
  code?: string;
  parentStation?: string;
  locationType?: string;
  children: string[];
  original: GtfsStop;
}

export interface StopLookup {
  byId: Map<string, StopDetails>;
  list: StopDetails[];
  byParentStation: Map<string, StopDetails[]>;
  bounds: GeographicBounds | null;
  centroid: { lat: number; lon: number } | null;
}

export interface ShapePoint {
  sequence: number;
  lat: number;
  lon: number;
  distanceTraveled: number | null;
}

export interface ShapePath {
  shapeId: string;
  points: ShapePoint[];
  lengthKm: number | null;
  bounds: GeographicBounds | null;
}

export interface ShapeLookup {
  byId: Map<string, ShapePath>;
  list: ShapePath[];
  bounds: GeographicBounds | null;
}

export interface FareSummary {
  fareId: string;
  price: number | null;
  currency: string | null;
  paymentMethod?: string;
  transfers: number | null;
  transferDurationSeconds: number | null;
  routes: string[];
  originZones: string[];
  destinationZones: string[];
  containsZones: string[];
  appliesToAllRoutes: boolean;
  attribute: GtfsFareAttribute | null;
  rules: GtfsFareRule[];
}

export interface GtfsDomainModel {
  routes: RouteSummary[];
  blocks: TripBlock[];
  services: ServiceCalendarSummary[];
  stops: StopLookup;
  shapes: ShapeLookup;
  fares: FareSummary[];
}

type StopTimeGroup = {
  startTime: string;
  endTime: string;
  startStopId: string;
  endStopId: string;
};

const EARTH_RADIUS_KM = 6371;

interface GeoPoint {
  lat: number;
  lon: number;
}

function parseFloatOrNull(value?: string): number | null {
  if (value == null || value.trim() === '') {
    return null;
  }
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseIntOrNull(value?: string): number | null {
  if (value == null || value.trim() === '') {
    return null;
  }
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function extendBounds(bounds: GeographicBounds | null, lat: number, lon: number): GeographicBounds {
  if (!bounds) {
    return { minLat: lat, maxLat: lat, minLon: lon, maxLon: lon };
  }
  return {
    minLat: Math.min(bounds.minLat, lat),
    maxLat: Math.max(bounds.maxLat, lat),
    minLon: Math.min(bounds.minLon, lon),
    maxLon: Math.max(bounds.maxLon, lon),
  };
}

function computeCentroid(points: GeoPoint[]): GeoPoint {
  const { latSum, lonSum } = points.reduce(
    (acc, point) => {
      acc.latSum += point.lat;
      acc.lonSum += point.lon;
      return acc;
    },
    { latSum: 0, lonSum: 0 },
  );
  return {
    lat: latSum / points.length,
    lon: lonSum / points.length,
  };
}

function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function dedupeNonEmpty(values: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    if (!value || value.trim() === '') {
      return;
    }
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  });
  return result;
}

function buildStopLookup(stops: GtfsStop[]): StopLookup {
  const byId = new Map<string, StopDetails>();
  const byParentStation = new Map<string, StopDetails[]>();
  const list: StopDetails[] = [];
  let bounds: GeographicBounds | null = null;
  const geoPoints: GeoPoint[] = [];

  stops.forEach((stop) => {
    const lat = parseFloatOrNull(stop.stop_lat);
    const lon = parseFloatOrNull(stop.stop_lon);

    if (lat != null && lon != null) {
      bounds = extendBounds(bounds, lat, lon);
      geoPoints.push({ lat, lon });
    }

    const details: StopDetails = {
      id: stop.stop_id,
      name: stop.stop_name ?? stop.stop_id,
      lat,
      lon,
      zoneId: stop.zone_id,
      code: stop.stop_code,
      parentStation: stop.parent_station,
      locationType: stop.location_type,
      children: [],
      original: stop,
    };

    byId.set(details.id, details);
    list.push(details);

    if (details.parentStation) {
      const siblings = byParentStation.get(details.parentStation) ?? [];
      siblings.push(details);
      byParentStation.set(details.parentStation, siblings);
    }
  });

  byParentStation.forEach((children, parentId) => {
    const parent = byId.get(parentId);
    if (parent) {
      parent.children.push(...children.map((child) => child.id));
    }
  });

  const centroid = geoPoints.length ? computeCentroid(geoPoints) : null;

  return {
    byId,
    list,
    byParentStation,
    bounds,
    centroid,
  };
}

function buildShapeLookup(shapes: GtfsShape[]): ShapeLookup {
  const grouped = new Map<string, GtfsShape[]>();
  shapes.forEach((shape) => {
    const entries = grouped.get(shape.shape_id) ?? [];
    entries.push(shape);
    grouped.set(shape.shape_id, entries);
  });

  const byId = new Map<string, ShapePath>();
  const list: ShapePath[] = [];
  let datasetBounds: GeographicBounds | null = null;

  grouped.forEach((entries, shapeId) => {
    const points: ShapePoint[] = entries
      .map((entry) => {
        const lat = parseFloatOrNull(entry.shape_pt_lat);
        const lon = parseFloatOrNull(entry.shape_pt_lon);
        if (lat == null || lon == null) {
          return null;
        }
        return {
          sequence: parseIntOrNull(entry.shape_pt_sequence) ?? 0,
          lat,
          lon,
          distanceTraveled: parseFloatOrNull(entry.shape_dist_traveled),
        };
      })
      .filter((point): point is ShapePoint => point !== null)
      .sort((a, b) => a.sequence - b.sequence);

    let shapeBounds: GeographicBounds | null = null;
    let lengthKm = 0;

    points.forEach((point, index) => {
      shapeBounds = extendBounds(shapeBounds, point.lat, point.lon);
      datasetBounds = extendBounds(datasetBounds, point.lat, point.lon);
      if (index > 0) {
        lengthKm += haversineDistanceKm(points[index - 1], point);
      }
    });

    const path: ShapePath = {
      shapeId,
      points,
      lengthKm: points.length >= 2 ? Math.round(lengthKm * 1000) / 1000 : null,
      bounds: shapeBounds,
    };

    byId.set(shapeId, path);
    list.push(path);
  });

  return { byId, list, bounds: datasetBounds };
}

function buildFareSummaries(
  fareAttributes: GtfsFareAttribute[],
  fareRules: GtfsFareRule[],
): FareSummary[] {
  const rulesByFare = new Map<string, GtfsFareRule[]>();
  fareRules.forEach((rule) => {
    const bucket = rulesByFare.get(rule.fare_id) ?? [];
    bucket.push(rule);
    rulesByFare.set(rule.fare_id, bucket);
  });

  const summaries: FareSummary[] = [];
  const referencedFareIds = new Set<string>();

  fareAttributes.forEach((attribute) => {
    const rules = rulesByFare.get(attribute.fare_id) ?? [];
    referencedFareIds.add(attribute.fare_id);

    const routes = dedupeNonEmpty(rules.map((rule) => rule.route_id));
    const originZones = dedupeNonEmpty(rules.map((rule) => rule.origin_id));
    const destinationZones = dedupeNonEmpty(rules.map((rule) => rule.destination_id));
    const containsZones = dedupeNonEmpty(rules.map((rule) => rule.contains_id));

    summaries.push({
      fareId: attribute.fare_id,
      price: parseFloatOrNull(attribute.price),
      currency: attribute.currency_type ?? null,
      paymentMethod: attribute.payment_method,
      transfers: parseIntOrNull(attribute.transfers),
      transferDurationSeconds: parseIntOrNull(attribute.transfer_duration),
      routes,
      originZones,
      destinationZones,
      containsZones,
      appliesToAllRoutes: routes.length === 0,
      attribute,
      rules,
    });
  });

  rulesByFare.forEach((rules, fareId) => {
    if (referencedFareIds.has(fareId)) {
      return;
    }
    const routes = dedupeNonEmpty(rules.map((rule) => rule.route_id));
    const originZones = dedupeNonEmpty(rules.map((rule) => rule.origin_id));
    const destinationZones = dedupeNonEmpty(rules.map((rule) => rule.destination_id));
    const containsZones = dedupeNonEmpty(rules.map((rule) => rule.contains_id));

    summaries.push({
      fareId,
      price: null,
      currency: null,
      paymentMethod: undefined,
      transfers: null,
      transferDurationSeconds: null,
      routes,
      originZones,
      destinationZones,
      containsZones,
      appliesToAllRoutes: routes.length === 0,
      attribute: null,
      rules,
    });
  });

  return summaries;
}

function groupStopTimesByTrip(stopTimes: GtfsStopTime[]): Map<string, StopTimeGroup> {
  const map = new Map<string, StopTimeGroup>();
  const grouped = new Map<string, GtfsStopTime[]>();
  stopTimes.forEach((stopTime) => {
    const arr = grouped.get(stopTime.trip_id) ?? [];
    arr.push(stopTime);
    grouped.set(stopTime.trip_id, arr);
  });

  grouped.forEach((times, tripId) => {
    const ordered = times.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence));
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    map.set(tripId, {
      startTime: first?.departure_time ?? first?.arrival_time ?? '',
      endTime: last?.arrival_time ?? last?.departure_time ?? '',
      startStopId: first?.stop_id ?? '',
      endStopId: last?.stop_id ?? '',
    });
  });

  return map;
}

function buildTripSummaries(
  trips: GtfsTrip[],
  stopTimeGroups: Map<string, StopTimeGroup>,
): Map<string, TripSummary[]> {
  const routeTrips = new Map<string, TripSummary[]>();

  trips.forEach((trip) => {
    const stopInfo = stopTimeGroups.get(trip.trip_id);
    const summary: TripSummary = {
      tripId: trip.trip_id,
      routeId: trip.route_id,
      serviceId: trip.service_id,
      blockId: trip.block_id,
      directionId: trip.direction_id,
      shapeId: trip.shape_id,
      tripHeadsign: trip.trip_headsign,
      startTime: stopInfo?.startTime ?? '',
      endTime: stopInfo?.endTime ?? '',
      startStopId: stopInfo?.startStopId ?? '',
      endStopId: stopInfo?.endStopId ?? '',
    };

    if (!routeTrips.has(trip.route_id)) {
      routeTrips.set(trip.route_id, []);
    }
    routeTrips.get(trip.route_id)!.push(summary);
  });

  routeTrips.forEach((summaries) => {
    summaries.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return routeTrips;
}

function mapActiveDays(calendar: GtfsCalendar): string[] {
  type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  const dayLabels: Array<[DayKey, string]> = [
    ['monday', '月'],
    ['tuesday', '火'],
    ['wednesday', '水'],
    ['thursday', '木'],
    ['friday', '金'],
    ['saturday', '土'],
    ['sunday', '日'],
  ];

  return dayLabels
    .filter(([key]) => calendar[key] === '1')
    .map(([, label]) => label);
}

function summarizeCalendar(
  calendars: GtfsCalendar[],
  calendarDates: GtfsCalendarDate[],
): ServiceCalendarSummary[] {
  const dateMap = new Map<string, { added: string[]; removed: string[] }>();
  calendarDates.forEach((entry) => {
    const bucket = dateMap.get(entry.service_id) ?? { added: [], removed: [] };
    if (entry.exception_type === '1') {
      bucket.added.push(entry.date);
    } else if (entry.exception_type === '2') {
      bucket.removed.push(entry.date);
    }
    dateMap.set(entry.service_id, bucket);
  });

  return calendars.map((calendar) => {
    const overrides = dateMap.get(calendar.service_id) ?? { added: [], removed: [] };
    const exceptions: ServiceException[] = [
      ...overrides.added.map((date) => ({ date, type: 'added' as const })),
      ...overrides.removed.map((date) => ({ date, type: 'removed' as const })),
    ];
    return {
      serviceId: calendar.service_id,
      activeDays: mapActiveDays(calendar),
      startDate: calendar.start_date,
      endDate: calendar.end_date,
      addedDates: overrides.added,
      removedDates: overrides.removed,
      exceptions,
      hasAddedService: overrides.added.length > 0,
      hasRemovedService: overrides.removed.length > 0,
    };
  });
}

export function buildGtfsDomainModel(data: ParsedGtfsData): GtfsDomainModel {
  const stopTimeGroups = groupStopTimesByTrip(data.stopTimes);
  const routeTripMap = buildTripSummaries(data.trips, stopTimeGroups);

  const routes: RouteSummary[] = data.routes.map((route) => ({
    route,
    trips: routeTripMap.get(route.route_id) ?? [],
  }));

  const services = summarizeCalendar(data.calendar, data.calendarDates);
  const stops = buildStopLookup(data.stops);
  const shapes = buildShapeLookup(data.shapes);
  const fares = buildFareSummaries(data.fareAttributes, data.fareRules);

  return {
    routes,
    blocks: data.trips.length ? buildBlocksFromTrips(data.trips) : [],
    services,
    stops,
    shapes,
    fares,
  };
}

function buildBlocksFromTrips(trips: GtfsTrip[]): TripBlock[] {
  const blocks = new Map<string, Set<string>>();
  trips.forEach((trip) => {
    const blockId = trip.block_id && trip.block_id.trim().length > 0 ? trip.block_id : `__no_block__::${trip.trip_id}`;
    if (!blocks.has(blockId)) {
      blocks.set(blockId, new Set());
    }
    blocks.get(blockId)!.add(trip.trip_id);
  });
  return Array.from(blocks.entries()).map(([blockId, tripIds]) => ({ blockId, tripIds: Array.from(tripIds) }));
}

export function resolveStopName(stops: StopLookup, stopId: string): string {
  return stops.byId.get(stopId)?.name ?? stopId;
}

export function toScheduleRoute(
  trip: TripSummary,
  stops: StopLookup,
): { id: string; name: string; startTime: string; endTime: string; startStop: string; endStop: string } {
  return {
    id: trip.tripId,
    name: trip.tripHeadsign ?? trip.tripId,
    startTime: trip.startTime,
    endTime: trip.endTime,
    startStop: resolveStopName(stops, trip.startStopId),
    endStop: resolveStopName(stops, trip.endStopId),
  };
}


