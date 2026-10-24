import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

const CLOUD_STORAGE_API = 'https://api.restful-api.dev/objects';

async function fetchFromExternalStore(userId: string): Promise<any | null> {
  try {
    const res = await fetch(CLOUD_STORAGE_API, { cache: 'no-store' });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        const match = items.find((item: any) => item && item.name === userId);
        if (match && match.data) {
          return match.data;
        }
      }
    }
  } catch (e) {}
  return null;
}

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
      // 2. Query External Cloud Store
      const externalData = await fetchFromExternalStore(userId);
      if (externalData && Array.isArray(externalData.concerts) && externalData.concerts.length > 0) {
        vault = externalData;
        globalVaultStore[userId] = vault;
      }
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
