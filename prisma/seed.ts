import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      department: 'TI',
      phone: '(11) 99999-9999',
    },
  });

  // Criar usuário comum
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuário Comum',
      password: userPassword,
      role: 'USER',
      department: 'RH',
      phone: '(11) 98888-8888',
    },
  });

  // Criar recursos
  const salaReuniao = await prisma.resource.upsert({
    where: { id: '1' },
    update: {},
    create: {
      name: 'Sala de Reunião 1',
      type: 'SALA',
      description: 'Sala de reunião com capacidade para 10 pessoas',
      capacity: 10,
      location: '1º Andar',
    },
  });

  const projetor = await prisma.resource.upsert({
    where: { id: '2' },
    update: {},
    create: {
      name: 'Projetor 1',
      type: 'EQUIPAMENTO',
      description: 'Projetor Full HD',
      capacity: 1,
      location: 'Depósito',
    },
  });

  console.log({ admin, user, salaReuniao, projetor });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 