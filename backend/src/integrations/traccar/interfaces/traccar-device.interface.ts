/**
 * Traccar Device Interface
 * Based on Traccar API v5.x
 * Docs: https://www.traccar.org/api-reference/
 */

export interface TraccarDevice {
  id: number;
  attributes: Record<string, any>;
  groupId: number;
  name: string;
  uniqueId: string; // IMEI
  status: string;
  lastUpdate: string; // ISO 8601 date
  positionId: number;
  phone?: string;
  model?: string;
  contact?: string;
  category?: string;
  disabled: boolean;
}

export interface TraccarPosition {
  id: number;
  deviceId: number;
  protocol: string;
  deviceTime: string; // ISO 8601
  fixTime: string; // ISO 8601
  serverTime: string; // ISO 8601
  outdated: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number; // knots
  course: number; // degrees
  address?: string;
  accuracy: number;
  network?: any;
  attributes: {
    batteryLevel?: number;
    distance?: number;
    totalDistance?: number;
    motion?: boolean;
    ignition?: boolean;
    sat?: number; // satellites
    rssi?: number;
    charge?: boolean;
    [key: string]: any;
  };
}

export interface TraccarEvent {
  id: number;
  deviceId: number;
  type: string;
  eventTime: string;
  positionId: number;
  geofenceId?: number;
  maintenanceId?: number;
  attributes: Record<string, any>;
}

export interface TraccarGeofence {
  id: number;
  name: string;
  description?: string;
  area: string; // WKT polygon
  calendarId?: number;
  attributes: Record<string, any>;
}

export interface TraccarCommand {
  id?: number;
  deviceId: number;
  description?: string;
  type: string;
  textChannel?: boolean;
  attributes: Record<string, any>;
}

export interface TraccarUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  readonly: boolean;
  administrator: boolean;
  map?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  password?: string;
  coordinateFormat?: string;
  disabled: boolean;
  expirationTime?: string;
  deviceLimit: number;
  userLimit: number;
  deviceReadonly: boolean;
  limitCommands: boolean;
  attributes: Record<string, any>;
}
