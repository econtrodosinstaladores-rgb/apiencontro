import { PartialType } from '@nestjs/mapped-types';
import { CreateParticipanteDto } from './create-participante.dto';

// Se o erro for aqui, o TS não está conseguindo "ler" a classe CreateParticipanteDto
export class UpdateParticipanteDto extends PartialType(CreateParticipanteDto) {}
