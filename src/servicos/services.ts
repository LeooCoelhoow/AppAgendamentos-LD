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
    id: '1',
    name: 'Brow Lamination',
    description: 'Alinhamento e fixação dos fios da sobrancelha para um visual com mais definição e volume.',
    price: 110.0,
    duration: 60,
    icon: '✨',
  },
  {
    id: '2',
    name: 'Design de Sobrancelha',
    description: 'Design de Sobrancelha com pinça para realçar o formato do rosto.',
    price: 35.0,
    duration: 30,
    icon: '🖌️',
  },
  {
    id: '3',
    name: 'Lash Lifting',
    description: 'Curvatura e tintura dos cílios naturais para um olhar marcante e duradouro.',
    price: 120.0,
    duration: 75,
    icon: '👁️',
  },
  // {
  //   id: '4',
  //   name: 'Micropigmentação',
  //   description: 'Técnica de pigmentação semipermanente para sobrancelhas com efeito fio a fio.',
  //   price: 350.0,
  //   duration: 120,
  //   icon: '💎',
  // },
  // {
  //   id: '5',
  //   name: 'Extensão de Cílios',
  //   description: 'Aplicação de fios individuais ou em volume para cílios mais longos e volumosos.',
  //   price: 200.0,
  //   duration: 90,
  //   icon: '🌸',
  // },
  {
    id: '6',
    name: 'Henna de Sobrancelha',
    description: 'Coloração natural com henna para preencher e definir as sobrancelhas.',
    price: 45.0,
    duration: 40,
    icon: '🎨',
  },
  {
    id: '7',
    name: 'Tintura de Sobrancelha',
    description: 'Coloração com natural dos fios com tintura para realçar e definir as sobrancelhas.',
    price: 50.0,
    duration: 40,
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
