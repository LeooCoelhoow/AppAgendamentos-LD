/**
 * ============================================================
 * data/services.ts — Dados Mock dos Serviços de Beleza
 * ============================================================
 *
 * Este arquivo contém a lista de serviços oferecidos no app.
 * Em um cenário real, esses dados viriam de uma API/backend.
 * Por enquanto, usamos dados mock para o MVP.
 *
 * Cada serviço segue a interface `Service` definida em types/.
 * ============================================================
 */

import { Service } from '../types';

/**
 * Lista completa de serviços de beleza disponíveis
 *
 * Cada serviço inclui:
 * - id: identificador único
 * - name: nome do procedimento
 * - description: explicação breve
 * - price: valor em R$
 * - duration: tempo em minutos
 * - icon: emoji representativo
 */
export const services: Service[] = [
  {
    id: 'b09852b9-8bf0-4cc8-9b60-54905fd8e951',
    name: 'Brow Lamination',
    description: 'Alinhamento e fixação dos fios da sobrancelha para um visual com mais definição e volume.',
    price: 110.0,
    duration: 60,
    icon: '✨',
  },
  {
    id: 'd2b1ead2-702b-4b68-bc03-e382c4785778',
    name: 'Design de Sobrancelha',
    description: 'Design de Sobrancelha com pinça para realçar o formato do rosto.',
    price: 35.0,
    duration: 30,
    icon: '🖌️',
  },
  {
    id: '87191229-f9c0-4d86-a571-dec6b6512fe3',
    name: 'Lash Lifting',
    description: 'Curvatura e tintura dos cílios naturais para um olhar marcante e duradouro.',
    price: 120.0,
    duration: 60,
    icon: '👁️',
  },
  {
    id: '601d414d-32c6-4841-8428-35acfb71e647',
    name: 'Combo Soft Glam',
    description: 'Design de Sobrancelha + Lash Lifting',
    price: 140.0,
    duration: 90,
    icon: '🎀',
  },
  {
    id: '29f1ce8f-0efd-4298-9c3d-6c5c81b65aaa',
    name: 'Combo Duo Lift Perfeito',
    description: 'Brow Lamination + Lash Lifting',
    price: 199.90,
    duration: 120,
    icon: '💎',
  },
  {
    id: '45c741aa-2fb3-49d2-aba2-60644d247e23',
    name: 'Henna de Sobrancelha',
    description: 'Coloração natural com henna para preencher e definir as sobrancelhas.',
    price: 45.0,
    duration: 60,
    icon: '🎨',
  },
  {
    id: '81f259b9-4bb1-4e7b-bdab-eb42e54486e4',
    name: 'Tintura de Sobrancelha',
    description: 'Coloração com natural dos fios com tintura para realçar e definir as sobrancelhas.',
    price: 50.0,
    duration: 60,
    icon: '🎨',
  },
];

/**
 * Função auxiliar para buscar um serviço pelo seu ID
 *
 * @param id - Identificador do serviço
 * @returns O serviço encontrado ou undefined
 */
export const getServiceById = (id: string): Service | undefined => {
  return services.find((service) => service.id === id);
};
