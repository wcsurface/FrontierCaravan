import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Artist,
  Venue,
  Concert,
  SetlistItem,
  CreateConcertInput,
  AnalyticsEngine,
  ConcertStats,
} from '../engine/concertService';

interface EncoreState {
  // Vault Relational Tables
  concerts: Concert[];
  artists: Artist[];
  venues: Venue[];
  setlistItems: SetlistItem[];

  // User Preferences & Developer BYOK Settings
  setlistFmApiKey: string;
  isCloudSyncEnabled: boolean;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';

  // Actions
  saveConcert: (input: CreateConcertInput) => string;
  deleteConcert: (concertId: string) => void;
  setSetlistFmApiKey: (key: string) => void;
  getConcertStats: () => ConcertStats;
  exportVaultJson: () => string;
  importVaultJson: (jsonStr: string) => boolean;
  syncCloud: () => Promise<void>;
}

const INITIAL_ARTISTS: Artist[] = [
  { id: 'a_01', name: 'Nirvana', disambiguation: 'US Grunge Band', createdAt: Date.now() },
  { id: 'a_02', name: 'Radiohead', disambiguation: 'UK Alternative Rock', createdAt: Date.now() },
];

const INITIAL_VENUES: Venue[] = [
  { id: 'v_01', name: 'The Paramount Theatre', city: 'Seattle', country: 'USA', createdAt: Date.now() },
  { id: 'v_02', name: 'Red Rocks Amphitheatre', city: 'Morrison', country: 'USA', createdAt: Date.now() },
];

const INITIAL_CONCERTS: Concert[] = [
  {
    id: 'c_01',
    date: new Date('1991-10-31').getTime(),
    venueId: 'v_01',
    headlineArtistId: 'a_01',
    tourName: 'Nevermind North American Tour',
    rating: 5.0,
    ticketPrice: 25,
    currency: 'USD',
    generalNotes: 'Legendary Halloween show in Seattle. High energy, broken instruments!',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    syncStatus: 'synced',
  },
];

const INITIAL_SETLIST: SetlistItem[] = [
  { id: 's_01', concertId: 'c_01', artistId: 'a_01', songTitle: 'Jesus Doesn\'t Want Me for a Sunbeam', position: 1, isEncore: false },
  { id: 's_02', concertId: 'c_01', artistId: 'a_01', songTitle: 'Aneurysm', position: 2, isEncore: false },
  { id: 's_03', concertId: 'c_01', artistId: 'a_01', songTitle: 'Smells Like Teen Spirit', position: 3, isEncore: false },
  { id: 's_04', concertId: 'c_01', artistId: 'a_01', songTitle: 'Endless, Nameless', position: 4, isEncore: true, encoreNumber: 1 },
];

export const useEncoreStore = create<EncoreState>()(
  persist(
    (set, get) => ({
      concerts: INITIAL_CONCERTS,
      artists: INITIAL_ARTISTS,
      venues: INITIAL_VENUES,
      setlistItems: INITIAL_SETLIST,

      setlistFmApiKey: '',
      isCloudSyncEnabled: true,
      cloudSyncStatus: 'synced',

      saveConcert: (input) => {
        const { concerts, artists, venues, setlistItems } = get();

        // 1. Find or create Artist
        let artist = artists.find(a => a.name.toLowerCase() === input.artistName.toLowerCase());
        if (!artist) {
          artist = {
            id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.artistName,
            createdAt: Date.now(),
          };
          artists.push(artist);
        }

        // 2. Find or create Venue
        let venue = venues.find(v => v.name.toLowerCase() === input.venueName.toLowerCase() && v.city.toLowerCase() === input.venueCity.toLowerCase());
        if (!venue) {
          venue = {
            id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.venueName,
            city: input.venueCity,
            country: input.venueCountry || 'USA',
            createdAt: Date.now(),
          };
          venues.push(venue);
        }

        // 3. Create Concert
        const concertId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newConcert: Concert = {
          id: concertId,
          date: input.date,
          venueId: venue.id,
          headlineArtistId: artist.id,
          tourName: input.tourName,
          rating: input.rating || 5.0,
          ticketPrice: input.ticketPrice || 0,
          currency: 'USD',
          generalNotes: input.notes || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending_insert',
        };

        // 4. Create Setlist Items
        const newSetlistItems: SetlistItem[] = input.setlist.map(s => ({
          id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          concertId,
          artistId: artist!.id,
          songTitle: s.songTitle,
          position: s.position,
          isEncore: s.isEncore,
          originalArtist: s.originalArtist,
        }));

        set({
          concerts: [newConcert, ...concerts],
          artists: [...artists],
          venues: [...venues],
          setlistItems: [...setlistItems, ...newSetlistItems],
          cloudSyncStatus: 'pending_insert' as any,
        });

        // Trigger background cloud sync if enabled
        get().syncCloud();

        return concertId;
      },

      deleteConcert: (concertId) => {
        const { concerts, setlistItems } = get();
        set({
          concerts: concerts.filter(c => c.id !== concertId),
          setlistItems: setlistItems.filter(s => s.concertId !== concertId),
        });
      },

      setSetlistFmApiKey: (key) => set({ setlistFmApiKey: key }),

      getConcertStats: () => {
        const { concerts, artists, venues, setlistItems } = get();
        return AnalyticsEngine.calculateStats(concerts, artists, venues, setlistItems);
      },

      exportVaultJson: () => {
        const { concerts, artists, venues, setlistItems } = get();
        return JSON.stringify({ concerts, artists, venues, setlistItems }, null, 2);
      },

      importVaultJson: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.concerts && parsed.artists && parsed.venues) {
            set({
              concerts: parsed.concerts,
              artists: parsed.artists,
              venues: parsed.venues,
              setlistItems: parsed.setlistItems || [],
            });
            return true;
          }
        } catch (e) {
          console.error('[Encore Vault] Import failed:', e);
        }
        return false;
      },

      syncCloud: async () => {
        const { concerts, setlistItems } = get();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';
        set({ cloudSyncStatus: 'syncing' });

        try {
          const res = await fetch(`${backendUrl}/api/sync/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: 'device_pwa_01', concerts, setlistItems }),
          });

          if (res.ok) {
            set({ cloudSyncStatus: 'synced' });
          } else {
            set({ cloudSyncStatus: 'offline' });
          }
        } catch (e) {
          set({ cloudSyncStatus: 'offline' });
        }
      },
    }),
    {
      name: 'encore_vault_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
