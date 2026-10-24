import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VAULTS } from './vaults';

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
      // 2. Fall back to INITIAL_VAULTS Module
      const initialVault = INITIAL_VAULTS[userId];
      if (initialVault && Array.isArray(initialVault.concerts) && initialVault.concerts.length > 0) {
        vault = initialVault;
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
