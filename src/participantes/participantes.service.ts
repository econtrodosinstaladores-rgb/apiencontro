import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';

@Injectable()
export class ParticipantesService {
  private transporter;

  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // "true" obriga a usar conexão segura na porta 465
      auth: {
        user: process.env.EMAIL_USER, // Busca a variável lá da Render/env
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async create(data: CreateParticipanteDto) {
    try {
      const participante = await this.prisma.participante.create({
        data: {
          ...data,
          diasPresenca: JSON.stringify(data.diasPresenca),
        },
      });
      try {
        await this.transporter.sendMail({
          from: `"Encontro de Instaladores" <${process.env.EMAIL_USER}>`,
          to: participante.email,
          subject: 'Inscrição Confirmada! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Olá, ${participante.nome}!</h2>
              <p>Sua inscrição no <strong>1º Encontro de Instaladores do MT</strong> foi confirmada com sucesso.</p>
              <p>Ficamos muito felizes com a sua participação. Em breve, enviaremos mais detalhes e a programação completa do evento.</p>
              <br/>
              <p>Um abraço,<br/>Equipe 1º Encontro de Instaladores do MT</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(
          'Aviso: Cadastro concluído, mas o e-mail falhou.',
          emailError,
        );
      }

      return participante;
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
