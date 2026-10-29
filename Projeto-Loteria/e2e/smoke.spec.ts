import { expect, test } from '@playwright/test';

async function aceitarResponsabilidade(page: any) {
  const modal = page.locator('#responsabilidade-modal');
  if (await modal.isVisible().catch(() => false)) {
    await page.getByLabel(/Li e aceito/i).check();
    await page.getByRole('button', { name: /Aceitar e continuar/i }).click();
  }
}

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await aceitarResponsabilidade(page);
  await expect(page).toHaveTitle(/Jogo na Hora/);
  await expect(page.getByRole('heading', { name: /Sorteie sua combinação/i })).toBeVisible();
});

test('estatisticas dynamic route loads', async ({ page }) => {
  await page.goto('/estatisticas/mega-sena');
  await aceitarResponsabilidade(page);
  await expect(page.getByRole('heading', { name: /Estatísticas — Mega-Sena/i })).toBeVisible();
});
