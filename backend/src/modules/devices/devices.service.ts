import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  GpsTraceService,
  GpsTraceDevice,
  GpsTracePosition,
  GpsTraceHistoryPoint,
} from '../../integrations/gps-trace/gps-trace.service';
import { TraccarService } from '../../integrations/traccar/traccar.service';
import { UsersService } from '../users/users.service';
import { GpsProvider } from '../users/entities/user.entity';
import { SmsService } from './sms.service';

// Extended device interface with position data for frontend
export interface DeviceWithPosition extends GpsTraceDevice {
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
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private gpsTraceService: GpsTraceService,
    private traccarService: TraccarService,
    private usersService: UsersService,
    private smsService: SmsService,
  ) {}

  async getDevices(prologixUserId: string): Promise<DeviceWithPosition[]> {
    const user = await this.usersService.findById(prologixUserId);

    this.logger.log(
      `Fetching devices for user ${user.email} using provider: ${user.gpsProvider}`
    );

    // Strategy Pattern: Choose provider based on user configuration
    if (user.gpsProvider === GpsProvider.TRACCAR) {
      return this.getDevicesFromTraccar(user);
    } else if (user.gpsProvider === GpsProvider.GPS_TRACE) {
      return this.getDevicesFromGpsTrace(user);
    }

    // Fallback to mock data if no provider configured
    return this.getMockDevices();
  }

  private async getDevicesFromTraccar(user: any): Promise<DeviceWithPosition[]> {
    if (!user.traccarUserId) {
      this.logger.warn(
        `User ${user.email} configured for Traccar but no traccarUserId set`
      );
      return this.getMockDevices();
    }

    try {
      const traccarUserId = parseInt(user.traccarUserId);
      const devices = await this.traccarService.getDevices(traccarUserId);
      const deviceIds = devices.map((d) => d.id);
      const positions = await this.traccarService.getPositions(deviceIds);

      return devices.map((device) => {
        const position = positions.find((p) => p.deviceId === device.id);
        const isOnline = this.isDeviceOnline(device.lastUpdate);

        return {
          id: device.id.toString(),
          name: device.name,
          imei: device.uniqueId,
          type: device.category || 'gps',
          status: isOnline ? 'online' : 'offline',
          lastPosition: position
            ? {
                lat: position.latitude.toFixed(6),
                lng: position.longitude.toFixed(6),
                speed: Math.round(position.speed * 1.852), // knots to km/h
                timestamp: position.deviceTime,
              }
            : undefined,
          online: isOnline,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error fetching devices from Traccar for user ${user.email}:`,
        error
      );
      throw error;
    }
  }

  private async getDevicesFromGpsTrace(user: any): Promise<DeviceWithPosition[]> {
    if (!user.gpsTraceUserId) {
      this.logger.warn(
        `User ${user.email} configured for GPS-Trace but no gpsTraceUserId set`
      );
      return this.getMockDevices();
    }

    return this.gpsTraceService.getDevices(user.gpsTraceUserId);
  }

  private getMockDevices(): DeviceWithPosition[] {
    return [
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
  }

  private isDeviceOnline(lastUpdate: string): boolean {
    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdateDate.getTime()) / 1000 / 60;
    return diffMinutes < 30; // Consider online if updated in last 30 minutes
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

  async sendSmsCommand(
    deviceId: string,
    command: string,
    prologixUserId: string,
  ): Promise<{
    success: boolean;
    message: string;
    messageId?: string;
  }> {
    this.logger.log(
      `Sending SMS command to device ${deviceId} for user ${prologixUserId}`,
    );

    // Verify device belongs to user
    const device = await this.getDeviceById(deviceId, prologixUserId);

    // TODO: Almacenar número de teléfono del GPS en la base de datos
    // Por ahora, usamos un número de prueba
    const devicePhoneNumber = '+18091234567'; // Este debería venir de la configuración del dispositivo

    if (!devicePhoneNumber) {
      throw new BadRequestException(
        'Este dispositivo no tiene un número de teléfono configurado. Contacta a tu instalador para configurarlo.',
      );
    }

    // Validar el número de teléfono
    if (!this.smsService.validatePhoneNumber(devicePhoneNumber)) {
      throw new BadRequestException(
        'El número de teléfono del dispositivo no es válido',
      );
    }

    // Normalizar el número de teléfono
    const normalizedPhone = this.smsService.normalizePhoneNumber(devicePhoneNumber);

    // Enviar el comando SMS
    const result = await this.smsService.sendSmsCommand({
      to: normalizedPhone,
      message: command,
      deviceId: deviceId,
      deviceName: device.name,
    });

    if (!result.success) {
      throw new BadRequestException(
        `No se pudo enviar el comando SMS: ${result.error}`,
      );
    }

    return {
      success: true,
      message: `Comando SMS enviado correctamente a ${device.name}`,
      messageId: result.messageId,
    };
  }
}
