import { test, expect } from '@playwright/test';

test.describe('REVELA smoke', () => {
  test('home loads with hero', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/REVELA|Kozmetik/i);
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

  test('/blog/[slug] detail (regression: env \\n bug)', async ({ page }) => {
    const res = await page.goto('/blog/niacinamide-nedir-hangi-cilt-tiplerine-iyi-gelir');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('/urunler/[slug] detail (regression)', async ({ page }) => {
    await page.goto('/urunler');
    const firstProduct = page.locator('a[href^="/urunler/"]').first();
    const href = await firstProduct.getAttribute('href');
    if (href) {
      const res = await page.goto(href);
      expect(res?.status()).toBeLessThan(400);
    }
  });

  test('/icerikler/[slug] detail', async ({ page }) => {
    const res = await page.goto('/icerikler/niacinamide');
    expect(res?.status()).toBeLessThan(400);
  });

  test('/uzmanlar/[slug] detail', async ({ page }) => {
    const res = await page.goto('/uzmanlar/dr-ayse-demir');
    expect(res?.status()).toBeLessThan(400);
  });

  test('/cilt-analizi quiz page', async ({ page }) => {
    await page.goto('/cilt-analizi');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/profilim profile page', async ({ page }) => {
    await page.goto('/profilim');
    await expect(page.locator('body')).toBeVisible();
  });

  test('/sitemap.xml has >1000 URLs (regression: pagination bug)', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    const count = (body.match(/<loc>/g) || []).length;
    expect(count).toBeGreaterThan(1000);
  });

  test('/robots.txt allows crawl + points to sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Allow:\s*\//);
    expect(body).toMatch(/Sitemap:\s*https?:\/\/.*\/sitemap\.xml/);
  });
});
