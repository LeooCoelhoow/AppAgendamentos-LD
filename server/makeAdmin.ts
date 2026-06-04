import { prisma } from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('Nenhum usuário encontrado no banco!');
    return;
  }
  
  // Atualiza todos os usuários existentes para ADMIN
  const updated = await prisma.user.updateMany({
    data: { role: 'ADMIN' },
  });
  
  console.log(`Sucesso: ${updated.count} usuário(s) foram atualizados para a permissão de ADMIN no banco de dados!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
