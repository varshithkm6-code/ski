import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Full Visual Screenshot Suite", () => {
  const screenshotsDir = path.join(process.cwd(), "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  const viewports = [
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "mobile-390", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    test(`Capture screenshots on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Landing
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-01-landing.png`),
        fullPage: false,
      });

      // 2. Login
      await page.goto("/login");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-02-login.png`),
        fullPage: false,
      });

      // 3. Register
      await page.goto("/register");
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-03-register.png`),
        fullPage: false,
      });

      // Sign in as Alex Chen to capture app steps
      await page.goto("/login");
      await page.fill("input#login-email", "alex@demo.skillbridge.dev");
      await page.fill("input#login-password", "demo1234");
      await page.click("button[type='submit']");
      await page.waitForURL(/.*dashboard/);

      // 4. Assessment Step 1: Profile Intake
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-04-step1-profile.png`),
        fullPage: false,
      });

      // 5. Assessment Step 2: Role Selection
      await page.click("button:has-text('Select Target Role')");
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-05-step2-role.png`),
        fullPage: false,
      });

      // 6. Run Assessment & Results (Bento Grid)
      const roleCard = page.locator("div:has-text('Frontend Developer')").first();
      await roleCard.click();
      await page.click("button:has-text('Analyze Career Readiness')");
      await page.waitForSelector("text=Readiness Intelligence", { timeout: 15000 });
      await page.waitForTimeout(800); // Allow gauge count-up & radar to render
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-06-results-bento.png`),
        fullPage: false,
      });

      // 7. Why this score? Drawer
      const whyScoreBtn = page.locator("button:has-text('Why this score?')");
      await whyScoreBtn.click();
      await page.waitForTimeout(400); // Drawer slide animation
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-07-drawer.png`),
        fullPage: false,
      });

      // Close Drawer
      const closeDrawerBtn = page.locator("button[aria-label='Close drawer']");
      await closeDrawerBtn.click();
      await page.waitForTimeout(300);

      // 8. Roadmap after completing an item
      const roadmapCheckbox = page.locator("button[aria-label*='Mark']").first();
      if (await roadmapCheckbox.isVisible()) {
        await roadmapCheckbox.click();
        await page.waitForTimeout(500); // Wait for +4 score delta chip
        await page.screenshot({
          path: path.join(screenshotsDir, `${vp.name}-08-roadmap-completed.png`),
          fullPage: false,
        });
      }

      // 9. History Page
      await page.goto("/history");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-09-history.png`),
        fullPage: false,
      });

      // 10. Counselor Page (Log out by clearing cookies, log in as counselor)
      await page.context().clearCookies();
      await page.goto("/login");
      await page.waitForLoadState("networkidle");
      await page.fill("input#login-email", "counselor@demo.skillbridge.dev");
      await page.fill("input#login-password", "demo1234");
      await page.click("button[type='submit']");
      await page.waitForURL(/.*dashboard/);

      await page.goto("/counselor");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(screenshotsDir, `${vp.name}-10-counselor.png`),
        fullPage: false,
      });
    });
  }
});
