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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get('userId') || searchParams.get('email') || '';
    const userId = rawUserId.toLowerCase().trim();

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    const cleanKey = userId.replace(/[^a-z0-9_]/g, '_');
    let initialVault = INITIAL_VAULTS[cleanKey] || INITIAL_VAULTS[userId];

    if (!initialVault && userId.includes('wcsurface')) {
      initialVault = INITIAL_VAULTS['u_cloud_wcsurface_gmail_com'];
    }

    const memoryVault = globalVaultStore[cleanKey] || globalVaultStore[userId];

    const combinedMap = new Map<string, any>();

    if (initialVault && Array.isArray(initialVault.concerts)) {
      initialVault.concerts.forEach((c: any) => { if (c && c.id) combinedMap.set(c.id, c); });
    }

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
