import puppeteer from 'puppeteer-core';
const out = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (const theme of ['light', 'dark']) {
  for (const w of [1440, 390]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800 });
    await page.goto(`http://localhost:5173/?p=prequal-queue&theme=${theme}&latency=slow`);
    await page.waitForSelector('.dg-list-skeleton', { timeout: 15000 });
    await wait(300);
    await page.screenshot({ path: `${out}/skeleton-${theme}-${w}.png` });
    if (w === 1440) {
      await wait(5000);
      await page.screenshot({ path: `${out}/still-${theme}-${w}.png` });
    }
    await page.close();
  }
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 800 });
  await page.goto(`http://localhost:5173/?p=prequal-queue&theme=${theme}&latency=fail`);
  await page.waitForFunction(() => document.querySelector('.load-region [role=alert]'), { timeout: 15000 });
  await wait(200);
  await page.screenshot({ path: `${out}/error-${theme}.png` });
  await page.goto(`http://localhost:5173/?p=prequal-queue&theme=${theme}&latency=medium`);
  await page.waitForFunction(() => document.querySelectorAll('.dg-list-row').length && !document.querySelector('.dg-list-skeleton'), { timeout: 15000 });
  await page.evaluate(() => [...document.querySelectorAll('[aria-label="Queue filter"] *')].filter((e) => e.textContent.trim() === 'Knockouts').pop().click());
  await wait(400);
  await page.screenshot({ path: `${out}/refresh-${theme}.png` });
  await page.close();
}
await browser.close();
