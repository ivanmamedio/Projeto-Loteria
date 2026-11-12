import type { APIRoute } from 'astro';
import { gerarRelatorioValidacao } from '../../domain/validation';
import { loadData } from '../../ui/load-data';

const MODALIDADES = ['mega-sena', 'lotofacil', 'quina', 'lotomania'] as const;
type ModalidadeId = (typeof MODALIDADES)[number];

export const GET: APIRoute = async ({ url }) => {
  const modalidade = url.searchParams.get('modalidade');

  if (!modalidade || !MODALIDADES.includes(modalidade as ModalidadeId)) {
    return new Response(
      JSON.stringify({
        erro: 'Parâmetro "modalidade" obrigatório. Valores: mega-sena, lotofacil, quina, lotomania',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
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

    // Rodar validação completa (server-side)
    const relatorio = gerarRelatorioValidacao(
      historico,
      modalidade as (typeof MODALIDADES)[number],
    );

    return new Response(
      JSON.stringify({
        success: true,
        modalidade,
        timestamp: new Date().toISOString(),
        resumo: relatorio.resumo,
        detalhes: {
          runsTest: Object.fromEntries(
            Object.entries(relatorio.runsTest).map(([k, v]) => [
              k,
              {
                runs: v.runs,
                expected: v.expected,
                z: v.z,
                pValue: v.pValue,
                interpretacao: v.interpretacao,
              },
            ]),
          ),
          autocorrelacao: Object.fromEntries(
            Object.entries(relatorio.autocorrelacao).map(([k, v]) => [
              k,
              {
                interpretacao: v.interpretacao,
                significantLags: v.significantLags,
              },
            ]),
          ),
          ksTest: Object.fromEntries(
            Object.entries(relatorio.ksTestAtrasos).map(([k, v]) => [
              k,
              {
                ksStatistic: v.ksStatistic,
                criticalValue: v.criticalValue,
                pValue: v.pValue,
                interpretacao: v.interpretacao,
              },
            ]),
          ),
          calibracao: {
            ece: relatorio.calibracao.ece,
            brierScore: relatorio.calibracao.brierScore,
            interpretacao: relatorio.calibracao.interpretacao,
          },
          bootstrapMediaAtraso: relatorio.bootstrapMediaAtraso,
        },
        veredito: relatorio.interpretacaoGeral,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        erro: 'Erro interno ao processar validação',
        detalhe: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
