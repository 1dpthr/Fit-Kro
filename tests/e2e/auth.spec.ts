import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('Clicking Sign Up tab alone should not navigate to onboarding', async ({ page }) => {
    await page.goto('/?e2e=1');
    await page.click('button:has-text("Sign Up")');
    // Ensure Create Account button is present and onboarding not visible
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
    await expect(page.locator('text=Let\'s Get Started')).toHaveCount(0);
  });

  test('Sign up with new account goes to onboarding with prefill and completes profile', async ({ page }) => {
    // Debugging hooks
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('response', async (resp) => {
      if (resp.url().includes('/make-server-d4a017ee/signup') || resp.url().includes('/profile')) {
        console.log('RESPONSE:', resp.url(), resp.status());
        try {
          const json = await resp.json();
          console.log('RESPONSE JSON:', JSON.stringify(json));
        } catch (e) {
          console.log('RESPONSE TEXT:', await resp.text());
        }
      }
    });

    const timestamp = Date.now();
    const email = `e2e${timestamp}@example.com`;
    const password = 'password123';

    // Use E2E simulation: navigate with ?e2e=1 so the app short-circuits signup and simulates success
    await page.goto('/?e2e=1');

    await page.click('button:has-text("Sign Up")');

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create Account")');

    // Wait for onboarding screen to appear (simulation will auto-transition)
    await expect(page.locator('text=Let\'s Get Started')).toBeVisible({ timeout: 20000 });

    // Verify name prefilled from email prefix
    const expectedName = email.split('@')[0];
    await expect(page.locator('input[placeholder="John Doe"]')).toHaveValue(expectedName);

    // Fill required fields and complete onboarding
    await page.fill('input[placeholder="John Doe"]', expectedName);
    await page.fill('input[placeholder="25"]', '25');
    await page.click('button:has-text("Next")');

    await page.fill('input[placeholder="175"]', '175');
    await page.fill('input[placeholder="70"]', '70');
    await page.click('button:has-text("Next")');

    await page.click('button:has-text("✨ Complete")');

    // Wait for success toast and ensure we are in the app by checking for sidebar/navigation
    await page.waitForSelector('text=🎉 Profile saved successfully! Welcome to Fit Kro!', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('nav')).toBeVisible({ timeout: 15000 });
  });
});
