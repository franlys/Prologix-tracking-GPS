import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceStatus } from './entities/device.entity';
import { CreateDeviceDto, UpdateDeviceDto, AssignDeviceDto } from './dto/create-device.dto';
import { UsersService } from '../users/users.service';
import { TraccarService } from '../../integrations/traccar/traccar.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class DeviceManagementService {
  private readonly logger = new Logger(DeviceManagementService.name);

  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private usersService: UsersService,
    private traccarService: TraccarService,
  ) {}

  /**
   * Registrar un nuevo dispositivo GPS (usado por instaladores)
   */
  async createDevice(dto: CreateDeviceDto, installerId: string): Promise<Device> {
    // Verificar que el IMEI no exista ya
    const existingDevice = await this.deviceRepository.findOne({
      where: { imei: dto.imei },
    });

    if (existingDevice) {
      throw new ConflictException(`Ya existe un dispositivo con IMEI ${dto.imei}`);
    }

    // Crear dispositivo en Traccar primero
    let traccarDeviceId: string | null = null;
    try {
      const traccarDevice = await this.traccarService.createDevice({
        name: dto.name,
        uniqueId: dto.imei,
        category: 'car',
      });
      traccarDeviceId = traccarDevice.id.toString();
      this.logger.log(`Dispositivo creado en Traccar con ID: ${traccarDeviceId}`);
    } catch (error) {
      this.logger.error('Error creando dispositivo en Traccar:', error);
      throw new BadRequestException('No se pudo registrar el dispositivo en el servidor GPS');
    }

    // Buscar el dueño si se proporcionó email
    let ownerId: string | null = null;
    if (dto.ownerEmail) {
      try {
        const owner = await this.usersService.findByEmail(dto.ownerEmail);
        ownerId = owner.id;
      } catch {
        this.logger.warn(`Usuario con email ${dto.ownerEmail} no encontrado`);
      }
    }

    // Crear registro en nuestra base de datos
    const device = this.deviceRepository.create({
      imei: dto.imei,
      name: dto.name,
      simNumber: dto.simNumber,
      simCarrier: dto.simCarrier,
      simExpirationDate: dto.simExpirationDate ? new Date(dto.simExpirationDate) : null,
      deviceType: dto.deviceType,
      vehicleDescription: dto.vehicleDescription,
      vehiclePlate: dto.vehiclePlate,
      notes: dto.notes,
      traccarDeviceId,
      ownerId,
      installerId,
      status: ownerId ? DeviceStatus.ACTIVE : DeviceStatus.PENDING,
      installedAt: new Date(),
    });

    const savedDevice = await this.deviceRepository.save(device);
    this.logger.log(`Dispositivo ${dto.imei} registrado exitosamente`);

    return savedDevice;
  }

  /**
   * Obtener todos los dispositivos (para admin)
   */
  async getAllDevices(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['owner', 'installer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener dispositivos de un instalador
   */
  async getDevicesByInstaller(installerId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { installerId },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener dispositivos de un usuario (cliente)
   */
  async getDevicesByOwner(ownerId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { ownerId },
      relations: ['installer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un dispositivo por ID
   */
  async getDeviceById(deviceId: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['owner', 'installer'],
    });

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return device;
  }

  /**
   * Obtener un dispositivo por IMEI
   */
  async getDeviceByImei(imei: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { imei },
      relations: ['owner', 'installer'],
    });

    if (!device) {
      throw new NotFoundException(`Dispositivo con IMEI ${imei} no encontrado`);
    }

    return device;
  }

  /**
   * Actualizar dispositivo
   */
  async updateDevice(deviceId: string, dto: UpdateDeviceDto, userId: string): Promise<Device> {
    const device = await this.getDeviceById(deviceId);

    // Verificar permisos (solo instalador que lo creó o admin)
    const user = await this.usersService.findById(userId);
    if (user.role !== UserRole.ADMIN && device.installerId !== userId) {
      throw new BadRequestException('No tienes permisos para modificar este dispositivo');
    }

    // Actualizar campos
    if (dto.name) device.name = dto.name;
    if (dto.simNumber !== undefined) device.simNumber = dto.simNumber;
    if (dto.simCarrier !== undefined) device.simCarrier = dto.simCarrier;
    if (dto.simExpirationDate) device.simExpirationDate = new Date(dto.simExpirationDate);
    if (dto.deviceType) device.deviceType = dto.deviceType;
    if (dto.vehicleDescription !== undefined) device.vehicleDescription = dto.vehicleDescription;
    if (dto.vehiclePlate !== undefined) device.vehiclePlate = dto.vehiclePlate;
    if (dto.notes !== undefined) device.notes = dto.notes;

    // Si cambió el nombre, actualizar en Traccar también
    if (dto.name && device.traccarDeviceId) {
      try {
        await this.traccarService.updateDevice(parseInt(device.traccarDeviceId), {
          name: dto.name,
        });
      } catch (error) {
        this.logger.warn('No se pudo actualizar nombre en Traccar:', error);
      }
    }

    return this.deviceRepository.save(device);
  }

  /**
   * Asignar dispositivo a un cliente
   */
  async assignDeviceToOwner(deviceId: string, dto: AssignDeviceDto, installerId: string): Promise<Device> {
    const device = await this.getDeviceById(deviceId);

    // Verificar que el instalador sea quien creó el dispositivo o sea admin
    const installer = await this.usersService.findById(installerId);
    if (installer.role !== UserRole.ADMIN && device.installerId !== installerId) {
      throw new BadRequestException('No tienes permisos para asignar este dispositivo');
    }

    // Buscar al nuevo dueño
    const owner = await this.usersService.findByEmail(dto.ownerEmail);
    if (!owner) {
      throw new NotFoundException(`Usuario con email ${dto.ownerEmail} no encontrado`);
    }

    device.ownerId = owner.id;
    device.status = DeviceStatus.ACTIVE;

    // Vincular en Traccar si es necesario
    if (device.traccarDeviceId && owner.traccarUserId) {
      try {
        await this.traccarService.linkDeviceToUser(
          parseInt(device.traccarDeviceId),
          parseInt(owner.traccarUserId),
        );
      } catch (error) {
        this.logger.warn('No se pudo vincular dispositivo en Traccar:', error);
      }
    }

    return this.deviceRepository.save(device);
  }

  /**
   * Obtener dispositivos que necesitan recarga de SIM
   */
  async getDevicesNeedingRecharge(daysThreshold: number = 7): Promise<Device[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.owner', 'owner')
      .where('device.simExpirationDate IS NOT NULL')
      .andWhere('device.simExpirationDate <= :thresholdDate', { thresholdDate })
      .orderBy('device.simExpirationDate', 'ASC')
      .getMany();
  }

  /**
   * Obtener resumen de dispositivos para dashboard
   */
  async getDevicesSummary(): Promise<{
    total: number;
    active: number;
    pending: number;
    inactive: number;
    needingRecharge: number;
  }> {
    const [total, active, pending, inactive] = await Promise.all([
      this.deviceRepository.count(),
      this.deviceRepository.count({ where: { status: DeviceStatus.ACTIVE } }),
      this.deviceRepository.count({ where: { status: DeviceStatus.PENDING } }),
      this.deviceRepository.count({ where: { status: DeviceStatus.INACTIVE } }),
    ]);

    const needingRecharge = await this.getDevicesNeedingRecharge(7);

    return {
      total,
      active,
      pending,
      inactive,
      needingRecharge: needingRecharge.length,
    };
  }
}
