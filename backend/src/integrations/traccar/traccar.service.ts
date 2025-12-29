import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  TraccarDevice,
  TraccarPosition,
  TraccarEvent,
  TraccarGeofence,
  TraccarCommand,
  TraccarUser,
} from './interfaces/traccar-device.interface';

@Injectable()
export class TraccarService {
  private readonly logger = new Logger(TraccarService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiPassword: string;

  constructor() {
    this.apiUrl = process.env.TRACCAR_API_URL || 'http://localhost:8082';
    this.apiUser = process.env.TRACCAR_API_USER || 'admin';
    this.apiPassword = process.env.TRACCAR_API_PASSWORD || 'admin';

    if (!process.env.TRACCAR_API_URL) {
      this.logger.warn(
        '⚠️  TRACCAR_API_URL is not configured. Using default: http://localhost:8082'
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      auth: {
        username: this.apiUser,
        password: this.apiPassword,
      },
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.logger.log(`📡 Traccar Service initialized with API: ${this.apiUrl}`);
  }

  // ==================== DEVICES ====================

  /**
   * Get all devices (optionally filtered by user)
   */
  async getDevices(userId?: number): Promise<TraccarDevice[]> {
    try {
      const response = await this.axiosInstance.get<TraccarDevice[]>(
        '/api/devices',
        {
          params: userId ? { userId } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch devices from Traccar');
    }
  }

  /**
   * Get a single device by ID
   */
  async getDeviceById(deviceId: number): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.get<TraccarDevice>(
        `/api/devices/${deviceId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `Failed to fetch device ${deviceId} from Traccar`);
    }
  }

  /**
   * Create a new device
   */
  async createDevice(device: Partial<TraccarDevice>): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.post<TraccarDevice>(
        '/api/devices',
        device
      );
      this.logger.log(`✅ Created device: ${response.data.name} (${response.data.uniqueId})`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create device in Traccar');
    }
  }

  /**
   * Update a device
   */
  async updateDevice(deviceId: number, updates: Partial<TraccarDevice>): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.put<TraccarDevice>(
        `/api/devices/${deviceId}`,
        updates
      );
      this.logger.log(`✅ Updated device ${deviceId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Failed to update device ${deviceId}`);
    }
  }

  /**
   * Delete a device
   */
  async deleteDevice(deviceId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/devices/${deviceId}`);
      this.logger.log(`✅ Deleted device ${deviceId}`);
    } catch (error) {
      this.handleError(error, `Failed to delete device ${deviceId}`);
    }
  }

  // ==================== POSITIONS ====================

  /**
   * Get latest positions for devices
   */
  async getPositions(deviceIds?: number[]): Promise<TraccarPosition[]> {
    try {
      const params: any = {};
      if (deviceIds && deviceIds.length > 0) {
        params.deviceId = deviceIds.join(',');
      }

      const response = await this.axiosInstance.get<TraccarPosition[]>(
        '/api/positions',
        { params }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch positions from Traccar');
    }
  }

  /**
   * Get historical positions (route report)
   */
  async getHistory(
    deviceId: number,
    from: Date,
    to: Date
  ): Promise<TraccarPosition[]> {
    try {
      const response = await this.axiosInstance.get<TraccarPosition[]>(
        '/api/reports/route',
        {
          params: {
            deviceId,
            from: from.toISOString(),
            to: to.toISOString(),
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch history from Traccar');
    }
  }

  /**
   * Get summary report
   */
  async getSummary(
    deviceId: number,
    from: Date,
    to: Date
  ): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get('/api/reports/summary', {
        params: {
          deviceId,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch summary from Traccar');
    }
  }

  // ==================== EVENTS ====================

  /**
   * Get events for a device
   */
  async getEvents(
    deviceId: number,
    from: Date,
    to: Date,
    type?: string
  ): Promise<TraccarEvent[]> {
    try {
      const params: any = {
        deviceId,
        from: from.toISOString(),
        to: to.toISOString(),
      };
      if (type) {
        params.type = type;
      }

      const response = await this.axiosInstance.get<TraccarEvent[]>(
        '/api/reports/events',
        { params }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch events from Traccar');
    }
  }

  // ==================== GEOFENCES ====================

  /**
   * Get all geofences
   */
  async getGeofences(userId?: number): Promise<TraccarGeofence[]> {
    try {
      const response = await this.axiosInstance.get<TraccarGeofence[]>(
        '/api/geofences',
        {
          params: userId ? { userId } : {},
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch geofences from Traccar');
    }
  }

  /**
   * Create a geofence
   */
  async createGeofence(geofence: Partial<TraccarGeofence>): Promise<TraccarGeofence> {
    try {
      const response = await this.axiosInstance.post<TraccarGeofence>(
        '/api/geofences',
        geofence
      );
      this.logger.log(`✅ Created geofence: ${response.data.name}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create geofence in Traccar');
    }
  }

  /**
   * Delete a geofence
   */
  async deleteGeofence(geofenceId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/geofences/${geofenceId}`);
      this.logger.log(`✅ Deleted geofence ${geofenceId}`);
    } catch (error) {
      this.handleError(error, `Failed to delete geofence ${geofenceId}`);
    }
  }

  // ==================== COMMANDS ====================

  /**
   * Send a command to a device
   */
  async sendCommand(command: TraccarCommand): Promise<TraccarCommand> {
    try {
      const response = await this.axiosInstance.post<TraccarCommand>(
        '/api/commands/send',
        command
      );
      this.logger.log(
        `✅ Sent command ${command.type} to device ${command.deviceId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to send command to device');
    }
  }

  // ==================== USERS ====================

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<TraccarUser[]> {
    try {
      const response = await this.axiosInstance.get<TraccarUser[]>('/api/users');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch users from Traccar');
    }
  }

  /**
   * Create a new user
   */
  async createUser(user: Partial<TraccarUser>): Promise<TraccarUser> {
    try {
      const response = await this.axiosInstance.post<TraccarUser>(
        '/api/users',
        user
      );
      this.logger.log(`✅ Created Traccar user: ${response.data.email}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create user in Traccar');
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId: number, updates: Partial<TraccarUser>): Promise<TraccarUser> {
    try {
      const response = await this.axiosInstance.put<TraccarUser>(
        `/api/users/${userId}`,
        updates
      );
      this.logger.log(`✅ Updated Traccar user ${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Failed to update user ${userId}`);
    }
  }

  // ==================== PERMISSIONS ====================

  /**
   * Link a device to a user
   */
  async linkDeviceToUser(deviceId: number, userId: number): Promise<void> {
    try {
      await this.axiosInstance.post('/api/permissions', {
        deviceId,
        userId,
      });
      this.logger.log(`✅ Linked device ${deviceId} to user ${userId}`);
    } catch (error) {
      this.handleError(error, 'Failed to link device to user');
    }
  }

  /**
   * Unlink a device from a user
   */
  async unlinkDeviceFromUser(deviceId: number, userId: number): Promise<void> {
    try {
      await this.axiosInstance.delete('/api/permissions', {
        data: { deviceId, userId },
      });
      this.logger.log(`✅ Unlinked device ${deviceId} from user ${userId}`);
    } catch (error) {
      this.handleError(error, 'Failed to unlink device from user');
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Test connection to Traccar server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/api/server');
      this.logger.log(`✅ Traccar connection successful: v${response.data.version}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Traccar connection failed:', error.message);
      return false;
    }
  }

  /**
   * Get server info
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/server');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to fetch server info');
    }
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: any, message: string): never {
    const errorDetails = {
      message,
      statusCode: error.response?.status || 500,
      traccarError: error.response?.data?.message || error.message,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('🔴 Traccar API Error:', JSON.stringify(errorDetails, null, 2));

    if (error.code === 'ECONNREFUSED') {
      throw new HttpException(
        {
          message: 'Cannot connect to Traccar server',
          error: `Connection refused to ${this.apiUrl}. Please check Traccar server is running.`,
          details: 'Ensure Traccar is installed and running on the configured URL.',
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    if (error.response?.status === 401) {
      throw new HttpException(
        {
          message: 'Traccar authentication failed',
          error: 'Invalid credentials. Please check TRACCAR_API_USER and TRACCAR_API_PASSWORD.',
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    if (error.response?.status === 404) {
      throw new HttpException(
        {
          message: 'Resource not found in Traccar',
          error: error.response?.data?.message || 'The requested resource does not exist.',
        },
        HttpStatus.NOT_FOUND
      );
    }

    throw new HttpException(
      {
        message,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      },
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
