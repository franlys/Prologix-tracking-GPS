import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeofencesController } from './geofences.controller';
import { GeofencesService } from './services/geofences.service';
import { Geofence } from './entities/geofence.entity';
import { GeofenceState } from './entities/geofence-state.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Geofence, GeofenceState]),
  ],
  controllers: [GeofencesController],
  providers: [GeofencesService],
  exports: [GeofencesService],
})
export class GeofencesModule {}
