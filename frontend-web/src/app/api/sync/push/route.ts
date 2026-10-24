import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

const INITIAL_VAULTS: Record<string, any> = {
  u_cloud_wcsurface_gmail_com: {
    concerts: [
      {
        id: "c_phish_2026",
        headline: "PHISH",
        venue: "DICK'S SPORTING GOODS PARK",
        city: "Commerce City",
        state: "CO",
        country: "USA",
        date: "09/04/2026",
        openersList: []
      },
      {
        id: "c_stones_120789",
        headline: "ROLLING STONES",
        opener: "Living Color",
        openersList: ["Living Color"],
        venue: "HOOSIER DOME",
        city: "Indianapolis",
        state: "IN",
        country: "USA",
        date: "12/07/1989"
      },
      {
        id: "c_stones_120689",
        headline: "ROLLING STONES",
        opener: "Living Color",
        openersList: ["Living Color"],
        venue: "HOOSIER DOME",
        city: "Indianapolis",
        state: "IN",
        country: "USA",
        date: "12/06/1989"
      },
      {
        id: "c_srv_072289",
        headline: "STEVIE RAY VAUGHAN",
        opener: "Stray Cats, Duke Tumato",
        openersList: ["Stray Cats", "Duke Tumato"],
        venue: "DEER CREEK MUSIC CENTER",
        city: "Noblesville",
        state: "IN",
        country: "USA",
        date: "07/22/1989"
      },
      {
        id: "c_dead_052891",
        headline: "GRATEFUL DEAD",
        opener: "Violent Femmes",
        openersList: ["Violent Femmes"],
        venue: "DEER CREEK MUSIC CENTER",
        city: "Noblesville",
        state: "IN",
        country: "USA",
        date: "05/28/1991"
      }
    ]
  },
  u_cloud_test_testaccount_com: {
    concerts: []
  }
};

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

    if (existingConcerts.length > 0 && incomingConcerts.length === 0 && !isExplicitAccountDelete) {
      return NextResponse.json({
        success: true,
        restored: true,
        concertsData: existingVault,
      });
    }

    const mergedMap = new Map<string, any>();
    if (existingConcerts.length > 0 && !isExplicitAccountDelete) {
      existingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });
    }
    incomingConcerts.forEach((c) => { if (c && c.id) mergedMap.set(c.id, c); });

    const finalConcerts = Array.from(mergedMap.values());
    const payload = { concerts: finalConcerts };

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
