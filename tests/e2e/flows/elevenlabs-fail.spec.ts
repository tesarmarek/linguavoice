import { test } from '@playwright/test';

test.describe('ElevenLabs Failure', () => {
  test.fixme('should show text when ElevenLabs returns 500', async ({ page }) => {
    // 1. Mock ElevenLabs API to return 500
    // 2. Complete a turn
    // 3. Verify translation text is still displayed
    // 4. Verify story text is still displayed
    // 5. Verify audio is gracefully skipped (no play buttons or disabled)
  });

  test.fixme('should show error toast for audio failure', async ({ page }) => {
    // 1. Mock ElevenLabs API to fail
    // 2. Complete a turn
    // 3. Verify a toast notification explains audio is unavailable
    // 4. Verify it does not block the rest of the turn display
  });
});
