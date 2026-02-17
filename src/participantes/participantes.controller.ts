import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { ParticipantesService } from './participantes.service';

@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Post()
  create(@Body() createParticipanteDto: CreateParticipanteDto) {
    return this.participantesService.create(createParticipanteDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.participantesService.findAll();
  }
}
