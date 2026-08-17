import { chromium, devices } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3100';
const OUT = process.env.OUT ?? '.';

const browser = await chromium.launch({ headless: false, slowMo: 250 });
const results = [];

async function measure(page, path) {
  const t0 = Date.now();
  const res = await page.goto(BASE + path, { waitUntil: 'load' });
  const wall = Date.now() - t0;
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return { ttfb: Math.round(n.responseStart), domContentLoaded: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) };
  });
  const lcp = await page.evaluate(() => new Promise(resolve => {
    let v = 0;
    new PerformanceObserver(list => { for (const e of list.getEntries()) v = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    setTimeout(() => resolve(Math.round(v)), 1200);
  }));
  results.push({ path, status: res.status(), wall, ...nav, lcp });
  return res;
}

// ── Desktop pass ──────────────────────────────────────────
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
const consoleErrors = [];
page.on('console', m => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await measure(page, '/');
await page.screenshot({ path: `${OUT}/desktop-home.png`, fullPage: false });

await measure(page, '/financing');
await page.screenshot({ path: `${OUT}/desktop-financing.png`, fullPage: true });

await measure(page, '/browse');
const cards = await page.locator('a:has-text("Apply for Financing")').count();
console.log('listing cards with financing button:', cards);
await page.screenshot({ path: `${OUT}/desktop-browse.png`, fullPage: false });

// nav link works
await page.click('a[href="/financing"]');
await page.waitForURL('**/financing');
console.log('nav link → financing OK');

// external link opens in a new tab with the right URL
const [popup] = await Promise.all([
  desktop.waitForEvent('page'),
  page.click('a:has-text("Start Application")'),
]);
console.log('popup url:', popup.url());
await popup.close();

// horizontal overflow check
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('desktop horizontal overflow px:', overflow);

// ── Mobile pass ───────────────────────────────────────────
const mobile = await browser.newContext({ ...devices['iPhone 13'] });
const mpage = await mobile.newPage();
await mpage.goto(BASE + '/financing', { waitUntil: 'load' });
await mpage.screenshot({ path: `${OUT}/mobile-financing.png`, fullPage: true });
const moverflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('mobile horizontal overflow px:', moverflow);

await mpage.goto(BASE + '/browse', { waitUntil: 'load' });
await mpage.screenshot({ path: `${OUT}/mobile-browse.png`, fullPage: false });

// tap-target size of the financing button on a card
const btn = mpage.locator('a:has-text("Apply for Financing")').first();
if (await btn.count()) console.log('mobile financing button box:', await btn.boundingBox());

console.table(results);
console.log('console errors:', consoleErrors.length ? consoleErrors : 'none');

await browser.close();
