import type { APIRoute } from 'astro';
import { modalidadePorId } from '../../domain/rules';
import { distribuicaoAcertos } from '../../domain/stats';

const MODALIDADES = ['mega-sena', 'lotofacil', 'quina', 'lotomania'] as const;

export const GET: APIRoute = async ({ url }) => {
  const modalidade = url.searchParams.get('modalidade');
  const n = Number.parseInt(url.searchParams.get('n') || '0');
  const k = Number.parseInt(url.searchParams.get('k') || '0');

  if (!modalidade || !MODALIDADES.includes(modalidade)) {
    return new Response(JSON.stringify({ erro: 'Parâmetro "modalidade" obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!n || !k || n < k) {
    return new Response(JSON.stringify({ erro: 'Parâmetros n e k obrigatórios (n >= k)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const regras = modalidadePorId(modalidade as (typeof MODALIDADES)[number]);
    const universo = regras.universo;
    const dezenasSorteadas = regras.dezenasSorteadas;

    // n = dezenas apostadas, k = dezenas sorteadas (ou usar parâmetros)
    const apostadas = n <= universo ? n : dezenasSorteadas;
    const sorteadas = k <= universo ? k : dezenasSorteadas;

    const dist = distribuicaoAcertos(universo, sorteadas, apostadas);

    return new Response(
      JSON.stringify({
        success: true,
        modalidade,
        universo,
        sorteadas,
        apostadas,
        distribuicao: dist,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        erro: 'Erro interno',
        detalhe: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
