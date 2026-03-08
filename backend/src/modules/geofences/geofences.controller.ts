import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GeofencesService } from './services/geofences.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';

@Controller('geofences')
@UseGuards(JwtAuthGuard)
export class GeofencesController {
  constructor(private readonly geofencesService: GeofencesService) {}

  /**
   * Create a new geofence
   */
  @Post()
  async create(@Request() req, @Body() dto: CreateGeofenceDto) {
    return this.geofencesService.create(req.user.userId, dto);
  }

  /**
   * Get all geofences for current user
   */
  @Get()
  async findAll(@Request() req) {
    return this.geofencesService.findAllByUser(req.user.userId);
  }

  /**
   * Get a specific geofence
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.geofencesService.findOne(id, req.user.userId);
  }

  /**
   * Get geofence states for a specific device
   */
  @Get('device/:deviceId/states')
  async getDeviceStates(
    @Request() req,
    @Param('deviceId') deviceId: string,
  ) {
    return this.geofencesService.getDeviceGeofenceStates(
      req.user.userId,
      deviceId,
    );
  }

  /**
   * Update a geofence
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceDto,
  ) {
    return this.geofencesService.update(id, req.user.userId, dto);
  }

  /**
   * Delete a geofence
   */
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    await this.geofencesService.delete(id, req.user.userId);
    return { message: 'Geofence deleted successfully' };
  }

  /**
   * Test if a point is inside a specific geofence
   */
  @Post(':id/test')
  async testPoint(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    const geofence = await this.geofencesService.findOne(id, req.user.userId);
    const result = this.geofencesService.isPointInGeofence(
      body.latitude,
      body.longitude,
      geofence,
    );
    return {
      geofenceName: geofence.name,
      ...result,
    };
  }
}
