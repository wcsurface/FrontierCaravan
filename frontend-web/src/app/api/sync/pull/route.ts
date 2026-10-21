import { NextRequest, NextResponse } from 'next/server';

// Preset sample shows ONLY for wcsurface@gmail.com account
const WCSURFACE_SHOWS = [
  {
    id: "c_srv_89",
    headline: "Stevie Ray Vaughan",
    headlineArtistName: "Stevie Ray Vaughan",
    openingArtistName: "The Stray Cats, Duke Tumatoe",
    openersList: ["The Stray Cats", "Duke Tumatoe"],
    date: "07/22/89",
    venue: "Deer Creek Music Center",
    venueName: "Deer Creek Music Center",
    city: "Noblesville",
    venueCity: "Noblesville",
    state: "Indiana",
    venueState: "Indiana",
    country: "USA",
    venueCountry: "USA",
    notes: "Mom took Matt VonBuechler and me",
    generalNotes: "Mom took Matt VonBuechler and me"
  },
  {
    id: "c_aero_88",
    headline: "Aerosmith",
    headlineArtistName: "Aerosmith",
    openingArtistName: "Guns N Roses",
    openersList: ["Guns N Roses"],
    date: "08/02/88",
    venue: "Market Square Arena",
    venueName: "Market Square Arena",
    city: "Indianapolis",
    venueCity: "Indianapolis",
    state: "Indiana",
    venueState: "Indiana",
    country: "USA",
    venueCountry: "USA",
    notes: "My first concert.",
    generalNotes: "My first concert."
  }
];

// Persistent Multi-Tenant Cloud Vault Map (Key: userId -> Value: { concerts: [...] })
const globalCloudVaults = new Map<string, any>();

// Seed wcsurface@gmail.com account vault
const WCS_USER_ID = "u_cloud_wcsurface_gmail_com";
globalCloudVaults.set(WCS_USER_ID, { concerts: WCSURFACE_SHOWS });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }

  // If new user or non-seeded account, vault starts 100% clean and empty!
  const userVault = globalCloudVaults.get(userId) || { concerts: [] };

  return NextResponse.json({
    success: true,
    concertsData: userVault,
  });
}
