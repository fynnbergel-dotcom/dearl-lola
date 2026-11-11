// Capture the main screens in light/dark on desktop/mobile.
// Usage: start the app (npm run build && npx next start -p 3100), then:
//   node scripts/screenshots.mjs [outDir] [baseUrl]
import { chromium, devices } from "@playwright/test";
import fs from "node:fs";

const out = process.argv[2] ?? "screenshots";
const base = process.argv[3] ?? "http://localhost:3100";
fs.mkdirSync(out, { recursive: true });

const viewports = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { ...devices["iPhone 14"] },
};

const browser = await chromium.launch();
for (const [vpName, vp] of Object.entries(viewports)) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ ...vp, colorScheme: scheme });
    const page = await ctx.newPage();
    const shot = (name, opts = {}) => page.screenshot({ path: `${out}/${vpName}-${scheme}-${name}.png`, ...opts });

    await page.goto(base);
    await page.waitForTimeout(1200);
    await shot("1-landing");
    // Scroll through so the scroll-triggered reveals run before the full-page capture.
    for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 400) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${vpName}-${scheme}-0-fullpage.png`, fullPage: true });
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.getByPlaceholder("What's your name?").fill("Lola");
    await page.getByRole("button", { name: /come in/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole("radio", { name: /nervous/i }).click();
    await page.getByLabel(/on your plate/i).fill("A job interview at 2pm");
    await page.getByRole("radio", { name: /poetic/i }).first().click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await shot("2-personalize");

    await page.getByRole("button", { name: /make my day/i }).click();
    await page.getByRole("button", { name: /^save$/i }).waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.querySelector("article[aria-busy='true']"), null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot("3-compliment");

    await page.getByRole("button", { name: /^save$/i }).click();
    await page.getByRole("button", { name: /another one/i }).click();
    await page.waitForFunction(() => !document.querySelector("article[aria-busy='true']"), null, { timeout: 20000 });
    await page.getByRole("button", { name: /^save$/i }).click();
    await page.waitForTimeout(400);

    await page.getByRole("button", { name: /^share$/i }).click();
    await page.waitForTimeout(2500);
    await shot("4-share");
    await page.keyboard.press("Escape");

    await page.goto(`${base}/collection`);
    await page.waitForTimeout(1000);
    await shot("5-collection");
    await ctx.close();
  }
}
await browser.close();
console.log(`Saved screenshots to ${out}/`);
