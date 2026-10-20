import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LiveLore: Concert Diary & Live Setlist Vault',
  description: 'Distraction-free, offline-first personal concert diary and setlist tracker',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0D0E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0D0E] text-slate-100 antialiased h-screen w-screen overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
