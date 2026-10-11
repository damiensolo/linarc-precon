// TEMP: loading-state scenarios on prequal-queue. Samples the page every 50ms and prints state changes.
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const base = 'http://localhost:5173/?p=prequal-queue&chrome=0';

const SNAP = () => {
  const region = document.querySelector('.load-region');
  const hdr = document.querySelector('.dg-list-header-grid');
  const sk = document.querySelectorAll('.dg-list-skeleton .dg-list-row').length;
  const rows = document.querySelectorAll('.dg-list-row:not(.dg-list-skeleton .dg-list-row)').length;
  const status = region && region.previousElementSibling ? null : null;
  const filters = document.querySelector('[aria-label=Filters]');
  const meta = filters ? filters.lastElementChild.textContent.replace(/\s+/g, ' ').trim() : '';
  const live = region ? region.querySelector('[aria-live]').textContent : '';
  const notice = region ? (region.querySelector('[role=alert], [role=status]:not([aria-live])') || {}).textContent : '';
  const h = hdr ? hdr.getBoundingClientRect() : null;
  const shell = !!document.querySelector('[role=navigation]');
  return { busy: region && region.getAttribute('aria-busy'), sk, rows, meta, live, notice: (notice || '').replace(/\s+/g, ' ').trim(), hdrY: h ? Math.round(h.y) : null, shell };
};

async function timeline(page, ms, t0) {
  const out = [];
  let last = '';
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const s = await page.evaluate(SNAP);
    const k = JSON.stringify(s);
    if (k !== last) { out.push(`${String(Date.now() - t0).padStart(5)}ms ${k}`); last = k; }
    await new Promise((r) => setTimeout(r, 50));
  }
  return out;
}

async function scenario(latency, ms, extra) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (extra === 'reduced') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const t0 = Date.now();
  page.goto(`${base}&latency=${latency}`);
  await page.waitForSelector('.load-region', { timeout: 20000 });
  console.log(`\n=== ${latency}${extra ? ' + ' + extra : ''} (t from goto; region mounted at ${Date.now() - t0}ms)`);
  const lines = await timeline(page, ms, t0);
  console.log(lines.join('\n'));
  return page;
}

await (await scenario('instant', 600)).close();
await (await scenario('fast', 800)).close();
{
  const page = await scenario('medium', 1600);
  // reduced-motion check happens separately; here: shimmer on?
  // Refresh: change filter, keep rows, "Updating…" after 200ms
  const t0 = Date.now();
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Queue filter"] *')].filter((e) => e.textContent.trim() === 'Needs review').pop().click());
  console.log('--- filter → Needs review');
  console.log((await timeline(page, 1400, t0)).join('\n'));
  // Stale: two quick filter changes; final rows must match the last one.
  const t1 = Date.now();
  await page.evaluate(() => {
    const pick = (l) => [...document.querySelectorAll('[aria-label="Queue filter"] *')].filter((e) => e.textContent.trim() === l).pop().click();
    pick('Knockouts');
    setTimeout(() => pick('All'), 300);
  });
  console.log('--- Knockouts then All after 300ms (stale check)');
  console.log((await timeline(page, 1700, t1)).join('\n'));
  await page.close();
}
{
  const page = await scenario('slow', 7200);
  await page.close();
}
{
  const page = await scenario('slow', 5600, 'cancel');
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel').click());
  console.log('--- Cancel clicked');
  console.log((await timeline(page, 1500, Date.now())).join('\n'));
  await page.close();
}
await (await scenario('fail', 1800)).close();
{
  const page = await scenario('fail-once', 1800);
  await page.evaluate(() => [...document.querySelectorAll('.load-region button')].find((b) => b.textContent.trim() === 'Retry').click());
  console.log('--- Retry clicked');
  console.log((await timeline(page, 1800, Date.now())).join('\n'));
  await page.close();
}
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  for (const rm of ['no-preference', 'reduce']) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: rm }]);
    await page.goto(`${base}&latency=slow`);
    await page.waitForSelector('.dg-list-skeleton__bar', { visible: true, timeout: 5000 });
    const a = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.dg-list-skeleton__bar')); return [cs.animationName, cs.animationDuration, cs.backgroundColor, cs.borderRadius, cs.height]; });
    console.log(`reduced-motion=${rm}: bar`, a);
  }
  await page.close();
}
await browser.close();
