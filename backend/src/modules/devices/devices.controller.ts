import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { RequirePlan } from '../auth/decorators/require-plan.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubscriptionPlan } from '../subscriptions/entities/subscription.entity';
import { GetHistoryDto } from './dto/get-history.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get()
  async getDevices(@CurrentUser() user: any) {
    return this.devicesService.getDevices(user.userId);
  }

  @Get(':id')
  async getDeviceById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.getDeviceById(id, user.userId);
  }

  @Get(':id/live')
  async getLivePosition(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.getLivePosition(id, user.userId);
  }

  @Get(':id/history')
  @UseGuards(SubscriptionGuard)
  @RequirePlan(SubscriptionPlan.BASICO)
  async getHistory(
    @Param('id') id: string,
    @Query(ValidationPipe) query: GetHistoryDto,
    @CurrentUser() user: any,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.devicesService.getHistory(id, startDate, endDate, user.userId);
  }

  @Post(':id/sms')
  async sendSmsCommand(
    @Param('id') id: string,
    @Body(ValidationPipe) sendSmsDto: SendSmsDto,
    @CurrentUser() user: any,
  ) {
    return this.devicesService.sendSmsCommand(
      id,
      sendSmsDto.command,
      user.userId,
    );
  }
}
