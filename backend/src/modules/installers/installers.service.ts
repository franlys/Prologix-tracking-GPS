import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CommissionsService } from './services/commissions.service';

@Injectable()
export class InstallersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private commissionsService: CommissionsService,
  ) {}

  /**
   * Obtener todos los instaladores
   */
  async getAllInstallers() {
    return this.userRepository.find({
      where: { role: UserRole.INSTALLER, isActive: true },
      select: ['id', 'email', 'name', 'phoneNumber', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener un instalador por ID
   */
  async getInstallerById(installerId: string) {
    const installer = await this.userRepository.findOne({
      where: { id: installerId, role: UserRole.INSTALLER },
    });

    if (!installer) {
      throw new NotFoundException('Instalador no encontrado');
    }

    return installer;
  }

  /**
   * Obtener clientes de un instalador
   */
  async getInstallerClients(installerId: string) {
    await this.getInstallerById(installerId); // Verificar que existe

    const clients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.installer_id = :installerId', { installerId })
      .andWhere('user.role = :role', { role: UserRole.USER })
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.phoneNumber',
        'user.subscriptionPlan',
        'user.createdAt',
      ])
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return clients;
  }

  /**
   * Vincular un cliente a un instalador
   * Esto se hace cuando el instalador instala el GPS en el vehículo del cliente
   */
  async linkClientToInstaller(clientId: string, installerId: string) {
    // Verificar que el instalador existe
    const installer = await this.getInstallerById(installerId);

    // Verificar que el cliente existe
    const client = await this.userRepository.findOne({
      where: { id: clientId, role: UserRole.USER },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar que el cliente no esté ya vinculado a un instalador
    if ((client as any).installerId) {
      throw new BadRequestException('Este cliente ya está vinculado a un instalador');
    }

    // Vincular cliente al instalador
    await this.userRepository.update(clientId, {
      ...(client as any),
      installerId: installerId,
    });

    return {
      success: true,
      message: 'Cliente vinculado al instalador exitosamente',
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
      installer: {
        id: installer.id,
        name: installer.name,
        email: installer.email,
      },
    };
  }

  /**
   * Obtener estadísticas de un instalador
   */
  async getInstallerStats(installerId: string) {
    await this.getInstallerById(installerId); // Verificar que existe

    // Contar clientes
    const totalClients = await this.userRepository
      .createQueryBuilder('user')
      .where('user.installer_id = :installerId', { installerId })
      .andWhere('user.role = :role', { role: UserRole.USER })
      .getCount();

    // Obtener comisiones
    const commissions = await this.commissionsService.getInstallerCommissions(installerId);

    const totalEarned = commissions
      .filter(c => c.paymentStatus === 'PAID')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    const totalPending = commissions
      .filter(c => c.paymentStatus === 'PENDING')
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    return {
      installerId,
      totalClients,
      totalCommissions: commissions.length,
      totalEarned: Number(totalEarned.toFixed(2)),
      totalPending: Number(totalPending.toFixed(2)),
      commissions,
    };
  }
}
