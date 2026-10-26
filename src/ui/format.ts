/**
 * Formatação pt-BR para a UI.
 */

export function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatNumber(value: number | bigint, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('pt-BR', options).format(value);
}

export function formatCurrency(value: number | bigint): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 2 }).format(
    value,
  );
}
