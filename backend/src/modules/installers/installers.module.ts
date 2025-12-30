import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallersController } from './installers.controller';
import { InstallersService } from './installers.service';
import { CommissionsService } from './services/commissions.service';
import { InstallerCommission } from './entities/installer-commission.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstallerCommission, User]),
    UsersModule,
  ],
  controllers: [InstallersController],
  providers: [InstallersService, CommissionsService],
  exports: [InstallersService, CommissionsService],
})
export class InstallersModule {}
