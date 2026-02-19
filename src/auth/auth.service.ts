import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ChangePasswordDto } from '../participantes/dto/change-password.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  // Valida se o usuário existe e a senha está correta
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Gera o Token JWT
  async login(user: any) {
    const payload = { username: user.name, email: user.email, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: user.id,
      name: user.nome,
      email: user.email,
      role: user.role,
    };
  }

  async lostPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Válido por 1 hora

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires },
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://encontrodosinstaladores.com.br';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperação de Senha - 1º Encontro de Refrigeristas',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Recuperação de Senha</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #1e3a8a; margin-top: 0;">Olá!</h2>
              <p style="font-size: 16px; line-height: 1.5;">Você solicitou a redefinição da sua senha de acesso ao painel do <strong>Encontro de Refrigeristas do Mato Grosso</strong>.</p>
              <p style="font-size: 16px; line-height: 1.5;">Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>1 hora</strong>.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Minha Senha</a>
              </div>

              <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #1e3a8a; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #4b5563;">Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha continuará a mesma.</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail de recuperação:', error);
      throw new InternalServerErrorException(
        'Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.',
      );
    }
  }

  async resetPassword(token: string, novaSenha: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }, // Verifica se não expirou
      },
    });

    if (!user) throw new BadRequestException('Token inválido ou expirado');

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
