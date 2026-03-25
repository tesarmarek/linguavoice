import { test } from '@playwright/test';

test.describe('Microphone Permission Denied', () => {
  test.fixme('should show clear error when mic permission is denied', async ({ page, context }) => {
    // 1. Deny microphone permission via browser context
    // 2. Navigate to app
    // 3. Try to use voice input
    // 4. Verify error toast/message is shown
    // 5. Verify error message is user-friendly
  });

  test.fixme('should keep app usable after mic denial', async ({ page, context }) => {
    // 1. Deny microphone permission
    // 2. Verify app does not crash
    // 3. Verify other features (history, navigation) still work
  });
});
