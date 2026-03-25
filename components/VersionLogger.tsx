'use client';

import { useEffect } from 'react';

const APP_VERSION = '1.15.0';

export default function VersionLogger() {
  useEffect(() => {
    console.log(`[LinguaVoice] v${APP_VERSION}`);
  }, []);
  return null;
}
