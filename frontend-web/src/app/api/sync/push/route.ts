import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData } = body;

    if (!userId || !concertsData) {
      return NextResponse.json({ error: 'userId and concertsData required' }, { status: 400 });
    }

    const cleanKey = userId.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    const incomingConcerts = Array.isArray(concertsData.concerts)
      ? concertsData.concerts
      : (Array.isArray(concertsData) ? concertsData : []);

    const payload = { concerts: incomingConcerts };
    globalVaultStore[cleanKey] = payload;

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
      concertCount: incomingConcerts.length,
      concertsData: payload,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync push failed' }, { status: 500 });
  }
}
