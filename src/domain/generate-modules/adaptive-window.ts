/**
 * Janela adaptativa via rolling window cross-validation.
 */

import type { ModalidadeRegras } from '../rules';
import { frequenciaDezenas } from '../stats';

export function encontrarJanelaOtima(concursos: number[][], modalidade: ModalidadeRegras): number {
  const totalConcursos = concursos.length;
  if (totalConcursos < 50) return 100; // Histórico insuficiente

  // Candidatos de janela: de 20 a min(500, total-10), passo adaptativo
  const maxJanela = Math.min(500, totalConcursos - 10);
  const candidatos: number[] = [];
  for (let w = 20; w <= maxJanela; w += w < 100 ? 10 : w < 200 ? 25 : 50) {
    candidatos.push(w);
  }
  // Adicionar alguns valores fixos importantes
  candidatos.push(50, 100, 200, 300);
  // Remover duplicatas e ordenar
  const janelasTestadas = [...new Set(candidatos)]
    .filter((w) => w <= maxJanela)
    .sort((a, b) => a - b);

  let melhorJanela = 100;
  let melhorLogLikelihood = Number.NEGATIVE_INFINITY;

  // Rolling window cross-validation: usar últimos 20 concursos como teste
  const nTeste = Math.min(20, Math.floor(totalConcursos * 0.1));
  const inicioTeste = totalConcursos - nTeste;

  for (const janela of janelasTestadas) {
    if (janela >= inicioTeste) continue; // Janela muito grande para CV

    let logLikelihoodTotal = 0;
    let nPredicoes = 0;

    // Leave-one-out nos últimos nTeste concursos
    for (let i = inicioTeste; i < totalConcursos; i++) {
      const concursoAtual = concursos[i];
      if (!concursoAtual) continue;
      const historicoTreino = concursos.slice(Math.max(0, i - janela), i);

      if (historicoTreino.length < 10) continue;

      // Calcular frequências no treino
      const freqTreino = frequenciaDezenas(historicoTreino);
      const totalSorteios = historicoTreino.length;
      const universo = modalidade.universo;
      const dezenasSorteadas = modalidade.dezenasSorteadas;

      // Laplace smoothing para evitar probabilidade zero
      const alpha = 1;
      const denom = totalSorteios + universo * alpha;

      // Log-likelihood do concurso atual
      let llConcurso = 0;
      for (const dezena of concursoAtual) {
        const freq = freqTreino[dezena] ?? 0;
        const prob = Math.max(1e-10, (freq + alpha) / denom);
        llConcurso += Math.log(prob);
      }

      // Adicionar dezenas não sorteadas (amostragem para eficiência)
      const todasDezenas = Array.from({ length: universo }, (_, i) =>
        modalidade.id === 'lotomania' ? i : i + 1,
      );
      const naoSorteadas = todasDezenas.filter((d) => !concursoAtual.includes(d));
      const amostraNegativos = naoSorteadas.slice(0, dezenasSorteadas);
      for (const dezena of amostraNegativos) {
        const freq = freqTreino[dezena] ?? 0;
        const probNao = 1 - Math.max(1e-10, (freq + alpha) / denom);
        llConcurso += Math.log(Math.max(1e-10, probNao));
      }

      logLikelihoodTotal += llConcurso;
      nPredicoes++;
    }

    if (nPredicoes > 0) {
      const mediaLL = logLikelihoodTotal / nPredicoes;
      if (mediaLL > melhorLogLikelihood) {
        melhorLogLikelihood = mediaLL;
        melhorJanela = janela;
      }
    }
  }

  // Log para debug (apenas em desenvolvimento)
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log(
      `[adaptiveWindow] Modalidade: ${modalidade.id}, Janela ótima: ${melhorJanela} (LL: ${melhorLogLikelihood.toFixed(4)})`,
    );
  }

  return melhorJanela;
}
