import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module'; // Importante importar o PrismaModule
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
