import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VAULTS } from './vaults';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get('userId') || '';
    const userId = rawUserId.toLowerCase().trim();

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    const initialVault = INITIAL_VAULTS[userId];
    const memoryVault = globalVaultStore[userId];

    const combinedMap = new Map<string, any>();

    // 1. Add Initial Vault Concerts
    if (initialVault && Array.isArray(initialVault.concerts)) {
      initialVault.concerts.forEach((c: any) => { if (c && c.id) combinedMap.set(c.id, c); });
    }

    // 2. Add Memory Vault Concerts
    if (memoryVault && Array.isArray(memoryVault.concerts)) {
      memoryVault.concerts.forEach((c: any) => { if (c && c.id) combinedMap.set(c.id, c); });
    }

    const concerts = Array.from(combinedMap.values());

    return NextResponse.json({
      success: true,
      concertsData: { concerts },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }
}
