import { Controller, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, GpsProvider } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * CONTROLADOR TEMPORAL PARA SETUP INICIAL
 * Este controlador se usa SOLO para crear el primer usuario admin
 * Una vez creado el admin, este endpoint puede ser removido o deshabilitado
 */
@Controller('admin-setup')
export class AdminSetupController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Endpoint para actualizar un usuario existente a ADMIN
   * POST /admin-setup/promote
   * Body: { email: "tu-email@ejemplo.com", password: "tu-contraseña-actual" }
   */
  @Post('promote')
  async promoteToAdmin(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Contraseña incorrecta',
      };
    }

    // Actualizar a ADMIN
    user.role = UserRole.ADMIN;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Usuario promovido a ADMIN exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Endpoint para crear un nuevo usuario ADMIN desde cero
   * POST /admin-setup/create
   * Body: { email: "admin@ejemplo.com", password: "contraseña-segura", name: "Nombre Admin" }
   */
  @Post('create')
  async createAdmin(
    @Body() body: { email: string; password: string; name: string },
  ) {
    const { email, password, name } = body;

    // Verificar si ya existe
    const existing = await this.userRepository.findOne({ where: { email } });

    if (existing) {
      return {
        success: false,
        message: 'Ya existe un usuario con ese email',
      };
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear admin
    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
      isActive: true,
    });

    await this.userRepository.save(admin);

    return {
      success: true,
      message: 'Usuario ADMIN creado exitosamente',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  /**
   * Endpoint para vincular un usuario con Traccar
   * POST /admin-setup/link-traccar
   * Body: { email: "tu-email@ejemplo.com", password: "tu-contraseña", traccarUserId: "1" }
   */
  @Post('link-traccar')
  async linkToTraccar(
    @Body() body: { email: string; password: string; traccarUserId: string },
  ) {
    const { email, password, traccarUserId } = body;

    // Buscar usuario
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Contraseña incorrecta',
      };
    }

    // Actualizar para usar Traccar
    user.gpsProvider = GpsProvider.TRACCAR;
    user.traccarUserId = traccarUserId;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Usuario vinculado a Traccar exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gpsProvider: user.gpsProvider,
        traccarUserId: user.traccarUserId,
      },
    };
  }
}
