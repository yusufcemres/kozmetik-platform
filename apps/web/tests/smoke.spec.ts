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

  test('/blog list renders', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('/ai-arama form renders', async ({ page }) => {
    await page.goto('/ai-arama');
    await expect(page.locator('input[placeholder*="arıyorsun" i]')).toBeVisible();
  });

  test('/uzmanlar directory renders', async ({ page }) => {
    await page.goto('/uzmanlar');
    await expect(page.getByRole('heading', { name: /tıbbi|danışma/i })).toBeVisible();
  });

  test('/karsilastir compare page', async ({ page }) => {
    await page.goto('/karsilastir');
    await expect(page.locator('body')).toBeVisible();
  });
});
