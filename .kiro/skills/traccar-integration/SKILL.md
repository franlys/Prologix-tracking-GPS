---
name: traccar-integration
description: Guides integration with Traccar GPS tracking server via REST API and WebSocket. Use when working with Traccar devices, GPS positions, device registration, real-time tracking, Traccar API endpoints, or when user asks about "connect GPS device", "traccar server", "GPS positions", "device tracking", "traccar session", or "real-time location".
metadata:
  author: Prologix GPS
  version: 1.0.0
---

# Traccar Integration

## Architecture

This project uses Traccar as the GPS tracking backend. The NestJS backend communicates with Traccar via its REST API. Frontend receives positions via the backend API (never directly to Traccar).

```
GPS Device → Traccar Server → NestJS Backend → Frontend PWA
```

## Traccar REST API

Base URL is configured via `TRACCAR_URL` env var. All requests use Basic Auth with `TRACCAR_USER` / `TRACCAR_PASSWORD`.

### Key Endpoints

```
GET  /api/session          — authenticate, get session cookie
GET  /api/devices          — list all devices
POST /api/devices          — register new device
GET  /api/positions        — latest positions for all devices
GET  /api/reports/route    — historical positions (requires from/to params)
DELETE /api/devices/{id}   — remove device
```

### Authentication Pattern

```ts
// Always use session cookie, not Basic Auth on every request
const session = await traccarService.getSession();
// Session cookie is cached and reused
```

## Device Registration

```ts
// Required fields for new device
{
  name: string,       // display name
  uniqueId: string,   // IMEI or device identifier
}
```

## Position Object

```ts
interface TraccarPosition {
  id: number;
  deviceId: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;       // knots
  course: number;      // degrees
  fixTime: string;     // ISO 8601
  valid: boolean;      // GPS fix valid
  attributes: {
    ignition?: boolean;
    motion?: boolean;
    batteryLevel?: number;
  }
}
```

## NestJS Service Pattern

The `TraccarService` in `backend/src/integrations/traccar/traccar.service.ts` wraps all Traccar API calls. Always use this service, never call Traccar directly from controllers.

## Common Issues

**401 Unauthorized:** Session expired. The service should re-authenticate automatically — check `getSession()` logic.

**Device not receiving positions:** Verify the device `uniqueId` matches the IMEI configured in the physical GPS unit.

**Speed in knots:** Traccar returns speed in knots. Convert to km/h: `speedKmh = speedKnots * 1.852`.
