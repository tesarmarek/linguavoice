import { test } from '@playwright/test';

test.describe('History Drawer', () => {
  test.fixme('should open drawer when hamburger icon is clicked', async ({ page }) => {
    // 1. Click hamburger menu icon
    // 2. Verify drawer slides in from the left
    // 3. Verify "Session History" heading is visible
  });

  test.fixme('should list sessions grouped by date', async ({ page }) => {
    // 1. Open drawer with existing sessions
    // 2. Verify sessions are grouped (Today, Yesterday, etc.)
    // 3. Verify each entry shows time and turn count
  });

  test.fixme('should open session modal when a session is clicked', async ({ page }) => {
    // 1. Open drawer
    // 2. Click on a session entry
    // 3. Verify modal opens with session details
  });

  test.fixme('should close drawer when clicking outside', async ({ page }) => {
    // 1. Open drawer
    // 2. Click outside the drawer area
    // 3. Verify drawer slides closed
  });
});
