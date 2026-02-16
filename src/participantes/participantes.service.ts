import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParticipantesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.participante.create({
      data: {
        ...data,
        diasPresenca: Array.isArray(data.diasPresenca)
          ? data.diasPresenca.join(', ')
          : data.diasPresenca,
      },
    });
  }

  async findAll() {
    const participantes = await this.prisma.participante.findMany();
    return participantes.map((p) => ({
      ...p,
      diasPresenca: p.diasPresenca.split(', '),
    }));
  }
}
