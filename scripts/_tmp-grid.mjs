import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: +(process.argv[2] || 1440), height: 900 });
await page.goto('http://localhost:5173/?p=prequal-queue&chrome=0', { waitUntil: 'networkidle0' });
const r = await page.evaluate(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const grid = document.querySelector('.lnrc-app-layout [class*=data-grid], .lnrc-app-layout .flex-1.min-w-0');
  const content = document.querySelector('.lnrc-app-layout__content-body');
  const out = { content: box(content), filters: box(document.querySelector('[aria-label=Filters]')) };
  // walk the grid area: direct children of the flex column after filters
  const col = document.querySelector('[aria-label=Filters]').parentElement;
  const gridRoot = col.children[1];
  out.gridRoot = [gridRoot.className.slice(0, 80), box(gridRoot)];
  const kids = [...gridRoot.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.height > 30 && b.height < 70 && b.width > 600; }).slice(0, 12);
  out.bands = kids.map((k) => [k.tagName, (k.className && k.className.baseVal === undefined ? k.className : '').slice(0, 60), box(k)]);
  const hdrCells = [...gridRoot.querySelector(".dg-list-header-grid").children].map((c) => [c.textContent.trim().slice(0, 18), box(c)]);
  out.headers = hdrCells;
  const row = gridRoot.querySelector(".dg-list-row");
  out.row = row && [...row.children].map((c) => [c.textContent.trim().slice(0, 20), box(c)]);
  return out;
});
console.log(JSON.stringify(r, null, 0));
await browser.close();
