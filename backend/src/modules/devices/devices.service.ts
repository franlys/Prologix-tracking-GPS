import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GpsTraceService,
  GpsTraceDevice,
  GpsTracePosition,
  GpsTraceHistoryPoint,
} from '../../integrations/gps-trace/gps-trace.service';
import { UsersService } from '../users/users.service';

// Extended device interface with position data for frontend
interface DeviceWithPosition extends GpsTraceDevice {
  lastPosition?: {
    lat: string;
    lng: string;
    speed: number;
    timestamp: string;
  };
  online?: boolean;
}

@Injectable()
export class DevicesService {
  constructor(
    private gpsTraceService: GpsTraceService,
    private usersService: UsersService,
  ) {}

  async getDevices(prologixUserId: string): Promise<DeviceWithPosition[]> {
    const user = await this.usersService.findById(prologixUserId);

    if (!user.gpsTraceUserId) {
      // Return mock data for testing when GPS-Trace is not configured
      const mockDevices: DeviceWithPosition[] = [
        {
          id: 'device-001',
          name: 'Vehículo Demo 1',
          imei: '123456789012345',
          type: 'gps',
          status: 'online',
          lastPosition: {
            lat: '18.4861',
            lng: '-69.9312',
            speed: 45,
            timestamp: new Date().toISOString(),
          },
          online: true,
        },
        {
          id: 'device-002',
          name: 'Vehículo Demo 2',
          imei: '123456789012346',
          type: 'gps',
          status: 'online',
          lastPosition: {
            lat: '18.4900',
            lng: '-69.9400',
            speed: 30,
            timestamp: new Date().toISOString(),
          },
          online: true,
        },
        {
          id: 'device-003',
          name: 'Vehículo Demo 3',
          imei: '123456789012347',
          type: 'gps',
          status: 'offline',
          lastPosition: {
            lat: '18.4750',
            lng: '-69.9200',
            speed: 0,
            timestamp: new Date().toISOString(),
          },
          online: false,
        },
      ];
      return mockDevices;
    }

    return this.gpsTraceService.getDevices(user.gpsTraceUserId);
  }

  async getDeviceById(
    deviceId: string,
    prologixUserId: string,
  ): Promise<DeviceWithPosition> {
    const user = await this.usersService.findById(prologixUserId);

    if (!user.gpsTraceUserId) {
      // Return mock device data for testing
      const mockDevices = await this.getDevices(prologixUserId);
      const device = mockDevices.find((d) => d.id === deviceId);

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      return device;
    }

    return this.gpsTraceService.getDeviceById(deviceId);
  }

  async getLivePosition(
    deviceId: string,
    prologixUserId: string,
  ): Promise<GpsTracePosition> {
    const user = await this.usersService.findById(prologixUserId);

    if (!user.gpsTraceUserId) {
      // Return mock live position data for testing
      const device = await this.getDeviceById(deviceId, prologixUserId);

      if (!device.lastPosition) {
        throw new NotFoundException('Position not available');
      }

      return {
        lat: parseFloat(device.lastPosition.lat),
        lng: parseFloat(device.lastPosition.lng),
        speed: device.lastPosition.speed,
        course: 0,
        altitude: 0,
        timestamp: device.lastPosition.timestamp,
      };
    }

    return this.gpsTraceService.getLastPosition(deviceId);
  }

  async getHistory(
    deviceId: string,
    startDate: Date,
    endDate: Date,
    prologixUserId: string,
  ): Promise<GpsTraceHistoryPoint[]> {
    const user = await this.usersService.findById(prologixUserId);

    if (!user.gpsTraceUserId) {
      // Return mock history data for testing
      const device = await this.getDeviceById(deviceId, prologixUserId);

      if (!device.lastPosition) {
        return [];
      }

      const historyPoints: GpsTraceHistoryPoint[] = [];

      // Generate some sample history points
      const now = new Date();
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000); // Every minute
        historyPoints.push({
          lat:
            parseFloat(device.lastPosition.lat) +
            (Math.random() - 0.5) * 0.01,
          lng:
            parseFloat(device.lastPosition.lng) +
            (Math.random() - 0.5) * 0.01,
          speed: Math.floor(Math.random() * 60),
          timestamp: timestamp.toISOString(),
          altitude: 0,
          course: 0,
        });
      }

      return historyPoints.reverse();
    }

    return this.gpsTraceService.getHistory(deviceId, startDate, endDate);
  }
}
