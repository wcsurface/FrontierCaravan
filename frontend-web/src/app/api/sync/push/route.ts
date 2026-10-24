import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

const CLOUD_STORAGE_API = 'https://api.restful-api.dev/objects';

async function syncToExternalStore(userId: string, concertsData: any): Promise<void> {
  try {
    const listRes = await fetch(CLOUD_STORAGE_API, { cache: 'no-store' });
    let existingId: string | null = null;
    if (listRes.ok) {
      const items = await listRes.json();
      if (Array.isArray(items)) {
        const match = items.find((item: any) => item && item.name === userId);
        if (match && match.id) existingId = match.id;
      }
    }

    if (existingId) {
      await fetch(`${CLOUD_STORAGE_API}/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userId, data: concertsData }),
      });
    } else {
      await fetch(CLOUD_STORAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userId, data: concertsData }),
      });
    }
  } catch (e) {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData, isExplicitAccountDelete } = body;

    if (!userId || !concertsData) {
      return NextResponse.json({ error: 'userId and concertsData required' }, { status: 400 });
    }

    const incomingConcerts = Array.isArray(concertsData.concerts)
      ? concertsData.concerts
      : (Array.isArray(concertsData) ? concertsData : []);

    // Zero-Data-Loss Safeguard
    const existingData = globalVaultStore[userId];
    const existingConcerts: any[] = existingData && Array.isArray(existingData.concerts) ? existingData.concerts : [];

    if (existingConcerts.length > 0 && incomingConcerts.length === 0 && !isExplicitAccountDelete) {
      return NextResponse.json({
        success: true,
        restored: true,
        concertsData: existingData,
      });
    }

    // Merge incoming concerts with existing memory concerts by ID
    const mergedMap = new Map<string, any>();
    if (existingConcerts.length > 0 && !isExplicitAccountDelete) {
      existingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });
    }
    incomingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });

    const finalConcerts = Array.from(mergedMap.values());
    const payload = { concerts: finalConcerts };

    // Update Global Store
    globalVaultStore[userId] = payload;

    // Backup to External Cloud Store
    syncToExternalStore(userId, payload);

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
