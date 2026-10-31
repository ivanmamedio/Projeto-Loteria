import { expect, test } from '@playwright/test';

async function aceitarResponsabilidade(page: any) {
  const modal = page.locator('#responsabilidade-modal');
  if (await modal.isVisible().catch(() => false)) {
    await page.getByLabel(/Li e aceito/i).check();
    await page.getByRole('button', { name: /Aceitar e continuar/i }).click();
  }
}

test('home generates 3 games', async ({ page }) => {
  await page.goto('/Projeto-Loteria/');
  await aceitarResponsabilidade(page);
  await page.getByRole('button', { name: /Gerar 3 jogos/i }).click();
  const results = page.locator('#resultado .game-card');
  await expect(results).toHaveCount(3);
});

test('generated games are distinct', async ({ page }) => {
  await page.goto('/Projeto-Loteria/');
  await aceitarResponsabilidade(page);
  await page.getByRole('button', { name: /Gerar 3 jogos/i }).click();
  const results = page.locator('#resultado .game-card');
  await expect(results).toHaveCount(3);
  const texts = await results.allTextContents();
  expect(new Set(texts.map((t) => t.trim())).size).toBe(3);
  // no extra assertion
});

test('estatisticas shows qui-quadrado', async ({ page }) => {
  await page.goto('/Projeto-Loteria/estatisticas/mega-sena');
  await aceitarResponsabilidade(page);
  await expect(page.getByText(/χ²/)).toBeVisible();
});

test('estatisticas shows janela recente', async ({ page }) => {
  await page.goto('/Projeto-Loteria/estatisticas/lotofacil');
  await aceitarResponsabilidade(page);
  await expect(page.getByText(/Janela recente:/i)).toBeVisible();
});

test('filter flow generates games with meta', async ({ page }) => {
  await page.goto('/Projeto-Loteria/');
  await aceitarResponsabilidade(page);
  await page.selectOption('#modalidade', 'quina');
  await page.selectOption('#estrategia', 'E3');
  await page.check('#filtros');
  await page.fill('#quantidade', '2');
  await page.click('#btn-gerar');
  const results = page.locator('#resultado .game-card');
  await expect(results).toHaveCount(2);
  await expect(page.locator('#meta')).toContainText(/Taxa de aceitação/);
  const texts = await results.allTextContents();
  for (const text of texts) {
    expect(text.trim().length).toBeGreaterThan(0);
  }
});

test('diversify flow generates distinct games', async ({ page }) => {
  await page.goto('/Projeto-Loteria/');
  await aceitarResponsabilidade(page);
  await page.selectOption('#estrategia', 'combinado');
  await page.check('#diversificar');
  await page.fill('#quantidade', '3');
  await page.click('#btn-gerar');
  const results = page.locator('#resultado .game-card');
  await expect(results).toHaveCount(3);
  const texts = await results.allTextContents();
  expect(new Set(texts.map((t) => t.trim())).size).toBe(3);
});
