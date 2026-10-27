import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get('userId') || searchParams.get('email') || '';
    const cleanKey = rawUserId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    let memoryVault = globalVaultStore[cleanKey];
    const concerts = memoryVault && Array.isArray(memoryVault.concerts) ? memoryVault.concerts : [];

    return NextResponse.json({
      success: true,
      concertsData: { concerts },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }
}
