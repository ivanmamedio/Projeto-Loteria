/**
 * Calibração opcional de probabilidades (leave-one-out cross-validation).
 */

import type { ModalidadeRegras } from '../rules';
import { frequenciaDezenas } from '../stats';
import { type CalibrationResult, calibrationTest } from '../validation';

export function runCalibration(
  windowed: number[][],
  modalidade: ModalidadeRegras,
  games: { dezenas: number[] }[],
): CalibrationResult | undefined {
  if (windowed.length === 0 || games.length === 0) return undefined;

  const predicoes: number[] = [];
  const observacoes: number[] = [];

  // Leave-one-out cross-validation no histórico disponível
  for (let i = Math.max(0, windowed.length - 20); i < windowed.length; i++) {
    const concursoAtual = windowed[i];
    if (!concursoAtual) continue;
    const historicoTreino = windowed.slice(0, i);

    if (historicoTreino.length < 10) continue;

    const freqTreino = frequenciaDezenas(historicoTreino);
    const totalSorteios = historicoTreino.length;
    const dezenasSorteadas = modalidade.dezenasSorteadas;

    // Probabilidade estimada para cada dezena do concurso atual
    for (const dezena of concursoAtual) {
      const freq = freqTreino[dezena] ?? 0;
      const prob = Math.min(1, (freq + 1) / (totalSorteios + modalidade.universo)); // Laplace smoothing
      predicoes.push(prob);
      observacoes.push(1); // Acertou (estava no concurso)
    }

    // Adicionar dezenas NÃO sorteadas como negativos (amostragem)
    const todasDezenas = Array.from({ length: modalidade.universo }, (_, i) =>
      modalidade.id === 'lotomania' ? i : i + 1,
    );
    const naoSorteadas = todasDezenas.filter((d) => !concursoAtual.includes(d));
    const negativosAmostra = naoSorteadas.slice(0, dezenasSorteadas);
    for (const dezena of negativosAmostra) {
      const freq = freqTreino[dezena] ?? 0;
      const prob = Math.min(1, (freq + 1) / (totalSorteios + modalidade.universo));
      predicoes.push(prob);
      observacoes.push(0); // Não acertou
    }
  }

  if (predicoes.length === 0) return undefined;

  return calibrationTest(predicoes, observacoes);
}
