// TEMP: main-thread cost of each in-document screen swap (click → next painted frame), 3 runs each.
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/?p=prequal-dashboard&chrome=0', { waitUntil: 'networkidle0' });
const seq = ['Review Queue', 'Qualified Subs', 'Overview', 'Review Queue', 'Overview', 'Qualified Subs', 'Review Queue', 'Overview'];
for (const label of seq) {
  const r = await page.evaluate(async (label) => {
    const el = [...document.querySelectorAll('[role=navigation] *')].filter((e) => e.textContent.trim() === label).pop();
    const t = performance.now();
    el.click();
    await new Promise((res) => requestAnimationFrame(() => setTimeout(res)));
    return { label, ms: Math.round(performance.now() - t), slug: new URLSearchParams(location.search).get('p') };
  }, label);
  console.log(JSON.stringify(r));
  await new Promise((r) => setTimeout(r, 400));
}
await browser.close();
