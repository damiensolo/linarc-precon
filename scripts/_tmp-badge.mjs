import puppeteer from 'puppeteer-core';
const out = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const dpr of [1, 1.25, 1.5]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: dpr });
  await page.goto('http://localhost:5173/?p=prequal-review&chrome=0', { waitUntil: 'networkidle0' });
  const res = await page.evaluate(async (dpr) => {
    const circles = [...document.querySelectorAll('.tab-navigation .status-indicator-v2__number')];
    return circles.map((c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  }, dpr);
  const results = [];
  for (const [i, r] of res.entries()) {
    const buf = await page.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h }, encoding: 'base64' });
    // analyse ink in the page: draw into canvas
    const ink = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const px = (x, y) => { const k = (y * cv.width + x) * 4; return [d[k], d[k + 1], d[k + 2]]; };
      const bg = px(Math.floor(cv.width / 2), 1); // inside circle near top-centre
      let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, sx = 0, sy = 0, sw = 0;
      const cx0 = cv.width / 2, cy0 = cv.height / 2, rad = cv.width / 2 - 1.5;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
        if ((x + 0.5 - cx0) ** 2 + (y + 0.5 - cy0) ** 2 > rad * rad) continue;
        const p = px(x, y); const diff = Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]);
        if (diff > 60) { minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); sx += (x + 0.5) * diff; sy += (y + 0.5) * diff; sw += diff; }
      }
      return { size: cv.width, inkBox: [minx, miny, maxx + 1, maxy + 1], inkCentre: [+(sx / sw).toFixed(2), +(sy / sw).toFixed(2)], boxCentre: [(minx + maxx + 1) / 2, (miny + maxy + 1) / 2], circleCentre: cv.width / 2 };
    }, buf);
    results.push({ badge: i, ...ink, offsetCssPx: [+((ink.boxCentre[0] - ink.circleCentre) / dpr).toFixed(2), +((ink.boxCentre[1] - ink.circleCentre) / dpr).toFixed(2)] });
  }
  console.log('dpr', dpr, JSON.stringify(results));
  if (dpr === 1.5) { const c = res[0]; await page.screenshot({ path: `${out}/badge-after-x6.png`, clip: { x: c.x - 40, y: c.y - 6, width: 140, height: 28 } }); }
  await page.close();
}
await browser.close();
