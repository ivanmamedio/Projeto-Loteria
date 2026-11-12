import type { APIRoute } from 'astro';
import { backtestWalkForward } from '../../domain/backtest';
import { loadData } from '../../ui/load-data';

const MODALIDADES = ['mega-sena', 'lotofacil', 'quina', 'lotomania'] as const;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { modalidade, estrategia, janela = 100, nTestes = 50, filtros = true } = body;

    if (!modalidade || !MODALIDADES.includes(modalidade)) {
      return new Response(
        JSON.stringify({
          erro: 'Parâmetro "modalidade" obrigatório. Valores: mega-sena, lotofacil, quina, lotomania',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!estrategia) {
      return new Response(JSON.stringify({ erro: 'Parâmetro "estrategia" obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Carregar histórico do JSON público
    const baseClient = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/`;
    const res = await loadData<{ concursos: { dezenas: number[]; data?: string }[] }>(
      `${baseClient}data/${modalidade}.json`,
    );

    if (!res.ok || !res.data?.concursos) {
      return new Response(JSON.stringify({ erro: 'Falha ao carregar dados da modalidade' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const historico = res.data.concursos.map((c) => c.dezenas);

    // Mapear string de estratégia para array
    let estrategiaArray: string[];
    if (estrategia === 'E0') estrategiaArray = ['E0'];
    else if (estrategia === 'E1') estrategiaArray = ['E1'];
    else if (estrategia === 'E2') estrategiaArray = ['E2'];
    else if (estrategia === 'E3') estrategiaArray = ['E3'];
    else if (estrategia === 'E4') estrategiaArray = ['E4'];
    else if (estrategia === 'combinado') estrategiaArray = ['E1', 'E3', 'E4'];
    else if (Array.isArray(estrategia)) estrategiaArray = estrategia;
    else estrategiaArray = ['E1', 'E3', 'E4'];

    // Executar backtest walk-forward
    const resultado = backtestWalkForward(
      historico,
      modalidade as (typeof MODALIDADES)[number],
      janela,
      Math.min(nTestes, 500), // limitar a 500
      estrategiaArray,
      42, // seed fixa para reprodutibilidade
    );

    return new Response(
      JSON.stringify({
        success: true,
        modalidade,
        estrategia: estrategiaArray.join(','),
        janela,
        nTestes: resultado.nTestes,
        timestamp: new Date().toISOString(),
        mediaAcertosObservada: resultado.mediaAcertosObservada,
        mediaAcertosEsperada: resultado.mediaAcertosEsperada,
        desvioAcertosObservado: Math.sqrt(
          Object.entries(resultado.acertosObservados).reduce((soma, [k, v]) => {
            const diff = Number(k) - resultado.mediaAcertosObservada;
            return soma + diff * diff * v;
          }, 0) / (resultado.nTestes - 1 || 1),
        ),
        acertosObservados: resultado.acertosObservados,
        acertosEsperados: resultado.acertosEsperados,
        quiQuadrado: resultado.quiQuadrado,
        taxaAceitacaoMedia: resultado.taxaAceitacaoMedia,
        estrategiaUsada: resultado.estrategiaUsada,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        erro: 'Erro interno ao processar backtest',
        detalhe: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
