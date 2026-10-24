export interface Artist {
  id: string;
  name: string;
  disambiguation?: string;
  mbid?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  stateProvince?: string;
  country: string;
  capacity?: number;
  createdAt: number;
}

export interface SetlistItem {
  id: string;
  concertId: string;
  artistId: string;
  songTitle: string;
  position: number;
  isEncore: boolean;
  encoreNumber?: number;
  originalArtist?: string;
  notes?: string;
}

export interface Concert {
  id: string;
  date: number | string; // Unix Milliseconds or Date String
  venueId: string;
  headlineArtistId: string;
  openingArtistId?: string;
  tourName?: string;
  rating?: number; // 0.0 - 5.0
  personalRating?: number;
  ticketPrice?: number;
  currency?: string;
  ticketImageUri?: string;
  photoUris?: string[];
  audioMemoUri?: string;
  generalNotes?: string;
  createdAt?: number;
  updatedAt?: number;
  syncStatus?: 'synced' | 'pending_insert' | 'pending_update' | 'pending_delete';
}

export interface CreateConcertInput {
  date: number | string;
  headlineArtistName: string;
  openingArtistName?: string;
  venueName: string;
  venueCity?: string;
  venueState?: string;
  venueCountry?: string;
  tourName?: string;
  rating?: number;
  ticketPrice?: number;
  notes?: string;
  photoUris?: string[];
  setlist: { title?: string; songTitle?: string; position: number; isEncore: boolean; originalArtist?: string; notes?: string }[];
}

export interface ConcertStats {
  totalShows: number;
  uniqueArtists: number;
  totalSongsWitnessed: number;
  uniqueVenues: number;
  totalInvestment: number;
  topArtists: { name: string; timesSeen: number }[];
  topVenues: { name: string; city: string; visitCount: number }[];
  topCities: { city: string; state: string; visitCount: number }[];
  topStates: { state: string; visitCount: number }[];
  topYears: { year: number; count: number }[];
  topDaysOfWeek: { day: string; count: number; percentage: number }[];
}

export function toStateAbbr(stateStr: string): string {
  if (!stateStr) return 'IN';
  const s = stateStr.trim();
  if (s.length === 2) return s.toUpperCase();
  const map: Record<string, string> = {
    'california': 'CA', 'indiana': 'IN', 'colorado': 'CO', 'new york': 'NY',
    'ohio': 'OH', 'illinois': 'IL', 'michigan': 'MI', 'wisconsin': 'WI',
    'kentucky': 'KY', 'tennessee': 'TN', 'missouri': 'MO', 'texas': 'TX',
    'nevada': 'NV', 'washington': 'WA', 'oregon': 'OR', 'pennsylvania': 'PA',
    'new jersey': 'NJ', 'massachusetts': 'MA', 'connecticut': 'CT', 'rhode island': 'RI',
    'maryland': 'MD', 'georgia': 'GA', 'north carolina': 'NC', 'florida': 'FL',
    'arkansas': 'AR', 'kansas': 'KS', 'nebraska': 'NE', 'minnesota': 'MN',
    'arizona': 'AZ', 'district of columbia': 'DC'
  };
  return map[s.toLowerCase()] || s;
}

// Robust Helper to parse any date format (milliseconds or "MM/DD/YY" strings)
export function parseConcertDate(dateVal: number | string): Date {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'number') return new Date(dateVal);
  if (typeof dateVal === 'string') {
    const parts = dateVal.split(/[\/\.-]/);
    if (parts.length === 3) {
      let m = parseInt(parts[0], 10) - 1;
      let d = parseInt(parts[1], 10);
      let y = parseInt(parts[2], 10);
      if (y < 100) {
        y = y > 30 ? 1900 + y : 2000 + y;
      }
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const directDate = new Date(dateVal);
    if (!isNaN(directDate.getTime())) return directDate;
  }
  return new Date();
}

export class AnalyticsEngine {
  public static calculateStats(
    concerts: Concert[],
    artists: Artist[],
    venues: Venue[],
    setlistItems: SetlistItem[]
  ): ConcertStats {
    const totalShows = concerts.length;
    const totalSongsWitnessed = setlistItems.length;

    const artistIds = new Set<string>();
    concerts.forEach(c => {
      if (c.headlineArtistId) artistIds.add(c.headlineArtistId);
      if (c.openingArtistId) artistIds.add(c.openingArtistId);
    });
    const uniqueArtists = artistIds.size;

    const venueIds = new Set<string>();
    concerts.forEach(c => venueIds.add(c.venueId));
    const uniqueVenues = venueIds.size;

    const totalInvestment = concerts.reduce((acc, curr) => acc + (curr.ticketPrice || 0), 0);

    // 1. TOP ARTISTS (Case-Insensitive & Trimmed)
    const artistNormalizedCountMap = new Map<string, number>();
    const artistDisplayNameMap = new Map<string, string>();

    const recordArtistName = (rawName: string) => {
      if (!rawName || !rawName.trim()) return;
      const cleanName = rawName.trim();
      const normKey = cleanName.toLowerCase();

      artistNormalizedCountMap.set(normKey, (artistNormalizedCountMap.get(normKey) || 0) + 1);
      if (!artistDisplayNameMap.has(normKey)) {
        artistDisplayNameMap.set(normKey, cleanName);
      }
    };

    concerts.forEach(c => {
      const headlinerObj = artists.find(a => a.id === c.headlineArtistId);
      if (headlinerObj && headlinerObj.name) recordArtistName(headlinerObj.name);

      const openerObj = artists.find(a => a.id === c.openingArtistId);
      if (openerObj && openerObj.name) {
        openerObj.name.split(',').map(b => b.trim()).filter(Boolean).forEach(bName => recordArtistName(bName));
      }
    });

    const topArtists = Array.from(artistNormalizedCountMap.entries())
      .map(([normKey, count]) => ({ name: artistDisplayNameMap.get(normKey) || normKey, timesSeen: count }))
      .sort((a, b) => b.timesSeen - a.timesSeen);

    // 2. TOP VENUES (Case-Insensitive & Trimmed)
    const venueNormalizedCountMap = new Map<string, number>();
    const venueDisplayNameMap = new Map<string, { name: string; city: string }>();

    concerts.forEach(c => {
      const vObj = venues.find(v => v.id === c.venueId);
      const rawName = vObj?.name || 'Unknown Venue';
      const cleanName = rawName.trim();
      const normKey = cleanName.toLowerCase();

      venueNormalizedCountMap.set(normKey, (venueNormalizedCountMap.get(normKey) || 0) + 1);
      if (!venueDisplayNameMap.has(normKey)) {
        venueDisplayNameMap.set(normKey, { name: cleanName, city: (vObj?.city || '').trim() });
      }
    });

    const topVenues = Array.from(venueNormalizedCountMap.entries())
      .map(([normKey, count]) => {
        const info = venueDisplayNameMap.get(normKey) || { name: normKey, city: '' };
        return { name: info.name, city: info.city, visitCount: count };
      })
      .sort((a, b) => b.visitCount - a.visitCount);

    // 3. TOP CITIES (Case-Insensitive & Trimmed)
    const cityNormalizedCountMap = new Map<string, number>();
    const cityDisplayNameMap = new Map<string, { city: string; state: string }>();

    concerts.forEach(c => {
      const vObj = venues.find(v => v.id === c.venueId);
      const rawCity = vObj?.city || 'Unknown City';
      const cleanCity = rawCity.trim();
      const cleanState = toStateAbbr(vObj?.stateProvince || '');
      const normKey = `${cleanCity.toLowerCase()}_${cleanState.toLowerCase()}`;

      cityNormalizedCountMap.set(normKey, (cityNormalizedCountMap.get(normKey) || 0) + 1);
      if (!cityDisplayNameMap.has(normKey)) {
        cityDisplayNameMap.set(normKey, { city: cleanCity, state: cleanState });
      }
    });

    const topCities = Array.from(cityNormalizedCountMap.entries())
      .map(([normKey, count]) => {
        const info = cityDisplayNameMap.get(normKey) || { city: normKey, state: '' };
        return { city: info.city, state: info.state, visitCount: count };
      })
      .sort((a, b) => b.visitCount - a.visitCount);

    // 4. TOP STATES (Case-Insensitive & 2-Letter Abbreviation)
    const stateNormalizedCountMap = new Map<string, number>();

    concerts.forEach(c => {
      const vObj = venues.find(v => v.id === c.venueId);
      const rawState = vObj?.stateProvince || 'IN';
      const cleanState = toStateAbbr(rawState);

      stateNormalizedCountMap.set(cleanState, (stateNormalizedCountMap.get(cleanState) || 0) + 1);
    });

    const topStates = Array.from(stateNormalizedCountMap.entries())
      .map(([state, count]) => ({ state, visitCount: count }))
      .sort((a, b) => b.visitCount - a.visitCount);

    // 5. TOP YEARS SORTED BY MOST CONCERTS ATTENDED DESCENDING!
    const yearMap = new Map<number, number>();
    concerts.forEach(c => {
      const dObj = parseConcertDate(c.date);
      const yr = dObj.getFullYear();
      if (!isNaN(yr)) {
        yearMap.set(yr, (yearMap.get(yr) || 0) + 1);
      }
    });

    const topYears = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.count - a.count || b.year - a.year);

    // 6. DAYS OF WEEK
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    concerts.forEach(c => {
      const dObj = parseConcertDate(c.date);
      const dayIndex = dObj.getDay();
      if (!isNaN(dayIndex)) {
        dayCounts[dayIndex]++;
      }
    });

    const topDaysOfWeek = days
      .map((day, idx) => ({
        day,
        count: dayCounts[idx],
        percentage: totalShows > 0 ? Math.round((dayCounts[idx] / totalShows) * 100) : 0,
      }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      totalShows,
      uniqueArtists,
      totalSongsWitnessed,
      uniqueVenues,
      totalInvestment,
      topArtists,
      topVenues,
      topCities,
      topStates,
      topYears,
      topDaysOfWeek,
    };
  }
}
