import { test, expect } from '@playwright/test';

test('AI toggle in Question Banks tab', async ({ page }) => {
  // Go to the admin panel
  await page.goto('http://localhost:5175/admin');
  
  // Click on "Manage Fields" button
  await page.click('button:text("Manage Fields")');
  
  // Verify AI toggle exists
  await expect(page.locator('input[type="checkbox"]#aiEnabled')).toBeVisible();
  
  // Get initial question count
  const questionCountBefore = await page.locator('.QuestionCard').count();
  
  // Toggle off AI questions
  await page.uncheck('input[type="checkbox"]#aiEnabled');
  
  // Wait for questions to update
  await page.waitForTimeout(1000);
  
  // Get question count after disabling AI
  const questionCountAfter = await page.locator('.QuestionCard').count();
  
  // Verify that the question count decreased (only admin questions are shown)
  await expect(questionCountAfter).toBeLessThan(questionCountBefore);
  
  // Verify AI disabled warning is visible
  await expect(page.locator('text=AI Questions Disabled')).toBeVisible();
  
  // Toggle on AI questions again
  await page.check('input[type="checkbox"]#aiEnabled');
  
  // Wait for questions to update
  await page.waitForTimeout(1000);
  
  // Verify AI disabled warning is gone
  await expect(page.locator('text=AI Questions Disabled')).toBeHidden();
  
  // Verify question count increased again
  const questionCountFinal = await page.locator('.QuestionCard').count();
  await expect(questionCountFinal).toBeGreaterThan(questionCountAfter);
});