import { chromium } from '@playwright/test';
import path from 'path';

const URL = 'http://localhost:4321';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[PAGE] ${err.message}`));

  // Login
  await page.goto(`${URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Fill login form
  await page.fill('input[type="email"]', 'sample@mail.com');
  await page.fill('input[type="password"]', 'sample1234');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log('=== LOGIN OK, now going to issue detail ===');
  
  // Go to issue detail
  await page.goto(`${URL}/issues/da13e3ec-d941-404c-9fb7-554a6be98e68`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== CONSOLE ERRORS ===');
  errors.forEach(e => console.log(e));
  
  if (errors.length === 0) console.log('No errors found.');

  await browser.close();
}

main().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
