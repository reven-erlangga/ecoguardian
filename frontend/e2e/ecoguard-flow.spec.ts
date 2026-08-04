import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';
const GRAPHQL_URL = 'http://localhost:4000/graphql';

test.describe('Auth Flow', () => {
  test('Login flow works', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.fill('input[type="email"]', 'test@ecoguard.dev');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button:has-text("Masuk")');
    // Should redirect to dashboard on success
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    // Profile card visible in sidebar
    await expect(page.getByText('test@ecoguard.dev')).toBeVisible();
  });

  test('Logout clears session', async ({ page }) => {
    await page.goto(BASE_URL + '/login');
    await page.fill('input[type="email"]', 'test@ecoguard.dev');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button:has-text("Masuk")');
    await page.waitForURL(/\/dashboard/);
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Ecoguard Full Flow', () => {

  test('1. Landing redirects to dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('2. Register user', async ({ page }) => {
    const email = `e2e-${Date.now()}@ecoguard.app`;
    await page.goto(BASE_URL + '/register');
    await expect(page.getByRole('heading', { name: 'Buat Akun' })).toBeVisible();
    await page.fill('input[type="email"]', email);
    await page.fill('#reg-username', 'e2etest');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button:has-text("Daftar")');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('3. Dashboard shows stats cards', async ({ page }) => {
    await page.goto(BASE_URL + '/dashboard');
    await page.waitForSelector('text=Pohon Tumbang', { timeout: 10000 });
    await expect(page.getByRole('main').getByText('Tweets')).toBeVisible();
    await expect(page.getByRole('main').getByText('Pohon Tumbang')).toBeVisible();
  });

  test('4. Sidebar navigation works', async ({ page }) => {
    await page.goto(BASE_URL + '/dashboard');
    await page.getByRole('link', { name: 'Tweets' }).click();
    await expect(page).toHaveURL(/\/tweets/);
    await page.getByRole('link', { name: 'Blockchain' }).click();
    await expect(page).toHaveURL(/\/blockchain/);
    await page.getByRole('link', { name: 'Notifikasi' }).click();
    await expect(page).toHaveURL(/\/notifications/);
  });

  test('5. Tweets filter visible', async ({ page }) => {
    await page.goto(BASE_URL + '/tweets');
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });

  test('6. Blockchain links to simulasi', async ({ page }) => {
    await page.goto(BASE_URL + '/blockchain');
    await expect(page.getByRole('heading', { name: 'Blockchain', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buka Simulasi' })).toBeVisible();
  });

  test('7. Simulation runs end-to-end', async ({ page }) => {
    await page.goto(BASE_URL + '/simulasi');
    await expect(page.getByText('Simulasi Flow Ecoguard')).toBeVisible();
    await page.getByRole('button', { name: 'Jalankan Simulasi' }).click();
    await expect(page.getByText('Simulasi berhasil')).toBeVisible({ timeout: 35000 });
    await expect(page.getByText('valid=true')).toBeVisible();
  });

  test('8. Ingest tweet via API', async () => {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { twitter_TwitterService_IngestTweet(input: {
          tweet_id: "api-${Date.now()}", text: "testing api",
          author: "api", author_username: "API",
          media_urls: ["https://picsum.photos/seed/api/400/300"]
        }) { id } }`
      })
    });
    const data = await res.json();
    expect(data.data?.twitter_TwitterService_IngestTweet?.id).toBeTruthy();
  });

  test('9. Record blockchain resolution', async () => {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { blockchain_BlockchainService_RecordResolution(input: {
          tweet_id: "api-resolve-${Date.now()}", admin_id: "admin_api",
          notes: "Selesai via automation test",
          resolved_image_hash: "sha256:apitest"
        }) { success block { index } } }`
      })
    });
    const data = await res.json();
    expect(data.data?.blockchain_BlockchainService_RecordResolution?.success).toBe(true);
  });

});