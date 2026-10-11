import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (let i = 0; i < 3; i++) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    const st = window.setTimeout;
    window.__log = [];
    window.setTimeout = function (fn, ms, ...a) { const t0 = performance.now(); return st(function () { if (ms === 120 || ms === 200) window.__log.push(`${ms}ms timer set@${Math.round(t0)} fired@${Math.round(performance.now())}`); return fn.apply(this, arguments); }, ms, ...a); };
  });
  await page.goto('http://localhost:5173/?p=prequal-queue&chrome=0&latency=fast', { waitUntil: 'networkidle0' });
  console.log(await page.evaluate(() => window.__log.join(' | ')), '|| live:', await page.evaluate(() => document.querySelector('.load-region [aria-live]').textContent));
  await page.close();
}
await browser.close();
