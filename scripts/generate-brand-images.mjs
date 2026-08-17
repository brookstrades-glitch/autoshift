import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const font = `'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

const og = `<body style="margin:0">
<div style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:flex-end;padding:80px;box-sizing:border-box;background:linear-gradient(135deg,#0d1526 0%,#162033 100%);position:relative;font-family:${font}">
  <div style="position:absolute;top:48px;left:80px;display:flex;align-items:center;gap:12px">
    <div style="width:36px;height:36px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:900">A</div>
    <span style="color:#fff;font-size:22px;font-weight:700">AutoShift Houston</span>
  </div>
  <div style="color:#2563eb;font-size:15px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;margin-bottom:20px">Houston, TX</div>
  <div style="color:#fff;font-size:88px;font-weight:900;line-height:0.88;margin-bottom:28px">Car Note<br>Takeovers.</div>
  <div style="color:#94a3b8;font-size:26px">Take over someone&rsquo;s car payments &mdash; verified deals, no financing required.</div>
</div></body>`;

const icon = `<body style="margin:0">
<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:#2563eb;border-radius:7px;color:#fff;font-size:20px;font-weight:900;font-family:${font}">A</div>
</body>`;

const browser = await chromium.launch();

for (const [html, width, height, out] of [
  [og, 1200, 630, 'opengraph-image.png'],
  [icon, 32, 32, 'icon.png'],
]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.screenshot({ path: join(appDir, out), omitBackground: out === 'icon.png' });
  await page.close();
}

await browser.close();
