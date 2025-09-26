export interface GtfsRoute {
  route_id: string;
  agency_id?: string;
  route_short_name?: string;
  route_long_name?: string;
  route_desc?: string;
  route_type?: string;
  route_url?: string;
  route_color?: string;
  route_text_color?: string;
}

export interface GtfsTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: string;
  block_id?: string;
  shape_id?: string;
  trip_short_name?: string;
}

export interface GtfsStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
  pickup_type?: string;
  drop_off_type?: string;
  timepoint?: string;
}

export interface GtfsStop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_desc?: string;
  stop_lat?: string;
  stop_lon?: string;
  zone_id?: string;
  stop_url?: string;
  location_type?: string;
  parent_station?: string;
}

export interface GtfsCalendar {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string;
  end_date: string;
}

export interface GtfsCalendarDate {
  service_id: string;
  date: string;
  exception_type: string; // 1: added service, 2: removed service
}

export interface GtfsShape {
  shape_id: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
  shape_pt_sequence: string;
  shape_dist_traveled?: string;
}

export interface GtfsFareAttribute {
  fare_id: string;
  price: string;
  currency_type: string;
  payment_method: string;
  transfers: string;
  transfer_duration?: string;
}

export interface GtfsFareRule {
  fare_id: string;
  route_id?: string;
  origin_id?: string;
  destination_id?: string;
  contains_id?: string;
}

export interface ParsedGtfsData {
  routes: GtfsRoute[];
  trips: GtfsTrip[];
  stopTimes: GtfsStopTime[];
  stops: GtfsStop[];
  calendar: GtfsCalendar[];
  calendarDates: GtfsCalendarDate[];
  shapes: GtfsShape[];
  fareAttributes: GtfsFareAttribute[];
  fareRules: GtfsFareRule[];
}

export interface ImportOptions {
  timezone?: string;
}

export interface TripBlock {
  blockId: string;
  tripIds: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  context?: Record<string, string | number | undefined>;
}
