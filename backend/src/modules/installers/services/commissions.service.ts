import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstallerCommission, CommissionStatus } from '../entities/installer-commission.entity';

@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(InstallerCommission)
    private commissionRepository: Repository<InstallerCommission>,
  ) {}

  /**
   * Crear una comisión cuando un cliente elige su primera suscripción
   * SOLO se genera comisión en la PRIMERA suscripción del cliente
   */
  async createCommission(
    installerId: string,
    clientId: string,
    subscriptionPlan: string,
    subscriptionAmount: number,
  ) {
    // Verificar si ya existe una comisión para este cliente
    const existingCommission = await this.commissionRepository.findOne({
      where: { clientId },
    });

    if (existingCommission) {
      return {
        success: false,
        message: 'Ya existe una comisión registrada para este cliente. Solo se paga por la primera suscripción.',
        commission: null,
      };
    }

    // Calcular comisión (10% del monto de suscripción)
    const commissionPercentage = 10.0;
    const commissionAmount = (subscriptionAmount * commissionPercentage) / 100;

    // Crear comisión
    const commission = this.commissionRepository.create({
      installerId,
      clientId,
      subscriptionPlan,
      subscriptionAmount,
      commissionPercentage,
      commissionAmount,
      paymentStatus: CommissionStatus.PENDING,
    });

    await this.commissionRepository.save(commission);

    return {
      success: true,
      message: 'Comisión creada exitosamente',
      commission,
    };
  }

  /**
   * Obtener todas las comisiones de un instalador
   */
  async getInstallerCommissions(installerId: string) {
    return this.commissionRepository.find({
      where: { installerId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener comisiones pendientes de un instalador
   */
  async getPendingCommissions(installerId: string) {
    return this.commissionRepository.find({
      where: { installerId, paymentStatus: CommissionStatus.PENDING },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Marcar comisión como pagada
   */
  async markAsPaid(commissionId: string, notes?: string) {
    const commission = await this.commissionRepository.findOne({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new NotFoundException('Comisión no encontrada');
    }

    commission.paymentStatus = CommissionStatus.PAID;
    commission.paidAt = new Date();
    if (notes) {
      commission.notes = notes;
    }

    await this.commissionRepository.save(commission);

    return {
      success: true,
      message: 'Comisión marcada como pagada',
      commission,
    };
  }

  /**
   * Obtener resumen de comisiones (para admin)
   */
  async getCommissionsSummary() {
    const allCommissions = await this.commissionRepository.find({
      relations: ['installer', 'client'],
    });

    const totalCommissions = allCommissions.length;
    const totalPaid = allCommissions.filter(c => c.paymentStatus === CommissionStatus.PAID).length;
    const totalPending = allCommissions.filter(c => c.paymentStatus === CommissionStatus.PENDING).length;

    const totalAmountPaid = allCommissions
      .filter(c => c.paymentStatus === CommissionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    const totalAmountPending = allCommissions
      .filter(c => c.paymentStatus === CommissionStatus.PENDING)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    return {
      totalCommissions,
      totalPaid,
      totalPending,
      totalAmountPaid: Number(totalAmountPaid.toFixed(2)),
      totalAmountPending: Number(totalAmountPending.toFixed(2)),
      commissions: allCommissions,
    };
  }
}
