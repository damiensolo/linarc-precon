// TEMP: measures a rail navigation (Overview → Review Queue): page reload?, click → content time, blank frames.
import puppeteer from 'puppeteer-core';
const theme = process.argv[2] || 'light';
const from = process.argv[3] || 'prequal-dashboard';
const label = process.argv[4] || 'Review Queue';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`http://localhost:5173/?p=${from}&chrome=0&theme=${theme}`, { waitUntil: 'networkidle0' });
await page.evaluate(() => { window.__sameDocument = true; });
const cdp = await page.createCDPSession();
const frames = [];
cdp.on('Page.screencastFrame', async (f) => {
  frames.push({ t: f.metadata.timestamp, data: f.data });
  await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
await new Promise((r) => setTimeout(r, 300));
const target = await page.evaluateHandle((label) => [...document.querySelectorAll('[role=navigation] *')].filter((el) => el.textContent.trim() === label).pop(), label);
const t0 = Date.now();
const clickAt = Date.now() / 1000;
await target.click();
await page.waitForFunction((label) => document.title !== undefined && [...document.querySelectorAll('.lnrc-app-layout span')].some((s) => s.textContent.trim().toLowerCase() === label.toLowerCase()), { timeout: 15000 }, label === 'Review Queue' ? 'Review queue' : label);
const contentMs = Date.now() - t0;
await new Promise((r) => setTimeout(r, 1500));
await cdp.send('Page.stopScreencast');
const same = await page.evaluate(() => window.__sameDocument === true).catch(() => false);
// Classify frames after the click: sample the top nav, the rail and the content area.
const probe = await browser.newPage();
const pts = [[40, 36], [30, 300], [900, 450]];
let blank = 0, after = 0;
const log = [];
for (const f of frames) {
  if (f.t < clickAt - 0.05) continue;
  after++;
  const px = await probe.evaluate(async (b64, pts) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
    const sx = img.width / 1440, sy = img.height / 900;
    return pts.map(([x, y]) => [...ctx.getImageData(Math.round(x * sx), Math.round(y * sy), 1, 1).data].slice(0, 3).join(','));
  }, f.data, pts);
  const navBlank = px[0] === '255,255,255' || px[1] === '255,255,255' && px[0] === px[1];
  if (navBlank) blank++;
  log.push(`${((f.t - clickAt) * 1000).toFixed(0).padStart(5)}ms nav=${px[0]} rail=${px[1]} content=${px[2]}${navBlank ? '  BLANK' : ''}`);
}
console.log(JSON.stringify({ theme, sameDocument: same, clickToContentMs: contentMs, framesAfterClick: after, blankFrames: blank }));
console.log(log.slice(0, 25).join('\n'));
await browser.close();
