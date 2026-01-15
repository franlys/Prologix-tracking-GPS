import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';
import { UserRole, GpsProvider } from '../users/entities/user.entity';

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

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.updateUserRole(userId, role);

    return {
      message: 'User role updated successfully',
      userId,
      role,
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

  async linkUserToTraccar(userId: string, traccarUserId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.update(userId, {
      traccarUserId,
      gpsProvider: GpsProvider.TRACCAR,
    });

    return {
      message: 'User linked to Traccar successfully',
      userId,
      traccarUserId,
      gpsProvider: GpsProvider.TRACCAR,
    };
  }

  async getAllDevices() {
    // Get all users
    const users = await this.usersService.findAll();

    // Get devices for each user and combine them
    const allDevices = [];

    for (const user of users) {
      if (user.gpsTraceUserId) {
        try {
          const devices = await this.devicesService.getDevices(user.id);

          // Add user info to each device
          const devicesWithUser = devices.map(device => ({
            ...device,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          }));

          allDevices.push(...devicesWithUser);
        } catch (error) {
          console.error(`Error fetching devices for user ${user.id}:`, error);
        }
      }
    }

    return allDevices;
  }
}
