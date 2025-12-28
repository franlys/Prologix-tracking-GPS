import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { EmailService } from './services/email.service';
import { WhatsAppService } from './services/whatsapp.service';
import { NotificationRule } from './entities/notification-rule.entity';
import { NotificationLog } from './entities/notification-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationRule, NotificationLog, User]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, WhatsAppService],
  exports: [NotificationsService, EmailService, WhatsAppService],
})
export class NotificationsModule {}
