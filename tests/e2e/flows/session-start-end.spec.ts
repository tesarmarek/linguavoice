import { test } from '@playwright/test';

test.describe('Session Start and End', () => {
  test.fixme('should start a new session', async ({ page }) => {
    // 1. Click "Start Session" button
    // 2. Verify session is created
    // 3. Verify mic button becomes available
  });

  test.fixme('should allow multiple turns within a session', async ({ page }) => {
    // 1. Start session
    // 2. Complete turn 1
    // 3. Complete turn 2
    // 4. Verify both turn cards are displayed
    // 5. Verify turn indices are sequential
  });

  test.fixme('should end a session and appear in history', async ({ page }) => {
    // 1. Start session and complete turns
    // 2. End the session
    // 3. Open history drawer
    // 4. Verify the ended session appears in the list
    // 5. Verify turn count is correct
  });
});
