import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ParticipantesModule } from './participantes/participantes.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ParticipantesModule,
    UsersModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        family: 4,
        connectionTimeout: 10000,
      } as any,
      defaults: {
        from: `"1º Encontro de Refrigeristas" <${process.env.EMAIL_USER}>`,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
