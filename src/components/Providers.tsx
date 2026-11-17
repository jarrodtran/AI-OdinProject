'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ProgressProvider } from '@/context/ProgressContext';

export function Providers({
  children,
  cloudEnabled,
}: {
  children: React.ReactNode;
  cloudEnabled: boolean;
}) {
  return (
    // With cloud sync off, seed an empty session so the client never polls
    // /api/auth/session (which would fail on every page view).
    <SessionProvider
      session={cloudEnabled ? undefined : null}
      refetchOnWindowFocus={cloudEnabled}
    >
      <ProgressProvider cloudEnabled={cloudEnabled}>{children}</ProgressProvider>
    </SessionProvider>
  );
}
