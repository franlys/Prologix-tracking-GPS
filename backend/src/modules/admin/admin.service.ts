import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private devicesService: DevicesService,
  ) {}

  async getAllUsers() {
    const users = await this.usersService.findAll();

    // Remove sensitive data
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      gpsTraceUserId: user.gpsTraceUserId,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));
  }

  async getUserById(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      gpsTraceUserId: user.gpsTraceUserId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserGpsTrace(userId: string, gpsTraceUserId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.updateGpsTraceUserId(userId, gpsTraceUserId);

    return {
      message: 'GPS-Trace User ID updated successfully',
      userId,
      gpsTraceUserId,
    };
  }

  async getUserDevices(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.gpsTraceUserId) {
      return {
        userId,
        gpsTraceUserId: null,
        devices: [],
        message: 'User does not have a GPS-Trace account linked',
      };
    }

    const devices = await this.devicesService.getDevices(userId);

    return {
      userId,
      gpsTraceUserId: user.gpsTraceUserId,
      devices,
      deviceCount: devices.length,
    };
  }
}
