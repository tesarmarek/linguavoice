import { test } from '@playwright/test';

test.describe('History Modal', () => {
  test.fixme('should display all turns in read-only mode', async ({ page }) => {
    // 1. Open a session modal
    // 2. Verify all turn cards are visible
    // 3. Verify turn cards are read-only (no edit controls)
  });

  test.fixme('should show session metadata in modal header', async ({ page }) => {
    // 1. Open a session modal
    // 2. Verify date and time are shown
    // 3. Verify language is indicated
  });

  test.fixme('should allow audio playback from modal', async ({ page }) => {
    // 1. Open a session modal with audio
    // 2. Verify play buttons are available for translation and story audio
    // 3. Click play and verify audio player activates
  });

  test.fixme('should close modal with close button', async ({ page }) => {
    // 1. Open modal
    // 2. Click close (✕) button
    // 3. Verify modal is closed
  });
});
