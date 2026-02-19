import { MailerService } from '@nestjs-modules/mailer';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';

@Injectable()
export class ParticipantesService {
  private resend = new Resend(process.env.RESEND_API_KEY);
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async create(data: CreateParticipanteDto) {
    try {
      const participante = await this.prisma.participante.create({
        data: {
          ...data,
          diasPresenca: JSON.stringify(data.diasPresenca),
        },
      });
      try {
        await this.resend.emails.send({
          from: `"1º Encontro de Refrigeristas" <${process.env.EMAIL_USER}>`,
          to: participante.email,
          subject: 'Inscrição Confirmada! 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">1º Encontro de Refrigeristas</h1>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Olá, ${participante.nome}!</h2>
                <p style="font-size: 16px; line-height: 1.5;">Sua inscrição no <strong>1º Encontro de Refrigeristas do Mato Grosso</strong> foi confirmada com sucesso.</p>
                <p style="font-size: 16px; line-height: 1.5;">Ficamos muito felizes com a sua participação. Em breve, enviaremos mais detalhes e a programação completa do evento para este e-mail.</p>
                <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #1e3a8a; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Dica:</strong> Guarde este e-mail para eventuais consultas sobre a sua inscrição.</p>
                </div>
              </div>
              <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">© 2026 Encontro de Refrigeristas MT. Todos os direitos reservados.</p>
              </div>
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
