import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { NotificationRule, NotificationType, NotificationChannel } from '../entities/notification-rule.entity';
import { NotificationLog, NotificationStatus } from '../entities/notification-log.entity';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { CreateNotificationRuleDto } from '../dto/create-notification-rule.dto';
import { UpdateNotificationRuleDto } from '../dto/update-notification-rule.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationRule)
    private notificationRulesRepo: Repository<NotificationRule>,
    @InjectRepository(NotificationLog)
    private notificationLogsRepo: Repository<NotificationLog>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private emailService: EmailService,
    private whatsAppService: WhatsAppService,
  ) {}

  // ==================== CRUD for Notification Rules ====================

  async createRule(userId: string, dto: CreateNotificationRuleDto): Promise<NotificationRule> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rule = this.notificationRulesRepo.create({
      ...dto,
      userId,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      cooldownSeconds: dto.cooldownSeconds || 300, // Default 5 minutes
    });

    const saved = await this.notificationRulesRepo.save(rule);
    this.logger.log(`✅ Created notification rule: ${saved.type} for user ${userId}`);
    return saved;
  }

  async getUserRules(userId: string): Promise<NotificationRule[]> {
    return this.notificationRulesRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRuleById(ruleId: string, userId: string): Promise<NotificationRule> {
    const rule = await this.notificationRulesRepo.findOne({
      where: { id: ruleId, userId },
    });

    if (!rule) {
      throw new NotFoundException('Notification rule not found');
    }

    return rule;
  }

  async updateRule(
    ruleId: string,
    userId: string,
    dto: UpdateNotificationRuleDto,
  ): Promise<NotificationRule> {
    const rule = await this.getRuleById(ruleId, userId);
    Object.assign(rule, dto);
    const updated = await this.notificationRulesRepo.save(rule);
    this.logger.log(`✅ Updated notification rule: ${ruleId}`);
    return updated;
  }

  async deleteRule(ruleId: string, userId: string): Promise<void> {
    const rule = await this.getRuleById(ruleId, userId);
    await this.notificationRulesRepo.remove(rule);
    this.logger.log(`✅ Deleted notification rule: ${ruleId}`);
  }

  // ==================== Notification Logs ====================

  async getUserLogs(userId: string, limit: number = 50): Promise<NotificationLog[]> {
    return this.notificationLogsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async createLog(data: {
    userId: string;
    deviceId?: string;
    deviceName?: string;
    type: NotificationType;
    channel: NotificationChannel;
    message: string;
    recipient: string;
    status: NotificationStatus;
    errorMessage?: string;
  }): Promise<NotificationLog> {
    const log = this.notificationLogsRepo.create(data);
    return this.notificationLogsRepo.save(log);
  }

  // ==================== Cooldown Logic ====================

  async canSendNotification(
    userId: string,
    deviceId: string,
    type: NotificationType,
    channel: NotificationChannel,
    cooldownSeconds: number,
  ): Promise<boolean> {
    const cooldownDate = new Date();
    cooldownDate.setSeconds(cooldownDate.getSeconds() - cooldownSeconds);

    const recentLog = await this.notificationLogsRepo.findOne({
      where: {
        userId,
        deviceId,
        type,
        channel,
        status: NotificationStatus.SENT,
        createdAt: LessThan(cooldownDate),
      },
      order: { createdAt: 'DESC' },
    });

    return !recentLog; // If no recent log found, can send
  }

  // ==================== Send Notification ====================

  async sendNotification(data: {
    userId: string;
    deviceId?: string;
    deviceName?: string;
    type: NotificationType;
    channel: NotificationChannel;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const user = await this.usersRepo.findOne({ where: { id: data.userId } });
    if (!user) {
      this.logger.error(`User not found: ${data.userId}`);
      return false;
    }

    let recipient: string;
    let success = false;

    try {
      if (data.channel === NotificationChannel.EMAIL || data.channel === NotificationChannel.BOTH) {
        recipient = user.email;
        success = await this.emailService.sendNotification(
          recipient,
          data.subject,
          data.message,
          data.deviceName,
        );

        await this.createLog({
          userId: data.userId,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          type: data.type,
          channel: NotificationChannel.EMAIL,
          message: data.message,
          recipient,
          status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        });
      }

      if (data.channel === NotificationChannel.WHATSAPP || data.channel === NotificationChannel.BOTH) {
        if (!user.phoneNumber) {
          this.logger.warn(`User ${data.userId} has no phone number for WhatsApp`);
          await this.createLog({
            userId: data.userId,
            deviceId: data.deviceId,
            deviceName: data.deviceName,
            type: data.type,
            channel: NotificationChannel.WHATSAPP,
            message: data.message,
            recipient: 'N/A',
            status: NotificationStatus.FAILED,
            errorMessage: 'User has no phone number',
          });
          return false;
        }

        recipient = user.phoneNumber;
        success = await this.whatsAppService.sendNotification(recipient, data.message, data.deviceName);

        await this.createLog({
          userId: data.userId,
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          type: data.type,
          channel: NotificationChannel.WHATSAPP,
          message: data.message,
          recipient,
          status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        });
      }

      return success;
    } catch (error) {
      this.logger.error(`Failed to send notification:`, error);
      await this.createLog({
        userId: data.userId,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        type: data.type,
        channel: data.channel,
        message: data.message,
        recipient: recipient || 'N/A',
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
      return false;
    }
  }

  // ==================== Check Device Conditions ====================

  async checkDeviceOffline(
    userId: string,
    deviceId: string,
    deviceName: string,
    lastSeenMinutesAgo: number,
  ): Promise<void> {
    const rules = await this.notificationRulesRepo.find({
      where: {
        userId,
        deviceId,
        type: NotificationType.DEVICE_OFFLINE,
        isActive: true,
      },
    });

    for (const rule of rules) {
      const offlineThreshold = rule.config?.offlineMinutes || 10;

      if (lastSeenMinutesAgo >= offlineThreshold) {
        const canSend = await this.canSendNotification(
          userId,
          deviceId,
          NotificationType.DEVICE_OFFLINE,
          rule.channel,
          rule.cooldownSeconds,
        );

        if (canSend) {
          await this.sendNotification({
            userId,
            deviceId,
            deviceName,
            type: NotificationType.DEVICE_OFFLINE,
            channel: rule.channel,
            subject: `⚠️ Dispositivo Offline: ${deviceName}`,
            message: `El dispositivo "${deviceName}" ha estado offline por más de ${lastSeenMinutesAgo} minutos.`,
          });
        }
      }
    }
  }

  async checkSpeedExceeded(
    userId: string,
    deviceId: string,
    deviceName: string,
    currentSpeed: number,
  ): Promise<void> {
    const rules = await this.notificationRulesRepo.find({
      where: {
        userId,
        deviceId,
        type: NotificationType.SPEED_EXCEEDED,
        isActive: true,
      },
    });

    for (const rule of rules) {
      const speedLimit = rule.config?.speedLimit || 100;

      if (currentSpeed > speedLimit) {
        const canSend = await this.canSendNotification(
          userId,
          deviceId,
          NotificationType.SPEED_EXCEEDED,
          rule.channel,
          rule.cooldownSeconds,
        );

        if (canSend) {
          await this.sendNotification({
            userId,
            deviceId,
            deviceName,
            type: NotificationType.SPEED_EXCEEDED,
            channel: rule.channel,
            subject: `🚨 Velocidad Excedida: ${deviceName}`,
            message: `El dispositivo "${deviceName}" está viajando a ${currentSpeed} km/h (límite: ${speedLimit} km/h).`,
          });
        }
      }
    }
  }

  async checkLowBattery(
    userId: string,
    deviceId: string,
    deviceName: string,
    batteryPercent: number,
  ): Promise<void> {
    const rules = await this.notificationRulesRepo.find({
      where: {
        userId,
        deviceId,
        type: NotificationType.LOW_BATTERY,
        isActive: true,
      },
    });

    for (const rule of rules) {
      const batteryThreshold = rule.config?.batteryPercent || 20;

      if (batteryPercent <= batteryThreshold) {
        const canSend = await this.canSendNotification(
          userId,
          deviceId,
          NotificationType.LOW_BATTERY,
          rule.channel,
          rule.cooldownSeconds,
        );

        if (canSend) {
          await this.sendNotification({
            userId,
            deviceId,
            deviceName,
            type: NotificationType.LOW_BATTERY,
            channel: rule.channel,
            subject: `🔋 Batería Baja: ${deviceName}`,
            message: `El dispositivo "${deviceName}" tiene solo ${batteryPercent}% de batería.`,
          });
        }
      }
    }
  }

  // Método de utilidad para verificar geofencing (se implementará en Fase 3)
  async checkGeofence(
    userId: string,
    deviceId: string,
    deviceName: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    // TODO: Implementar en Fase 3 - Geocercas
    this.logger.debug('Geofence checking not yet implemented');
  }
}
