/**
 * Filtros de validação de combinações geradas.
 */

import { evitaPadraoCalendario, filtrosEquilibrio, verificaFiltros } from '../filters';
import { patternFilter } from '../patterns';
import type { ModalidadeRegras } from '../rules';

export interface FilterCheckResult {
  passa: boolean;
  soma: number;
  somaQuadrados: number;
  pares: number;
  impares: number;
}

export function createFilterChecker(
  modalidade: ModalidadeRegras,
  filtrosAtivos: boolean,
  evitaCal: boolean,
  windowed: number[][],
) {
  return function passaFiltros(dezenas: number[]): boolean {
    // Calendário é avaliado independentemente de E3 (exceto Lotofácil e Lotomania onde universo ≤ 31)
    const universo = modalidade.universo;
    if (evitaCal && universo > 31 && !evitaPadraoCalendario(dezenas)) return false;

    if (!filtrosAtivos) return true;

    const filtros = filtrosEquilibrio(modalidade.universo, dezenas.length);
    const res = verificaFiltros(dezenas, modalidade.universo, filtros);
    if (!res.passa) return false;

    const numFaixas = Math.max(1, Math.ceil(modalidade.universo / 10));
    const maxPorFaixa = Math.ceil(dezenas.length / numFaixas) + 1;
    const contagemFaixa = new Map<number, number>();
    const minUniv = modalidade.id === 'lotomania' ? 0 : 1;
    for (const d of dezenas) {
      const faixa = Math.floor((d - minUniv) / 10);
      contagemFaixa.set(faixa, (contagemFaixa.get(faixa) ?? 0) + 1);
    }
    for (const c of contagemFaixa.values()) {
      if (c > maxPorFaixa) return false;
    }

    // Filtros de padrões (gaps/entropia) aplicados no back quando filtros ativos
    if (filtrosAtivos && !patternFilter(dezenas, modalidade.universo, windowed)) return false;

    return true;
  };
}
