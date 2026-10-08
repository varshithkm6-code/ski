import { test, expect } from "@playwright/test";

test.describe("SkillBridge End-to-End Workflow", () => {
  const testEmail = `candidate_${Date.now()}@test.skillbridge.dev`;
  const testPassword = "Password123!";
  const testName = "Morgan Dev";

  test("full flow: register, load profile, pick role, analyze, complete roadmap item, logout, and login", async ({
    page,
  }) => {
    // 1. Visit Landing Page
    await page.goto("/");
    await expect(page).toHaveTitle(/SkillBridge/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Know exactly where you stand for your dream role.");

    // 2. Navigate to Register
    await page.click("a[href='/register']:has-text('Analyze my readiness')");
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByRole("heading", { name: "Create an Account" })).toBeVisible();

    // 3. Fill and submit Registration Form
    await page.fill("input#register-name", testName);
    await page.fill("input#register-email", testEmail);
    await page.fill("input#register-password", testPassword);
    await page.click("button[type='submit']");

    // Expect automatic redirect to /dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator("body")).toContainText("Candidate Profile");

    // 4. Load a Sample Profile (Alex Chen)
    const alexBtn = page.locator("button:has-text('Alex Chen')");
    await alexBtn.click();
    await expect(page.locator("body")).toContainText("Sample Profile Loaded");

    // 5. Proceed to Step 2: Target Role Selection
    const selectRoleBtn = page.locator("button:has-text('Select Target Role')");
    await selectRoleBtn.click();
    await expect(page.locator("body")).toContainText("Select Benchmark Role");

    // 6. Select a benchmark role from library
    const roleCard = page.locator("div:has-text('Frontend Developer')").first();
    await roleCard.click();

    // 7. Run Career Readiness Analysis
    const analyzeBtn = page.locator("button:has-text('Analyze Career Readiness')");
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();

    // 8. Verify Results Step (Bento Grid)
    await expect(page.locator("body")).toContainText("Readiness Intelligence", { timeout: 15000 });
    await expect(page.locator("body")).toContainText("Readiness Index");
    await expect(page.locator("body")).toContainText("Competency Radar");
    await expect(page.locator("body")).toContainText("Prioritized Skill Gap Matrix");
    await expect(page.locator("body")).toContainText("30/60/90-Day Action Plan");

    // 9. Open 'Why this score?' Drawer
    const whyScoreBtn = page.locator("button:has-text('Why this score?')");
    await whyScoreBtn.click();
    await expect(page.locator("body")).toContainText("How Your Score is Calculated");
    await expect(page.locator("body")).toContainText("Core Skill Coverage");
    await expect(page.locator("body")).toContainText("Proficiency Depth");
    await expect(page.locator("body")).toContainText("Evidence Reliability");

    // Close Drawer
    const closeDrawerBtn = page.locator("button[aria-label='Close drawer']");
    await closeDrawerBtn.click();

    // 10. Complete a Roadmap Item & Observe Live Score Recalculation
    const roadmapCheckbox = page.locator("button[aria-label*='Mark']").first();
    if (await roadmapCheckbox.isVisible()) {
      await roadmapCheckbox.click();
      await expect(page.locator("body")).toContainText(/Milestone Completed|Score boosted/);
    }

    // Helper for navigation on both desktop and mobile
    const navHelper = async (href: string, label: string) => {
      const mobileMenuBtn = page.locator("button[aria-label*='navigation menu']:visible").first();
      if (await mobileMenuBtn.isVisible().catch(() => false)) {
        await mobileMenuBtn.click();
        await page.waitForTimeout(300);
      }
      await page.locator(`a[href='${href}']:visible:has-text('${label}')`).first().click();
      await page.waitForLoadState("networkidle");
    };

    // 11. Test Navbar Navigation
    await navHelper("/roles", "Roles");
    await expect(page).toHaveURL(/.*roles/);
    await expect(page.getByRole("heading", { name: "Industry Standard Tech Roles" })).toBeVisible();

    await navHelper("/history", "History");
    await expect(page).toHaveURL(/.*history/);
    await expect(page.getByRole("heading", { name: "Career Readiness History" })).toBeVisible();

    // 12. Sign out
    const mobileMenuBtn = page.locator("button[aria-label*='navigation menu']:visible").first();
    if (await mobileMenuBtn.isVisible().catch(() => false)) {
      await mobileMenuBtn.click();
      await page.waitForTimeout(300);
    }
    const signOutBtn = page.locator("button:visible:has-text('Sign out')").first();
    await signOutBtn.click();
    await page.waitForURL(/.*login/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Sign in to SkillBridge" })).toBeVisible();

    // 13. Test Login with Demo Account Chip
    const demoAlexChip = page.locator("button:has-text('Alex (Candidate · CS)')");
    await demoAlexChip.click();
    await expect(page.locator("input#login-email")).toHaveValue("alex@demo.skillbridge.dev");
    await expect(page.locator("input#login-password")).toHaveValue("demo1234");

    await page.click("button[type='submit']:has-text('Sign in to Dashboard')");
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator("body")).toContainText("Candidate Profile");
  });
});
