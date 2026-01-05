# Implementación de Sistema de Detección de Impacto

**Documento Técnico para Desarrollo**
**Fecha:** 5 de enero de 2026
**Prioridad:** Alta
**Estimado:** 2-3 semanas de desarrollo

---

## Resumen Ejecutivo

El sistema de detección de impacto utiliza acelerómetros (G-sensors) integrados en los dispositivos GPS para detectar colisiones, frenados bruscos y movimientos anormales del vehículo. Esta funcionalidad ya está disponible en el hardware de 15 modelos actuales, solo requiere implementación en el backend y frontend.

---

## Arquitectura del Sistema

```
┌─────────────────┐
│  GPS Device     │
│  (Acelerómetro) │
└────────┬────────┘
         │ Datos de impacto
         │ (protocolo específico)
         ▼
┌─────────────────┐
│  Traccar Server │
│  (Puerto 5001+) │
└────────┬────────┘
         │ Evento procesado
         │
         ▼
┌─────────────────┐
│  Backend NestJS │
│  - Parser       │
│  - Validator    │
│  - Alerter      │
└────────┬────────┘
         │ Notificación
         │
         ▼
┌─────────────────┐
│  Mobile App     │
│  (Push Notif)   │
└─────────────────┘
```

---

## Fase 1: Backend (NestJS)

### 1.1 Esquema de Base de Datos

#### Nueva tabla: `impact_events`

```typescript
// backend/src/entities/impact-event.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Device } from './device.entity';

export enum ImpactSeverity {
  LEVE = 'LEVE',           // 1.5G - 2.5G
  MODERADO = 'MODERADO',   // 2.5G - 4.0G
  SEVERO = 'SEVERO'        // > 4.0G
}

export enum ImpactType {
  COLISION = 'COLISION',
  FRENADO_BRUSCO = 'FRENADO_BRUSCO',
  ACELERACION_BRUSCA = 'ACELERACION_BRUSCA',
  CURVA_BRUSCA = 'CURVA_BRUSCA',
  VOLCAMIENTO = 'VOLCAMIENTO',
  REMOLQUE = 'REMOLQUE'
}

@Entity('impact_events')
export class ImpactEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  device: Device;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'enum', enum: ImpactSeverity })
  severity: ImpactSeverity;

  @Column({ type: 'enum', enum: ImpactType })
  type: ImpactType;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  gForce: number; // Fuerza G del impacto

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  speed: number; // km/h al momento del impacto

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heading: number; // Dirección en grados

  @Column({ default: false })
  reviewed: boolean; // Si el usuario lo revisó

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas del usuario

  @Column({ default: false })
  emergencyContacted: boolean; // Si se contactó emergencias

  @Column({ type: 'jsonb', nullable: true })
  rawData: any; // Datos crudos del GPS para análisis
}
```

#### Migración

```typescript
// backend/migrations/xxx-create-impact-events.ts

import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateImpactEvents1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'impact_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'deviceId',
            type: 'uuid',
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['LEVE', 'MODERADO', 'SEVERO'],
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['COLISION', 'FRENADO_BRUSCO', 'ACELERACION_BRUSCA', 'CURVA_BRUSCA', 'VOLCAMIENTO', 'REMOLQUE'],
          },
          {
            name: 'gForce',
            type: 'decimal(4,2)',
          },
          {
            name: 'latitude',
            type: 'decimal(10,7)',
          },
          {
            name: 'longitude',
            type: 'decimal(10,7)',
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'speed',
            type: 'decimal(5,2)',
          },
          {
            name: 'heading',
            type: 'decimal(5,2)',
            isNullable: true,
          },
          {
            name: 'reviewed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'emergencyContacted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rawData',
            type: 'jsonb',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'impact_events',
      new TableForeignKey({
        columnNames: ['deviceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'devices',
        onDelete: 'CASCADE',
      }),
    );

    // Índices para optimización
    await queryRunner.query(
      'CREATE INDEX idx_impact_events_device ON impact_events(deviceId)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_impact_events_timestamp ON impact_events(timestamp DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_impact_events_severity ON impact_events(severity)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('impact_events');
  }
}
```

### 1.2 Servicio de Detección de Impacto

```typescript
// backend/src/services/impact-detection.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImpactEvent, ImpactSeverity, ImpactType } from '../entities/impact-event.entity';
import { Device } from '../entities/device.entity';
import { NotificationService } from './notification.service';
import { GeocodingService } from './geocoding.service';

interface ImpactData {
  deviceId: string;
  timestamp: Date;
  gForce: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  rawData?: any;
}

@Injectable()
export class ImpactDetectionService {
  private readonly logger = new Logger(ImpactDetectionService.name);

  // Umbrales configurables
  private readonly THRESHOLDS = {
    LEVE: { min: 1.5, max: 2.5 },
    MODERADO: { min: 2.5, max: 4.0 },
    SEVERO: { min: 4.0, max: Infinity },
  };

  constructor(
    @InjectRepository(ImpactEvent)
    private impactEventRepository: Repository<ImpactEvent>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private notificationService: NotificationService,
    private geocodingService: GeocodingService,
  ) {}

  async processImpactData(data: ImpactData): Promise<ImpactEvent> {
    this.logger.log(`Processing impact data for device ${data.deviceId}`);

    // 1. Determinar severidad
    const severity = this.calculateSeverity(data.gForce);

    // 2. Determinar tipo de impacto
    const type = this.determineImpactType(data);

    // 3. Obtener dirección (geocoding reverso)
    let address: string;
    try {
      address = await this.geocodingService.reverseGeocode(
        data.latitude,
        data.longitude,
      );
    } catch (error) {
      this.logger.error('Error getting address:', error);
      address = `${data.latitude}, ${data.longitude}`;
    }

    // 4. Buscar dispositivo y usuario
    const device = await this.deviceRepository.findOne({
      where: { id: data.deviceId },
      relations: ['user'],
    });

    if (!device) {
      this.logger.error(`Device ${data.deviceId} not found`);
      return null;
    }

    // 5. Crear evento de impacto
    const impactEvent = this.impactEventRepository.create({
      device,
      timestamp: data.timestamp,
      severity,
      type,
      gForce: data.gForce,
      latitude: data.latitude,
      longitude: data.longitude,
      address,
      speed: data.speed,
      heading: data.heading,
      rawData: data.rawData,
    });

    await this.impactEventRepository.save(impactEvent);

    // 6. Enviar notificación al usuario
    await this.sendImpactNotification(device, impactEvent);

    // 7. Si es severo, activar protocolo de emergencia
    if (severity === ImpactSeverity.SEVERO) {
      await this.activateEmergencyProtocol(device, impactEvent);
    }

    return impactEvent;
  }

  private calculateSeverity(gForce: number): ImpactSeverity {
    if (gForce >= this.THRESHOLDS.SEVERO.min) {
      return ImpactSeverity.SEVERO;
    } else if (gForce >= this.THRESHOLDS.MODERADO.min) {
      return ImpactSeverity.MODERADO;
    } else {
      return ImpactSeverity.LEVE;
    }
  }

  private determineImpactType(data: ImpactData): ImpactType {
    // Lógica para determinar tipo basado en velocidad, aceleración, etc.
    // Esta es una implementación simplificada

    if (data.speed > 80) {
      return ImpactType.COLISION;
    } else if (data.speed > 40 && data.gForce > 3) {
      return ImpactType.FRENADO_BRUSCO;
    } else if (data.gForce > 4) {
      return ImpactType.VOLCAMIENTO;
    } else {
      return ImpactType.FRENADO_BRUSCO;
    }
  }

  private async sendImpactNotification(
    device: Device,
    event: ImpactEvent,
  ): Promise<void> {
    const severityEmoji = {
      [ImpactSeverity.LEVE]: '⚠️',
      [ImpactSeverity.MODERADO]: '🚨',
      [ImpactSeverity.SEVERO]: '🆘',
    };

    const title = `${severityEmoji[event.severity]} Impacto Detectado`;
    const body = `${device.name}: Impacto ${event.severity} detectado en ${event.address}`;

    await this.notificationService.sendPushNotification(
      device.user.id,
      {
        title,
        body,
        data: {
          type: 'IMPACT_DETECTED',
          eventId: event.id,
          deviceId: device.id,
          severity: event.severity,
          latitude: event.latitude.toString(),
          longitude: event.longitude.toString(),
        },
      },
    );
  }

  private async activateEmergencyProtocol(
    device: Device,
    event: ImpactEvent,
  ): Promise<void> {
    this.logger.warn(`SEVERE IMPACT - Activating emergency protocol for device ${device.id}`);

    // 1. Enviar notificación de emergencia
    await this.notificationService.sendPushNotification(
      device.user.id,
      {
        title: '🆘 EMERGENCIA - Impacto Severo',
        body: `${device.name} ha sufrido un impacto severo. ¿Necesitas ayuda?`,
        data: {
          type: 'EMERGENCY_IMPACT',
          eventId: event.id,
          deviceId: device.id,
          requiresResponse: 'true',
        },
        priority: 'high',
        sound: 'emergency',
      },
    );

    // 2. Enviar SMS de emergencia (opcional)
    if (device.user.phone && device.user.emergencyContact) {
      // await this.smsService.sendEmergencySMS(...)
    }

    // 3. Notificar a contactos de emergencia
    if (device.user.emergencyContacts) {
      // await this.notifyEmergencyContacts(...)
    }

    // TODO: Implementar más acciones de emergencia
  }

  async getImpactHistory(
    deviceId: string,
    limit: number = 50,
  ): Promise<ImpactEvent[]> {
    return this.impactEventRepository.find({
      where: { device: { id: deviceId } },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async markAsReviewed(
    eventId: string,
    notes?: string,
  ): Promise<ImpactEvent> {
    const event = await this.impactEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Impact event not found');
    }

    event.reviewed = true;
    if (notes) {
      event.notes = notes;
    }

    return this.impactEventRepository.save(event);
  }
}
```

### 1.3 Parser de Protocolos

```typescript
// backend/src/parsers/impact-parser.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class ImpactParser {
  /**
   * Parsea datos de impacto del protocolo GT06
   * Formato: +RESP:GTCRA,<imei>,<gx>,<gy>,<gz>,<speed>,<heading>,<lat>,<lon>,<date>$
   */
  parseGT06Impact(rawData: string): ImpactData | null {
    try {
      const parts = rawData.split(',');

      if (parts[0] !== '+RESP:GTCRA') {
        return null;
      }

      const gx = parseFloat(parts[2]);
      const gy = parseFloat(parts[3]);
      const gz = parseFloat(parts[4]);

      // Calcular magnitud del vector de aceleración
      const gForce = Math.sqrt(gx * gx + gy * gy + gz * gz);

      return {
        deviceId: parts[1],
        timestamp: this.parseDate(parts[8]),
        gForce,
        latitude: parseFloat(parts[6]),
        longitude: parseFloat(parts[7]),
        speed: parseFloat(parts[5]),
        heading: parseFloat(parts[6]),
        rawData: { gx, gy, gz, raw: rawData },
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parsea datos de impacto del protocolo Teltonika
   */
  parseTeltonikaImpact(avlData: any): ImpactData | null {
    try {
      // Teltonika envía eventos con AVL ID 240 (Crash detection)
      const crashEvent = avlData.ioElements.find(
        (io) => io.id === 240 && io.value > 0,
      );

      if (!crashEvent) {
        return null;
      }

      // La fuerza G se calcula desde los valores X, Y, Z
      const accelX = avlData.ioElements.find((io) => io.id === 241)?.value || 0;
      const accelY = avlData.ioElements.find((io) => io.id === 242)?.value || 0;
      const accelZ = avlData.ioElements.find((io) => io.id === 243)?.value || 0;

      // Teltonika envía en mG (miligravedad), convertir a G
      const gForce = Math.sqrt(
        Math.pow(accelX / 1000, 2) +
        Math.pow(accelY / 1000, 2) +
        Math.pow(accelZ / 1000, 2),
      );

      return {
        deviceId: avlData.imei,
        timestamp: new Date(avlData.timestamp * 1000),
        gForce,
        latitude: avlData.latitude,
        longitude: avlData.longitude,
        speed: avlData.speed,
        heading: avlData.heading,
        rawData: avlData,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parsea datos de impacto del protocolo Queclink
   */
  parseQueclinkImpact(rawData: string): ImpactData | null {
    try {
      // Formato: +RESP:GTHBM,<protocol>,<imei>,...,<type>,<value>,...$
      const parts = rawData.split(',');

      if (!parts[0].includes('GTHBM')) {
        return null; // No es evento de comportamiento
      }

      // Buscar tipo de evento (harsh braking, crash, etc.)
      const eventType = parseInt(parts[parts.length - 3]);

      // Solo procesar eventos de impacto (código 3) y frenado brusco (código 1)
      if (![1, 3].includes(eventType)) {
        return null;
      }

      // Queclink envía G-force directamente
      const gForce = parseFloat(parts[parts.length - 2]);

      return {
        deviceId: parts[2],
        timestamp: this.parseQueclinkDate(parts[parts.length - 1]),
        gForce,
        latitude: parseFloat(parts[11]),
        longitude: parseFloat(parts[12]),
        speed: parseFloat(parts[13]),
        heading: parseFloat(parts[14]),
        rawData: { eventType, raw: rawData },
      };
    } catch (error) {
      return null;
    }
  }

  private parseDate(dateStr: string): Date {
    // Implementar parsing específico
    return new Date(dateStr);
  }

  private parseQueclinkDate(dateStr: string): Date {
    // Formato: YYYYMMDDHHMMSS
    const year = parseInt(dateStr.substr(0, 4));
    const month = parseInt(dateStr.substr(4, 2)) - 1;
    const day = parseInt(dateStr.substr(6, 2));
    const hour = parseInt(dateStr.substr(8, 2));
    const minute = parseInt(dateStr.substr(10, 2));
    const second = parseInt(dateStr.substr(12, 2));

    return new Date(year, month, day, hour, minute, second);
  }
}
```

### 1.4 Controlador REST API

```typescript
// backend/src/controllers/impact.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ImpactDetectionService } from '../services/impact-detection.service';

@Controller('api/impacts')
@UseGuards(JwtAuthGuard)
export class ImpactController {
  constructor(private impactService: ImpactDetectionService) {}

  @Get('device/:deviceId')
  async getDeviceImpacts(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: number,
    @CurrentUser() user: any,
  ) {
    // Verificar que el usuario es dueño del dispositivo
    // ...

    return this.impactService.getImpactHistory(deviceId, limit);
  }

  @Get('recent')
  async getRecentImpacts(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ) {
    // Obtener impactos recientes de todos los dispositivos del usuario
    // ...
  }

  @Patch(':eventId/review')
  async markAsReviewed(
    @Param('eventId') eventId: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.impactService.markAsReviewed(eventId, body.notes);
  }

  @Post(':eventId/emergency-contacted')
  async markEmergencyContacted(
    @Param('eventId') eventId: string,
    @CurrentUser() user: any,
  ) {
    // Marcar que se contactó a emergencias
    // ...
  }
}
```

---

## Fase 2: Frontend (React Native)

### 2.1 Servicio de Notificaciones

```typescript
// frontend/services/impact-notification.service.ts

import * as Notifications from 'expo-notifications';
import { Linking, Alert } from 'react-native';

export interface ImpactNotification {
  eventId: string;
  deviceId: string;
  deviceName: string;
  severity: 'LEVE' | 'MODERADO' | 'SEVERO';
  gForce: number;
  address: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

class ImpactNotificationService {
  async setupImpactNotifications() {
    // Configurar handler para notificaciones de impacto
    Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;

      if (data.type === 'IMPACT_DETECTED') {
        this.handleImpactNotification(data);
      } else if (data.type === 'EMERGENCY_IMPACT') {
        this.handleEmergencyImpact(data);
      }
    });

    // Handler para cuando el usuario toca la notificación
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data.type === 'IMPACT_DETECTED' || data.type === 'EMERGENCY_IMPACT') {
        // Navegar a la pantalla de detalles del impacto
        this.navigateToImpactDetails(data.eventId);
      }
    });
  }

  private handleImpactNotification(data: any) {
    // Mostrar alerta in-app si la app está abierta
    const severityEmoji = {
      LEVE: '⚠️',
      MODERADO: '🚨',
      SEVERO: '🆘',
    };

    // Aquí podrías mostrar un modal personalizado
    console.log('Impact detected:', data);
  }

  private handleEmergencyImpact(data: any) {
    // Mostrar alerta de emergencia inmediata
    Alert.alert(
      '🆘 EMERGENCIA - Impacto Severo',
      '¿Estás bien? ¿Necesitas ayuda?',
      [
        {
          text: 'Estoy bien',
          onPress: () => this.confirmSafety(data.eventId),
        },
        {
          text: 'Llamar 911',
          onPress: () => this.call911(),
          style: 'destructive',
        },
        {
          text: 'Ver ubicación',
          onPress: () => this.navigateToImpactDetails(data.eventId),
        },
      ],
      { cancelable: false },
    );
  }

  private async confirmSafety(eventId: string) {
    // Enviar confirmación al backend
    // await api.post(`/api/impacts/${eventId}/confirm-safety`);
  }

  private call911() {
    Linking.openURL('tel:911');
  }

  private navigateToImpactDetails(eventId: string) {
    // Navegar usando router
    // navigation.navigate('ImpactDetails', { eventId });
  }
}

export default new ImpactNotificationService();
```

### 2.2 Pantalla de Detalles de Impacto

```typescript
// frontend/app/impact-details.tsx

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface ImpactEvent {
  id: string;
  device: {
    id: string;
    name: string;
    phone?: string;
  };
  timestamp: string;
  severity: 'LEVE' | 'MODERADO' | 'SEVERO';
  type: string;
  gForce: number;
  latitude: number;
  longitude: number;
  address: string;
  speed: number;
  heading?: number;
  reviewed: boolean;
  notes?: string;
  emergencyContacted: boolean;
}

export default function ImpactDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<ImpactEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/api/impacts/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching impact details:', error);
      Alert.alert('Error', 'No se pudo cargar la información del impacto');
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (notes?: string) => {
    try {
      setMarking(true);
      await api.patch(`/api/impacts/${eventId}/review`, { notes });
      fetchEventDetails();
      Alert.alert('Éxito', 'Evento marcado como revisado');
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      Alert.alert('Error', 'No se pudo marcar como revisado');
    } finally {
      setMarking(false);
    }
  };

  const callDriver = () => {
    if (event?.device.phone) {
      Linking.openURL(`tel:${event.device.phone}`);
    } else {
      Alert.alert('Error', 'No hay número de teléfono registrado');
    }
  };

  const call911 = () => {
    Alert.alert(
      'Llamar al 911',
      '¿Deseas llamar a emergencias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => Linking.openURL('tel:911'),
          style: 'destructive',
        },
      ],
    );
  };

  const openInMaps = () => {
    if (!event) return;

    const url = Platform.select({
      ios: `maps:0,0?q=${event.latitude},${event.longitude}`,
      android: `geo:0,0?q=${event.latitude},${event.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`,
    });

    Linking.openURL(url);
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  const severityColor = {
    LEVE: '#f59e0b',
    MODERADO: '#f97316',
    SEVERO: '#dc2626',
  };

  const severityIcon = {
    LEVE: 'warning' as const,
    MODERADO: 'alert-circle' as const,
    SEVERO: 'alert-circle' as const,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: severityColor[event.severity] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name={severityIcon[event.severity]} size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>Impacto {event.severity}</Text>
          <Text style={styles.headerSubtitle}>{event.device.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Mapa */}
        <Card variant="elevated" style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: event.latitude,
              longitude: event.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              pinColor={severityColor[event.severity]}
            />
          </MapView>
        </Card>

        {/* Detalles del Impacto */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Detalles del Impacto</Text>

          <View style={styles.detailRow}>
            <Ionicons name="speedometer" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fuerza G</Text>
              <Text style={styles.detailValue}>{event.gForce.toFixed(2)}G</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="car" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Velocidad</Text>
              <Text style={styles.detailValue}>{Math.round(event.speed)} km/h</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{event.address}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color="#6b7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha y Hora</Text>
              <Text style={styles.detailValue}>
                {new Date(event.timestamp).toLocaleString('es-DO')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Acciones Rápidas */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <View style={styles.actionsGrid}>
            {event.device.phone && (
              <TouchableOpacity style={styles.actionButton} onPress={callDriver}>
                <Ionicons name="call" size={24} color="#3b82f6" />
                <Text style={styles.actionText}>Llamar Conductor</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={call911}>
              <Ionicons name="medical" size={24} color="#dc2626" />
              <Text style={styles.actionText}>Llamar 911</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={openInMaps}>
              <Ionicons name="map" size={24} color="#10b981" />
              <Text style={styles.actionText}>Abrir en Mapas</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Marcar como Revisado */}
        {!event.reviewed && (
          <Button
            title="Marcar como Revisado"
            onPress={() => markAsReviewed()}
            variant="solid"
            loading={marking}
            style={styles.reviewButton}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    height: 200,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionText: {
    fontSize: 14,
    color: '#1f2937',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  reviewButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
```

---

## Fase 3: Configuración de Dispositivos

### Comandos SMS por Modelo

#### TKSTAR (GT06)
```
# Activar detección de impacto
SENSOR,<contraseña>,1,3

# Parámetros:
# 1 = activar sensor
# 3 = sensibilidad (1=alta, 2=media, 3=baja)

# Ejemplo:
SENSOR,123456,1,2
```

#### Teltonika (vía Configurator)
```
I/O Settings > Accelerometer:
- Crash Detection: Enabled
- Crash Detection Threshold: 3.0G
- Crash Detection Duration: 500ms
- Towing Detection: Enabled
- Harsh Acceleration: Enabled (> 2.0G)
- Harsh Braking: Enabled (> 2.0G)
```

#### Queclink (AT Commands)
```
# Configurar detección de comportamiento
AT+GTCFG=password,1,1,3000,1000,100,0,0,FFFF$

# Parámetros:
# Crash detection: ON
# Threshold: 3.0G
# Report interval: 1000ms
```

---

## Cronograma de Implementación

### Semana 1: Backend
- ✅ Crear esquema de base de datos
- ✅ Implementar servicio de detección
- ✅ Crear parsers de protocolos
- ✅ Implementar API REST
- ✅ Pruebas unitarias

### Semana 2: Frontend
- ✅ Servicio de notificaciones push
- ✅ Pantalla de detalles de impacto
- ✅ Lista de historial de impactos
- ✅ Integración con mapa
- ✅ Pruebas de UI

### Semana 3: Integración y Testing
- ✅ Pruebas con dispositivos reales
- ✅ Configuración de umbrales
- ✅ Optimización de notificaciones
- ✅ Documentación
- ✅ Despliegue a producción

---

## Métricas de Éxito

### KPIs Técnicos
- Tiempo de detección a notificación: < 5 segundos
- Precisión de detección: > 95%
- Falsos positivos: < 5%
- Disponibilidad del servicio: > 99.9%

### KPIs de Negocio
- Adopción de planes con sensor de impacto: > 40%
- Satisfacción del cliente: > 4.5/5
- Reducción de tiempo de respuesta en emergencias: 70%
- Testimonios positivos de clientes

---

## Costos Estimados

### Desarrollo
- Backend Developer (2 semanas): $2,000
- Frontend Developer (2 semanas): $2,000
- QA Testing (1 semana): $800
- DevOps (deployment): $400
**Total Desarrollo:** $5,200

### Operación Mensual
- Notificaciones push (Firebase): $0 - $50
- Geocoding API: $100 - $300
- Servidor adicional: $50 - $100
**Total Mensual:** $150 - $450

### ROI Esperado
- Clientes con plan Pro: 200 @ $5/mes extra = $1,000/mes
- Recuperación de inversión: 5-6 meses
- Beneficio anual estimado: $6,800

---

## Riesgos y Mitigación

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Falsos positivos | Alta | Medio | Ajustar umbrales, ML para filtrado |
| Latencia en notificaciones | Media | Alto | CDN, optimizar backend |
| Dispositivos incompatibles | Baja | Medio | Validar compatibilidad antes de venta |
| Sobrecarga de notificaciones | Media | Alto | Rate limiting, agrupación inteligente |

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Baja adopción | Media | Alto | Marketing, testimonios, demo gratuito |
| Expectativas muy altas | Alta | Medio | Comunicación clara de limitaciones |
| Competencia | Media | Medio | Diferenciación por calidad y servicio |

---

## Conclusión

La implementación del sistema de detección de impacto es **técnicamente viable** y **económicamente rentable**. El hardware ya está disponible en 35% de nuestro catálogo, solo requiere desarrollo de software que puede completarse en 2-3 semanas.

**Beneficios clave:**
- 🚨 Mayor seguridad para clientes
- 💰 Nuevo flujo de ingresos (planes premium)
- 🏆 Ventaja competitiva significativa
- 📊 Datos valiosos para análisis
- ⭐ Mejora de satisfacción del cliente

**Recomendación:** Proceder con la implementación inmediatamente, comenzando con modelos Teltonika y TKSTAR Pro para prueba piloto con clientes seleccionados.
