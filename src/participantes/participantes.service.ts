import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';

@Injectable()
export class ParticipantesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateParticipanteDto) {
    try {
      return await this.prisma.participante.create({
        data: {
          ...data,
          diasPresenca: JSON.stringify(data.diasPresenca),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          const field = target.includes('email') ? 'E-mail' : 'Documento';

          throw new ConflictException(
            `${field} já está cadastrado em nosso sistema.`,
          );
        }
      }

      throw new InternalServerErrorException(
        'Erro ao processar inscrição no servidor.',
      );
    }
  }

  async findAll() {
    const participantes = await this.prisma.participante.findMany();
    return participantes.map((p) => ({
      ...p,
      diasPresenca: p.diasPresenca.split(', '),
    }));
  }
}
