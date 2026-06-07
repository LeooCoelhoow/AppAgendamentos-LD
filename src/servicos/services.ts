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
    id: '4ea7d669-2079-4a7e-8352-6365248b0114',
    name: 'Brow Lamination',
    description: 'Alinhamento e fixação dos fios da sobrancelha para um visual com mais definição e volume.',
    price: 110.0,
    duration: 60,
    icon: '✨',
  },
  {
    id: '8da10344-3b2b-45b7-b25d-8f07517ff2e3',
    name: 'Design de Sobrancelha',
    description: 'Design de Sobrancelha com pinça para realçar o formato do rosto.',
    price: 35.0,
    duration: 30,
    icon: '🖌️',
  },
  {
    id: '1caae044-aabc-49f9-9c66-a04d091f23fd',
    name: 'Lash Lifting',
    description: 'Curvatura e tintura dos cílios naturais para um olhar marcante e duradouro.',
    price: 120.0,
    duration: 60,
    icon: '👁️',
  },
  {
    id: 'ccb2a759-039c-42d5-bc77-f7ca6162620d',
    name: 'Combo Soft Glam',
    description: 'Design de Sobrancelha + Lash Lifting',
    price: 140.0,
    duration: 90,
    icon: '🎀',
  },
  {
    id: '604d7499-2ff8-402b-8ddf-50d54c179adb',
    name: 'Combo Duo Lift Perfeito',
    description: 'Brow Lamination + Lash Lifting',
    price: 199.90,
    duration: 120,
    icon: '💎',
  },
  {
    id: 'ecde9225-6ae4-4605-bfae-4105136123c3',
    name: 'Henna de Sobrancelha',
    description: 'Design e coloração natural com henna para preencher e definir as sobrancelhas.',
    price: 45.0,
    duration: 60,
    icon: '🎨',
  },
  {
    id: '4a610424-2e2c-42c6-998d-6f319d4e2c86',
    name: 'Tintura de Sobrancelha',
    description: 'Design e coloração natural dos fios com tintura para realçar e definir as sobrancelhas.',
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
