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
  date: number; // Unix Milliseconds
  venueId: string;
  headlineArtistId: string;
  openingArtistId?: string;
  tourName?: string;
  rating: number; // 0.0 - 5.0
  ticketPrice?: number;
  currency: string;
  ticketImageUri?: string;
  audioMemoUri?: string;
  generalNotes?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending_insert' | 'pending_update' | 'pending_delete';
}

export interface CreateConcertInput {
  date: number;
  headlineArtistName: string;
  openingArtistName?: string;
  venueName: string;
  venueCity?: string;
  venueCountry?: string;
  tourName?: string;
  rating?: number;
  ticketPrice?: number;
  notes?: string;
  setlist: { songTitle: string; position: number; isEncore: boolean; originalArtist?: string }[];
}

export interface ConcertStats {
  totalShows: number;
  uniqueArtists: number;
  totalSongsWitnessed: number;
  uniqueVenues: number;
  totalInvestment: number;
  topArtists: { name: string; timesSeen: number }[];
  topVenues: { name: string; city: string; visitCount: number }[];
  yearBreakdown: { year: number; count: number }[];
  dayOfWeekDistribution: { day: string; percentage: number }[];
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

    // Unique Artists
    const artistIds = new Set<string>();
    concerts.forEach(c => {
      artistIds.add(c.headlineArtistId);
      if (c.openingArtistId) artistIds.add(c.openingArtistId);
    });
    const uniqueArtists = artistIds.size;

    // Unique Venues
    const venueIds = new Set<string>();
    concerts.forEach(c => venueIds.add(c.venueId));
    const uniqueVenues = venueIds.size;

    // Total Financial Investment
    const totalInvestment = concerts.reduce((acc, curr) => acc + (curr.ticketPrice || 0), 0);

    // Top Artists
    const artistCountMap = new Map<string, number>();
    concerts.forEach(c => {
      const currentHead = artistCountMap.get(c.headlineArtistId) || 0;
      artistCountMap.set(c.headlineArtistId, currentHead + 1);
      if (c.openingArtistId) {
        const currentOpener = artistCountMap.get(c.openingArtistId) || 0;
        artistCountMap.set(c.openingArtistId, currentOpener + 1);
      }
    });

    const topArtists = Array.from(artistCountMap.entries())
      .map(([aId, count]) => {
        const artistObj = artists.find(a => a.id === aId);
        return { name: artistObj?.name || 'Unknown Artist', timesSeen: count };
      })
      .sort((a, b) => b.timesSeen - a.timesSeen)
      .slice(0, 5);

    // Top Venues
    const venueCountMap = new Map<string, number>();
    concerts.forEach(c => {
      const current = venueCountMap.get(c.venueId) || 0;
      venueCountMap.set(c.venueId, current + 1);
    });

    const topVenues = Array.from(venueCountMap.entries())
      .map(([vId, count]) => {
        const vObj = venues.find(v => v.id === vId);
        return { name: vObj?.name || 'Unknown Venue', city: vObj?.city || '', visitCount: count };
      })
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 5);

    // Year Breakdown
    const yearMap = new Map<number, number>();
    concerts.forEach(c => {
      const yr = new Date(c.date).getFullYear();
      yearMap.set(yr, (yearMap.get(yr) || 0) + 1);
    });

    const yearBreakdown = Array.from(yearMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    // Day of Week Distribution
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    concerts.forEach(c => {
      const dayIndex = new Date(c.date).getDay();
      dayCounts[dayIndex]++;
    });

    const dayOfWeekDistribution = days.map((day, idx) => ({
      day,
      percentage: totalShows > 0 ? Math.round((dayCounts[idx] / totalShows) * 100) : 0,
    }));

    return {
      totalShows,
      uniqueArtists,
      totalSongsWitnessed,
      uniqueVenues,
      totalInvestment,
      topArtists,
      topVenues,
      yearBreakdown,
      dayOfWeekDistribution,
    };
  }
}
