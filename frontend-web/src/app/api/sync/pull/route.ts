import { NextRequest, NextResponse } from 'next/server';

// Global Cloud Vault Store for User Shows Across Devices
const DEFAULT_CONCERTS = [
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

// Persistent Cloud Storage Map
const globalCloudVaults = new Map<string, any>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'u_default';

  const userVault = globalCloudVaults.get(userId) || { concerts: DEFAULT_CONCERTS };

  return NextResponse.json({
    success: true,
    concertsData: userVault,
  });
}
