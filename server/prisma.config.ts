/**
 * ============================================================
 * prisma.config.ts — Configuração do Prisma CLI (v7+)
 * ============================================================
 *
 * No Prisma 7, a URL de conexão com o banco de dados é
 * configurada aqui ao invés de no schema.prisma.
 *
 * O dotenv é carregado manualmente porque o Prisma CLI
 * v7 não carrega automaticamente o .env.
 *
 * Para Supabase, usamos:
 * - DATABASE_URL: Conexão via pgBouncer (pooling) — porta 6543
 * - DIRECT_URL: Conexão direta — porta 5432 (migrations)
 * ============================================================
 */

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'node ./prisma/seed.js',
  },
});
