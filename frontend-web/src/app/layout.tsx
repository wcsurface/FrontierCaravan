import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Midnight Mart: Neon Bodega',
  description: 'Juicy spatial-fit inventory packing puzzle with a shop renovation meta-game',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070112',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#070112] text-slate-100 antialiased h-screen w-screen overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
