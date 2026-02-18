import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
