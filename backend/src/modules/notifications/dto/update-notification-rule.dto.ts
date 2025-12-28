import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationRuleDto } from './create-notification-rule.dto';

export class UpdateNotificationRuleDto extends PartialType(CreateNotificationRuleDto) {}
