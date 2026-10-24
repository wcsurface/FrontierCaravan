import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_VAULTS } from './vaults';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData, isExplicitAccountDelete } = body;

    if (!userId || !concertsData) {
      return NextResponse.json({ error: 'userId and concertsData required' }, { status: 400 });
    }

    const cleanKey = userId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    const incomingConcerts = Array.isArray(concertsData.concerts)
      ? concertsData.concerts
      : (Array.isArray(concertsData) ? concertsData : []);

    // 1. Check existing vault from Memory or INITIAL_VAULTS Module
    let existingVault = globalVaultStore[cleanKey];
    if (!existingVault || !Array.isArray(existingVault.concerts) || existingVault.concerts.length === 0) {
      existingVault = INITIAL_VAULTS[cleanKey];
      if (!existingVault && cleanKey.includes('wcsurface')) {
        existingVault = INITIAL_VAULTS['u_cloud_wcsurface_gmail_com'];
      }
    }

    const existingConcerts: any[] = existingVault && Array.isArray(existingVault.concerts)
      ? existingVault.concerts
      : [];

    // Zero-Data-Loss Protection Safeguard
    if (existingConcerts.length > 0 && incomingConcerts.length === 0 && !isExplicitAccountDelete) {
      return NextResponse.json({
        success: true,
        restored: true,
        concertsData: existingVault,
      });
    }

    // Merge incoming concerts with existing concerts by ID
    const mergedMap = new Map<string, any>();
    if (existingConcerts.length > 0 && !isExplicitAccountDelete) {
      existingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });
    }
    incomingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });

    const finalConcerts = Array.from(mergedMap.values());
    const payload = { concerts: finalConcerts };

    // Update Global In-Memory Store
    globalVaultStore[cleanKey] = payload;

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      concertCount: finalConcerts.length,
      concertsData: payload,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync push failed' }, { status: 500 });
  }
}
