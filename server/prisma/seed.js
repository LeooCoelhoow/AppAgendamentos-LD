require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar um usuário ADMIN padrão se não existir
  const adminEmail = 'admin@appagendamentos.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        phone: '(00) 00000-0000',
        password: 'dummy-hash', // Em produção, usar hash real com bcrypt
        role: 'ADMIN',
      },
    });
    console.log(`✅ Usuário ADMIN criado: ${admin.id}`);
  } else {
    console.log(`✅ Usuário ADMIN já existe: ${admin.id}`);
  }

  // Criar serviços padrão se não existirem
  const services = [
    {
      name: 'Brow Lamination',
      description: 'Alinhamento e fixação dos fios da sobrancelha para um visual com mais definição e volume.',
      price: 110.0,
      durationMinutes: 60,
      icon: '✨',
    },
    {
      name: 'Design de Sobrancelha',
      description: 'Design de Sobrancelha com pinça para realçar o formato do rosto.',
      price: 35.0,
      durationMinutes: 30,
      icon: '🖌️',
    },
    {
      name: 'Lash Lifting',
      description: 'Curvadura e tintura dos cílios naturais para um olhar marcante e duradouro.',
      price: 120.0,
      durationMinutes: 75,
      icon: '👁️',
    },
    {
      name: 'Lash Extension',
      description: 'Extensão de cílios com adesivo de qualidade profissional para cílios volumosos e naturais.',
      price: 140.0,
      durationMinutes: 120,
      icon: '✨',
    },
    {
      name: 'Sobrancelha Henna',
      description: 'Coloração natural com henna para destacar o design da sobrancelha.',
      price: 45.0,
      durationMinutes: 40,
      icon: '🎨',
    },
  ];

  for (const serviceData of services) {
    const existingService = await prisma.service.findFirst({
      where: { name: serviceData.name },
    });

    if (!existingService) {
      await prisma.service.create({
        data: serviceData,
      });
      console.log(`✅ Serviço criado: ${serviceData.name}`);
    } else {
      console.log(`✅ Serviço já existe: ${serviceData.name}`);
    }
  }

  // Criar horário de funcionamento padrão (segunda-sábado: 09:00-18:00)
  // dayOfWeek: 0 = Segunda, 1 = Terça, ..., 5 = Sábado (SEM domingo)
  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (let dayOfWeek = 0; dayOfWeek < 6; dayOfWeek++) {
    const existingHours = await prisma.workingHours.findUnique({
      where: {
        userId_dayOfWeek: {
          userId: admin.id,
          dayOfWeek,
        },
      },
    });

    if (!existingHours) {
      await prisma.workingHours.create({
        data: {
          userId: admin.id,
          dayOfWeek,
          startTime: '09:00',
          endTime: '18:00',
          isOpen: true,
        },
      });
      console.log(`✅ Horário criado: ${daysOfWeek[dayOfWeek]} (09:00 - 18:00)`);
    } else {
      console.log(`✅ Horário já existe: ${daysOfWeek[dayOfWeek]}`);
    }
  }

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
