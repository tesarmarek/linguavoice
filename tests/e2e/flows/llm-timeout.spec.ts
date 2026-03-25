import { test } from '@playwright/test';

test.describe('LLM Timeout', () => {
  test.fixme('should show loading state during LLM processing', async ({ page }) => {
    // 1. Mock LLM API to delay response >10s
    // 2. Submit a turn
    // 3. Verify loading indicator is displayed
    // 4. Verify UI does not freeze
  });

  test.fixme('should not crash on LLM timeout', async ({ page }) => {
    // 1. Mock LLM API to timeout
    // 2. Submit a turn
    // 3. Verify app does not crash
    // 4. Verify error message is shown
  });

  test.fixme('should offer retry after timeout', async ({ page }) => {
    // 1. Mock LLM API to timeout on first call, succeed on second
    // 2. Submit a turn and wait for timeout
    // 3. Verify retry option is available
    // 4. Click retry and verify success
  });
});
