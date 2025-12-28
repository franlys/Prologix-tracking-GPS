import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface GpsTraceDevice {
  id: string;
  name: string;
  imei: string;
  type: string;
  status: string;
}

export interface GpsTracePosition {
  lat: number;
  lng: number;
  speed: number;
  course: number;
  altitude: number;
  timestamp: string;
  address?: string;
}

export interface GpsTraceHistoryPoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
  altitude: number;
  course: number;
}

@Injectable()
export class GpsTraceService {
  private readonly axiosInstance: AxiosInstance;
  private readonly partnerToken: string;

  constructor() {
    this.partnerToken = process.env.GPS_TRACE_PARTNER_TOKEN;

    if (!this.partnerToken) {
      console.warn(
        '⚠️  GPS_TRACE_PARTNER_TOKEN is not configured. GPS features will not work.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: process.env.GPS_TRACE_API_URL || 'https://api.gps-trace.com/v1',
      headers: {
        'Authorization': `Bearer ${this.partnerToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    console.log(
      `📡 GPS-Trace Service initialized with API: ${process.env.GPS_TRACE_API_URL || 'https://api.gps-trace.com/v1'}`,
    );
  }

  async getDevices(userId: string): Promise<GpsTraceDevice[]> {
    try {
      const response = await this.axiosInstance.get('/devices', {
        params: { user_id: userId },
      });

      return this.normalizeDevices(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to fetch devices');
    }
  }

  async getDeviceById(deviceId: string): Promise<GpsTraceDevice> {
    try {
      const response = await this.axiosInstance.get(`/devices/${deviceId}`);
      return this.normalizeDevice(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to fetch device');
    }
  }

  async getLastPosition(deviceId: string): Promise<GpsTracePosition> {
    try {
      const response = await this.axiosInstance.get(`/devices/${deviceId}/position`);
      return this.normalizePosition(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to fetch last position');
    }
  }

  async getHistory(
    deviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<GpsTraceHistoryPoint[]> {
    try {
      const response = await this.axiosInstance.get(`/devices/${deviceId}/history`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      });

      return this.normalizeHistory(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to fetch history');
    }
  }

  private normalizeDevices(data: any): GpsTraceDevice[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(device => this.normalizeDevice(device));
  }

  private normalizeDevice(device: any): GpsTraceDevice {
    return {
      id: device.id || device.device_id || '',
      name: device.name || device.device_name || 'Unknown Device',
      imei: device.imei || '',
      type: device.type || device.device_type || 'gps',
      status: device.status || 'unknown',
    };
  }

  private normalizePosition(data: any): GpsTracePosition {
    return {
      lat: parseFloat(data.lat || data.latitude || 0),
      lng: parseFloat(data.lng || data.longitude || 0),
      speed: parseFloat(data.speed || 0),
      course: parseFloat(data.course || data.heading || 0),
      altitude: parseFloat(data.altitude || data.alt || 0),
      timestamp: data.timestamp || data.time || new Date().toISOString(),
      address: data.address || null,
    };
  }

  private normalizeHistory(data: any): GpsTraceHistoryPoint[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(point => ({
      lat: parseFloat(point.lat || point.latitude || 0),
      lng: parseFloat(point.lng || point.longitude || 0),
      speed: parseFloat(point.speed || 0),
      timestamp: point.timestamp || point.time || new Date().toISOString(),
      altitude: parseFloat(point.altitude || point.alt || 0),
      course: parseFloat(point.course || point.heading || 0),
    }));
  }

  private handleError(error: any, message: string): never {
    const errorDetails = {
      message,
      statusCode: error.response?.status || 500,
      gpsTraceError: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    };

    console.error('🔴 GPS-Trace API Error:', errorDetails);

    if (error.code === 'ECONNREFUSED') {
      throw new HttpException(
        {
          message: 'Cannot connect to GPS-Trace API',
          error: 'Connection refused. Please check GPS-Trace API configuration.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error.response?.status === 401) {
      throw new HttpException(
        {
          message: 'GPS-Trace authentication failed',
          error: 'Invalid Partner Token. Please check GPS_TRACE_PARTNER_TOKEN configuration.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    throw new HttpException(
      {
        message,
        error: error.response?.data?.message || error.message,
      },
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
