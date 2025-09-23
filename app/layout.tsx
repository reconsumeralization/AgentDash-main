import type { Metadata } from 'next';
import React from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider, ErrorBoundary, NotificationProvider, ModalProvider } from '@/components/providers';
import { professionalTheme } from '@/lib/themes';
import './globals.css';

// Check if Clerk is available - demo mode
const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                 process.env.CLERK_SECRET_KEY &&
                 process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development';

// Simple wrapper component that doesn't cause re-renders
function ClerkWrapper({ children }: { children: React.ReactNode }) {
  if (!hasClerk) {
    return <>{children}</>;
  }

  try {
    const { ClerkProvider } = require('@clerk/nextjs');
    return <ClerkProvider>{children}</ClerkProvider>;
  } catch (error) {
    console.warn('Clerk not available, running without authentication');
    return <>{children}</>;
  }
}

export const metadata: Metadata = {
  title: 'DefConect - Aspiration-Based Professional Networking',
  description: 'Find your professional tribe based on future aspirations, not past achievements',
  generator: 'v0.app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ClerkWrapper>
        <html lang="en" suppressHydrationWarning>
          <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
            <ThemeProvider
              defaultTheme={professionalTheme}
              defaultMode="system"
              enableSystem={true}
              storageKey="agentdash-theme"
            >
              <NotificationProvider>
                <ModalProvider>
                  <div className="min-h-screen flex flex-col">
                    <main className="flex-1">{children}</main>
                  </div>
                </ModalProvider>
              </NotificationProvider>
            </ThemeProvider>
            <Analytics />
          </body>
        </html>
      </ClerkWrapper>
    </ErrorBoundary>
  );
}