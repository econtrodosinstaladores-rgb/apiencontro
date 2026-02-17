import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParticipantesController } from './participantes.controller';
import { ParticipantesService } from './participantes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
  exports: [ParticipantesService],
})
export class ParticipantesModule {}
