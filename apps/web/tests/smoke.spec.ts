import { test, expect } from '@playwright/test';

test.describe('REVELA smoke', () => {
  test('home loads with hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/REVELA|Kozmetik/i);
    await expect(page.locator('main, body')).toBeVisible();
  });

  test('/urunler list renders', async ({ page }) => {
    await page.goto('/urunler');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/tara page loads', async ({ page }) => {
    await page.goto('/tara');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/ara search renders query results area', async ({ page }) => {
    await page.goto('/ara?q=cerave');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/giris magic link form', async ({ page }) => {
    await page.goto('/giris');
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });
});
