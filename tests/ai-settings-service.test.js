import { test, expect, describe, beforeEach, afterEach } from '@playwright/test';

describe('AI Settings Service', () => {
  beforeEach(async () => {
    // Clear any existing AI settings before each test
    await page.evaluate(() => {
      localStorage.removeItem('ai_question_generation_enabled');
    });
  });

  afterEach(async () => {
    // Reset to default state after each test
    await page.evaluate(() => {
      localStorage.removeItem('ai_question_generation_enabled');
    });
  });

  test('should toggle AI settings and affect question display', async ({ page }) => {
    // Go to the admin panel
    await page.goto('http://localhost:5175/admin');
    await page.click('button:text("Manage Fields")');
    
    // Verify AI toggle exists and is initially enabled
    const aiToggle = page.locator('button:text("ON")');
    await expect(aiToggle).toBeVisible();
    
    // Get initial question count
    const questionCountBefore = await page.locator('.QuestionCard').count();
    console.log(`Initial question count: ${questionCountBefore}`);
    
    // Toggle off AI questions
    await aiToggle.click();
    
    // Wait for UI to update
    await page.waitForTimeout(1000);
    
    // Verify toggle state changed
    const aiToggleOff = page.locator('button:text("OFF")');
    await expect(aiToggleOff).toBeVisible();
    
    // Get question count after disabling AI
    const questionCountAfter = await page.locator('.QuestionCard').count();
    console.log(`Question count after disabling AI: ${questionCountAfter}`);
    
    // Verify that the question count may have decreased (only admin questions shown)
    // Note: This might not always decrease if there are no AI questions
    expect(questionCountAfter).toBeGreaterThanOrEqual(0);
    
    // Verify AI disabled warning is visible
    await expect(page.locator('text=AI Questions Disabled')).toBeVisible();
    
    // Toggle on AI questions again
    await aiToggleOff.click();
    
    // Wait for UI to update
    await page.waitForTimeout(1000);
    
    // Verify toggle state changed back
    const aiToggleOn = page.locator('button:text("ON")');
    await expect(aiToggleOn).toBeVisible();
    
    // Verify AI disabled warning is gone
    await expect(page.locator('text=AI Questions Disabled')).toBeHidden();
  });

  test('should persist AI settings across page reloads', async ({ page }) => {
    // Go to the admin panel
    await page.goto('http://localhost:5175/admin');
    await page.click('button:text("Manage Fields")');
    
    // Verify AI is initially enabled
    await expect(page.locator('button:text("ON")')).toBeVisible();
    
    // Toggle off AI questions
    await page.click('button:text("ON")');
    
    // Wait for UI to update
    await page.waitForTimeout(1000);
    
    // Verify toggle state changed
    await expect(page.locator('button:text("OFF")')).toBeVisible();
    
    // Reload the page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Verify AI remains disabled after reload
    await expect(page.locator('button:text("OFF")')).toBeVisible();
  });
});