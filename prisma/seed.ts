import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seed do banco de dados...');

  // 1. Criptografar a senha padrão
  const passwordRaw = '123456'; // Senha inicial
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordRaw, salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@encontro.com.br' },
    update: {}, // Se já existe, não altera nada
    create: {
      email: 'admin@encontro.com.br',
      name: 'Administrador Master',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Usuário Admin criado/verificado: ${admin.email}`);
  console.log(`🔑 Senha inicial: ${passwordRaw}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
