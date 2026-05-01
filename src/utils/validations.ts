/**
 * ============================================================
 * utils/validations.ts — Schemas de Validação com Zod
 * ============================================================
 *
 * Define os schemas de validação para os formulários de
 * Login e Cadastro. Utiliza a biblioteca Zod para validação
 * tipada e mensagens de erro em português.
 *
 * Schemas:
 *   - loginSchema: Valida e-mail + senha
 *   - registerSchema: Valida nome + e-mail + telefone +
 *     senha + confirmação de senha
 *
 * As mensagens de erro são customizadas em PT-BR para
 * exibição direta nos inputs do formulário.
 *
 * Uso:
 *   import { loginSchema, registerSchema } from '../utils/validations';
 *
 *   const result = loginSchema.safeParse({ email, password });
 *   if (!result.success) {
 *     // result.error.formErrors.fieldErrors
 *   }
 * ============================================================
 */

import { z } from 'zod';

/**
 * Schema de validação para o formulário de Login
 *
 * Campos:
 *   - email: Obrigatório, formato de e-mail válido
 *   - password: Obrigatório, mínimo 6 caracteres
 */
export const loginSchema = z.object({
  /** E-mail do usuário */
  email: z
    .string({ required_error: 'O e-mail é obrigatório.' })
    .min(1, 'O e-mail é obrigatório.')
    .email('Insira um e-mail válido.'),

  /** Senha do usuário */
  password: z
    .string({ required_error: 'A senha é obrigatória.' })
    .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

/**
 * Schema de validação para o formulário de Cadastro
 *
 * Campos:
 *   - name: Obrigatório, mínimo 2 caracteres
 *   - email: Obrigatório, formato de e-mail válido
 *   - phone: Obrigatório, formato de telefone BR (XX) XXXXX-XXXX
 *   - password: Obrigatório, mínimo 6 caracteres
 *   - confirmPassword: Obrigatório, deve ser igual à senha
 *
 * Usa .refine() para comparar senha e confirmação.
 */
export const registerSchema = z
  .object({
    /** Nome completo do usuário */
    name: z
      .string({ required_error: 'O nome é obrigatório.' })
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),

    /** E-mail do usuário */
    email: z
      .string({ required_error: 'O e-mail é obrigatório.' })
      .min(1, 'O e-mail é obrigatório.')
      .email('Insira um e-mail válido.'),

    /** Telefone no formato brasileiro */
    phone: z
      .string({ required_error: 'O telefone é obrigatório.' })
      .min(1, 'O telefone é obrigatório.')
      .regex(
        /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
        'Insira um telefone válido. Ex: (11) 99999-9999'
      ),

    /** Senha */
    password: z
      .string({ required_error: 'A senha é obrigatória.' })
      .min(6, 'A senha deve ter pelo menos 6 caracteres.'),

    /** Confirmação da senha */
    confirmPassword: z
      .string({ required_error: 'Confirme sua senha.' })
      .min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'], // Erro aparece no campo confirmPassword
  });

/** Tipagem inferida do schema de login */
export type LoginData = z.infer<typeof loginSchema>;

/** Tipagem inferida do schema de cadastro */
export type RegisterData = z.infer<typeof registerSchema>;
