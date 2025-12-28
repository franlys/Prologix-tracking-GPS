import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './services/notifications.service';
import { CreateNotificationRuleDto } from './dto/create-notification-rule.dto';
import { UpdateNotificationRuleDto } from './dto/update-notification-rule.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== Notification Rules ====================

  @Post('rules')
  async createRule(@Request() req, @Body() dto: CreateNotificationRuleDto) {
    return this.notificationsService.createRule(req.user.userId, dto);
  }

  @Get('rules')
  async getUserRules(@Request() req) {
    return this.notificationsService.getUserRules(req.user.userId);
  }

  @Get('rules/:ruleId')
  async getRuleById(@Request() req, @Param('ruleId') ruleId: string) {
    return this.notificationsService.getRuleById(ruleId, req.user.userId);
  }

  @Patch('rules/:ruleId')
  async updateRule(
    @Request() req,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateNotificationRuleDto,
  ) {
    return this.notificationsService.updateRule(ruleId, req.user.userId, dto);
  }

  @Delete('rules/:ruleId')
  async deleteRule(@Request() req, @Param('ruleId') ruleId: string) {
    await this.notificationsService.deleteRule(ruleId, req.user.userId);
    return { message: 'Notification rule deleted successfully' };
  }

  // ==================== Notification Logs ====================

  @Get('logs')
  async getUserLogs(@Request() req, @Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.notificationsService.getUserLogs(req.user.userId, limitNumber);
  }

  // ==================== Manual Test Endpoint ====================

  @Post('test')
  async testNotification(
    @Request() req,
    @Body() body: { channel: 'EMAIL' | 'WHATSAPP' | 'BOTH'; message: string },
  ) {
    const success = await this.notificationsService.sendNotification({
      userId: req.user.userId,
      type: 'DEVICE_OFFLINE' as any,
      channel: body.channel as any,
      subject: 'Test Notification',
      message: body.message,
      deviceName: 'Test Device',
    });

    return {
      success,
      message: success ? 'Notification sent successfully' : 'Failed to send notification',
    };
  }
}
