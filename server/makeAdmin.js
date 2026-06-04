require('dotenv/config');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado no banco!');
      return;
    }

    console.log(`Encontrados ${users.length} usuário(s):`);
    users.forEach(u => console.log(`  - ${u.name} (${u.email}) | role: ${u.role}`));

    // Atualiza todos os usuários existentes para ADMIN
    const updated = await prisma.user.updateMany({
      data: { role: 'ADMIN' },
    });

    console.log(`\nSucesso: ${updated.count} usuário(s) foram atualizados para ADMIN!`);

    // Confirma a atualização
    const updatedUsers = await prisma.user.findMany();
    updatedUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) | role: ${u.role}`));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
