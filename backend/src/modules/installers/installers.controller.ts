import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InstallersService } from './installers.service';
import { CommissionsService } from './services/commissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('installers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstallersController {
  constructor(
    private installersService: InstallersService,
    private commissionsService: CommissionsService,
  ) {}

  // ============================================
  // ENDPOINTS PARA ADMIN
  // ============================================

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllInstallers() {
    return this.installersService.getAllInstallers();
  }

  @Get(':installerId/clients')
  @Roles(UserRole.ADMIN)
  async getInstallerClients(@Param('installerId') installerId: string) {
    return this.installersService.getInstallerClients(installerId);
  }

  @Get(':installerId/stats')
  @Roles(UserRole.ADMIN)
  async getInstallerStats(@Param('installerId') installerId: string) {
    return this.installersService.getInstallerStats(installerId);
  }

  @Post('link-client')
  @Roles(UserRole.ADMIN, UserRole.INSTALLER)
  async linkClient(
    @Body() body: { clientId: string; installerId: string },
    @Request() req,
  ) {
    // Si es instalador, solo puede vincular clientes a sí mismo
    const installerId =
      req.user.role === UserRole.INSTALLER
        ? req.user.userId
        : body.installerId;

    return this.installersService.linkClientToInstaller(
      body.clientId,
      installerId,
    );
  }

  // ============================================
  // ENDPOINTS DE COMISIONES
  // ============================================

  @Get('commissions/summary')
  @Roles(UserRole.ADMIN)
  async getCommissionsSummary() {
    return this.commissionsService.getCommissionsSummary();
  }

  @Get(':installerId/commissions')
  @Roles(UserRole.ADMIN, UserRole.INSTALLER)
  async getInstallerCommissions(
    @Param('installerId') installerId: string,
    @Request() req,
  ) {
    // Si es instalador, solo puede ver sus propias comisiones
    const targetInstallerId =
      req.user.role === UserRole.INSTALLER
        ? req.user.userId
        : installerId;

    return this.commissionsService.getInstallerCommissions(targetInstallerId);
  }

  @Get(':installerId/commissions/pending')
  @Roles(UserRole.ADMIN, UserRole.INSTALLER)
  async getPendingCommissions(
    @Param('installerId') installerId: string,
    @Request() req,
  ) {
    const targetInstallerId =
      req.user.role === UserRole.INSTALLER
        ? req.user.userId
        : installerId;

    return this.commissionsService.getPendingCommissions(targetInstallerId);
  }

  @Patch('commissions/:commissionId/mark-paid')
  @Roles(UserRole.ADMIN)
  async markCommissionAsPaid(
    @Param('commissionId') commissionId: string,
    @Body() body: { notes?: string },
  ) {
    return this.commissionsService.markAsPaid(commissionId, body.notes);
  }

  @Post('commissions/create')
  @Roles(UserRole.ADMIN)
  async createCommission(
    @Body()
    body: {
      installerId: string;
      clientId: string;
      subscriptionPlan: string;
      subscriptionAmount: number;
    },
  ) {
    return this.commissionsService.createCommission(
      body.installerId,
      body.clientId,
      body.subscriptionPlan,
      body.subscriptionAmount,
    );
  }

  // ============================================
  // ENDPOINTS PARA INSTALADORES (Sus propios datos)
  // ============================================

  @Get('me/stats')
  @Roles(UserRole.INSTALLER)
  async getMyStats(@Request() req) {
    return this.installersService.getInstallerStats(req.user.userId);
  }

  @Get('me/clients')
  @Roles(UserRole.INSTALLER)
  async getMyClients(@Request() req) {
    return this.installersService.getInstallerClients(req.user.userId);
  }

  @Get('me/commissions')
  @Roles(UserRole.INSTALLER)
  async getMyCommissions(@Request() req) {
    return this.commissionsService.getInstallerCommissions(req.user.userId);
  }
}
