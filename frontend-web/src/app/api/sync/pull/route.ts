import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    // 1. Check Global In-Memory Store First
    let vault = globalVaultStore[userId];

    if (!vault || !Array.isArray(vault.concerts) || vault.concerts.length === 0) {
      // 2. Fetch Static Vault File from Vercel CDN (/vaults/${userId}.json)
      try {
        const fileUrl = `${req.nextUrl.origin}/vaults/${userId}.json`;
        const res = await fetch(fileUrl, { cache: 'no-store' });
        if (res.ok) {
          vault = await res.json();
          if (vault && Array.isArray(vault.concerts)) {
            globalVaultStore[userId] = vault;
          }
        }
      } catch (fErr) {}
    }

    const concerts = vault && Array.isArray(vault.concerts)
      ? vault.concerts
      : (Array.isArray(vault) ? vault : []);

    return NextResponse.json({
      success: true,
      concertsData: { concerts },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }
}
