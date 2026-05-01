/**
 * ============================================================
 * lib/prisma.ts — Instância Singleton do Prisma Client (v7)
 * ============================================================
 *
 * Cria e exporta uma única instância do PrismaClient usando
 * o driver adapter do node-postgres (pg).
 *
 * No Prisma 7, é obrigatório usar driver adapters.
 * O adapter PrismaPg recebe um Pool do node-postgres
 * e gerencia as conexões com o banco de dados.
 *
 * Em modo de desenvolvimento, a instância é armazenada no
 * objeto global do Node.js para sobreviver ao hot-reload
 * do nodemon.
 *
 * Uso:
 *   import { prisma } from '../lib/prisma';
 *   const users = await prisma.user.findMany();
 * ============================================================
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

// Declaração global para evitar múltiplas instâncias em dev
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

/**
 * Cria uma nova instância do PrismaClient com adapter pg
 *
 * O Pool gerencia as conexões TCP com o PostgreSQL.
 * O PrismaPg adapta o Pool para o formato esperado pelo Prisma.
 */
function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter } as any);
}

/** Instância única do Prisma Client */
export const prisma: PrismaClient =
  global.cachedPrisma || createPrismaClient();

// Em desenvolvimento, salva no objeto global para reutilizar
if (process.env.NODE_ENV !== 'production') {
  global.cachedPrisma = prisma;
}
