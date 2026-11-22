/**
 * Simulated Annealing para otimização de diversificação (E4).
 * Maximiza a distância mínima de Hamming entre jogos selecionados.
 */

export type ProgressCallback = (phase: 'diversifying', progress: number, message: string) => void;

export function simulatedAnnealingDiversificacao(
  candidatos: number[][],
  q: number,
  rng: () => number,
  onProgress?: ProgressCallback,
): number[][] {
  if (candidatos.length <= q) return candidatos;
  if (q <= 0) return [];

  const n = candidatos.length;
  const overlap = (a: number[], b: number[]) => {
    const set = new Set(a);
    return b.filter((x) => set.has(x)).length;
  };

  // Função objetivo: minimizar o overlap máximo (maximin distance)
  const energia = (selecionados: number[][]): number => {
    let maxOverlap = 0;
    let somaOverlap = 0;
    for (let i = 0; i < selecionados.length; i++) {
      for (let j = i + 1; j < selecionados.length; j++) {
        const ov = overlap(selecionados[i]!, selecionados[j]!);
        if (ov > maxOverlap) maxOverlap = ov;
        somaOverlap += ov;
      }
    }
    // Lexicográfico: primeiro maxOverlap, depois somaOverlap
    return maxOverlap * 1000 + somaOverlap;
  };

  // Estado inicial: greedy (primeiro + mais distantes)
  const selecionados: number[] = [0]; // índice do primeiro candidato
  const disponiveis = new Set(Array.from({ length: n }, (_, i) => i));
  disponiveis.delete(0);

  // Adicionar q-1 jogos via greedy como ponto de partida
  while (selecionados.length < q && disponiveis.size > 0) {
    let melhorIdx = -1;
    let melhorEnergia = Number.POSITIVE_INFINITY;
    for (const idx of disponiveis) {
      const teste = [...selecionados, idx].map((i) => candidatos[i]!);
      const e = energia(teste);
      if (e < melhorEnergia) {
        melhorEnergia = e;
        melhorIdx = idx;
      }
    }
    if (melhorIdx >= 0) {
      selecionados.push(melhorIdx);
      disponiveis.delete(melhorIdx);
    } else break;
  }

  let estadoAtual = [...selecionados];
  let energiaAtual = energia(estadoAtual.map((i) => candidatos[i]!));
  let melhorEstado = [...estadoAtual];
  let melhorEnergia = energiaAtual;

  // Parâmetros do Simulated Annealing
  const iteracoesMax = Math.max(1000, q * 200);
  const tempInicial = 10;
  const tempFinal = 0.01;
  const coolingRate = (tempFinal / tempInicial) ** (1 / iteracoesMax);

  let temperatura = tempInicial;

  for (let iter = 0; iter < iteracoesMax; iter++) {
    if (disponiveis.size === 0) break;

    // Vizinho: trocar um jogo selecionado por um não selecionado
    const idxRemover = Math.floor(rng() * estadoAtual.length);
    const idxAdicionar = Array.from(disponiveis)[Math.floor(rng() * disponiveis.size)]!;

    const novoEstado = [...estadoAtual];
    novoEstado[idxRemover] = idxAdicionar;
    const novaEnergia = energia(novoEstado.map((i) => candidatos[i]!));

    const delta = novaEnergia - energiaAtual;

    // Critério de aceitação de Metropolis
    if (delta < 0 || rng() < Math.exp(-delta / temperatura)) {
      // Guardar o índice que será REMOVIDO antes de sobrescrever
      const idxRemovido = estadoAtual[idxRemover]!;
      estadoAtual = novoEstado;
      energiaAtual = novaEnergia;

      // Atualizar disponiveis: remover o que foi adicionado, adicionar o que foi removido
      disponiveis.add(idxRemovido);
      disponiveis.delete(idxAdicionar);

      if (novaEnergia < melhorEnergia) {
        melhorEnergia = novaEnergia;
        melhorEstado = [...estadoAtual];
      }
    }

    // Resfriamento exponencial
    temperatura *= coolingRate;

    // Progress
    if (iter % Math.max(1, Math.floor(iteracoesMax / 20)) === 0) {
      onProgress?.(
        'diversifying',
        Math.round((iter / iteracoesMax) * 100),
        `SA: ${iter}/${iteracoesMax}`,
      );
    }
  }

  return melhorEstado.map((i) => candidatos[i]!);
}
