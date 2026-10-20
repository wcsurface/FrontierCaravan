import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frontier Caravan: Wasteland Cartel',
  description: 'Post-apocalyptic trading and tactical combat mobile game',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0b0d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-wasteland-900 text-slate-200 antialiased h-screen w-screen overflow-hidden flex flex-col">
        {children}
      </body>
    </html>
  );
}
