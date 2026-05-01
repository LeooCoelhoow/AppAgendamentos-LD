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
 * ============================================================
 */

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrate: {
    schema: './prisma/schema.prisma',
  },
});
