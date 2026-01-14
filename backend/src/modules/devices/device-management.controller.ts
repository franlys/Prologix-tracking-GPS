import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DeviceManagementService } from './device-management.service';
import { CreateDeviceDto, UpdateDeviceDto, AssignDeviceDto } from './dto/create-device.dto';

@Controller('device-management')
@UseGuards(JwtAuthGuard)
export class DeviceManagementController {
  constructor(private readonly deviceManagementService: DeviceManagementService) {}

  // ==================== Endpoints para Instaladores ====================

  /**
   * POST /device-management/register
   * Registrar un nuevo dispositivo GPS (solo instaladores y admin)
   */
  @Post('register')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async registerDevice(@Body() dto: CreateDeviceDto, @Request() req) {
    const device = await this.deviceManagementService.createDevice(dto, req.user.id);
    return {
      success: true,
      message: 'Dispositivo registrado exitosamente',
      device,
    };
  }

  /**
   * GET /device-management/my-installations
   * Obtener dispositivos instalados por el instalador actual
   */
  @Get('my-installations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async getMyInstallations(@Request() req) {
    const devices = await this.deviceManagementService.getDevicesByInstaller(req.user.id);
    return {
      success: true,
      count: devices.length,
      devices,
    };
  }

  /**
   * PUT /device-management/:id/assign
   * Asignar un dispositivo a un cliente (solo instaladores y admin)
   */
  @Put(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async assignDevice(
    @Param('id') deviceId: string,
    @Body() dto: AssignDeviceDto,
    @Request() req,
  ) {
    const device = await this.deviceManagementService.assignDeviceToOwner(
      deviceId,
      dto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Dispositivo asignado exitosamente',
      device,
    };
  }

  /**
   * PUT /device-management/:id
   * Actualizar información de un dispositivo
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async updateDevice(
    @Param('id') deviceId: string,
    @Body() dto: UpdateDeviceDto,
    @Request() req,
  ) {
    const device = await this.deviceManagementService.updateDevice(deviceId, dto, req.user.id);
    return {
      success: true,
      message: 'Dispositivo actualizado exitosamente',
      device,
    };
  }

  // ==================== Endpoints para Admin ====================

  /**
   * GET /device-management/all
   * Obtener todos los dispositivos (solo admin)
   */
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllDevices() {
    const devices = await this.deviceManagementService.getAllDevices();
    return {
      success: true,
      count: devices.length,
      devices,
    };
  }

  /**
   * GET /device-management/summary
   * Obtener resumen de dispositivos para dashboard (solo admin)
   */
  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDevicesSummary() {
    const summary = await this.deviceManagementService.getDevicesSummary();
    return {
      success: true,
      summary,
    };
  }

  /**
   * GET /device-management/need-recharge
   * Obtener dispositivos que necesitan recarga de SIM
   */
  @Get('need-recharge')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async getDevicesNeedingRecharge(@Query('days') days?: string) {
    const daysThreshold = days ? parseInt(days) : 7;
    const devices = await this.deviceManagementService.getDevicesNeedingRecharge(daysThreshold);
    return {
      success: true,
      count: devices.length,
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        imei: d.imei,
        simNumber: d.simNumber,
        simCarrier: d.simCarrier,
        simExpirationDate: d.simExpirationDate,
        ownerName: d.owner?.name,
        ownerEmail: d.owner?.email,
      })),
    };
  }

  // ==================== Endpoints Generales ====================

  /**
   * GET /device-management/by-imei/:imei
   * Buscar dispositivo por IMEI
   */
  @Get('by-imei/:imei')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTALLER, UserRole.ADMIN)
  async getDeviceByImei(@Param('imei') imei: string) {
    const device = await this.deviceManagementService.getDeviceByImei(imei);
    return {
      success: true,
      device,
    };
  }

  /**
   * GET /device-management/:id
   * Obtener dispositivo por ID
   */
  @Get(':id')
  async getDevice(@Param('id') deviceId: string, @Request() req) {
    const device = await this.deviceManagementService.getDeviceById(deviceId);

    // Verificar acceso: admin, instalador del dispositivo, o dueño
    const user = req.user;
    if (
      user.role !== UserRole.ADMIN &&
      device.installerId !== user.id &&
      device.ownerId !== user.id
    ) {
      return {
        success: false,
        message: 'No tienes acceso a este dispositivo',
      };
    }

    return {
      success: true,
      device,
    };
  }

  // ==================== Endpoints para Usuarios (Clientes) ====================

  /**
   * GET /device-management/my-devices
   * Obtener mis dispositivos (para clientes)
   */
  @Get('my-devices')
  async getMyDevices(@Request() req) {
    const devices = await this.deviceManagementService.getDevicesByOwner(req.user.id);
    return {
      success: true,
      count: devices.length,
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        imei: d.imei,
        simNumber: d.simNumber,
        simCarrier: d.simCarrier,
        simExpirationDate: d.simExpirationDate,
        vehicleDescription: d.vehicleDescription,
        vehiclePlate: d.vehiclePlate,
        status: d.status,
        installedAt: d.installedAt,
      })),
    };
  }
}
