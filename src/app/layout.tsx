import React from 'react';
import type { Metadata } from 'next';
import '../styles/index.css';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'ShopManager Guinée',
  description: 'Système de gestion de boutiques — Guinée',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.resend.com" />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fshopmanage6772back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.17" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}