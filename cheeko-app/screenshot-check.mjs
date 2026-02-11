import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: './screenshots/00-landing.png' });

  // Fill name and navigate to demo
  const nameInput = page.locator('input[type="text"], input[name="name"], input[placeholder*="name" i]').first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('Demo User');
    const startBtn = page.locator('button:has-text("Start"), button:has-text("Continue"), button:has-text("Try"), button:has-text("Let"), button:has-text("Go")').first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  await page.screenshot({ path: './screenshots/01-demo-page.png', fullPage: true });

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
