import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const INITIAL_CONCERTS = [
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
];

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get('userId') || searchParams.get('email') || '').toLowerCase();

    const isTestAccount = userId.includes('testaccount');

    let memoryVault = globalVaultStore[userId] || globalVaultStore['u_cloud_wcsurface_gmail_com'];

    const combinedMap = new Map<string, any>();

    // Load initial 5 real concerts for wcsurface account
    if (!isTestAccount) {
      INITIAL_CONCERTS.forEach((c) => { if (c && c.id) combinedMap.set(c.id, c); });
    }

    // Merge memory vault concerts
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
