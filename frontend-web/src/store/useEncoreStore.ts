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
import { useAuthStore } from './useAuthStore';

interface EncoreState {
  // Vault Relational Tables
  concerts: Concert[];
  artists: Artist[];
  venues: Venue[];
  setlistItems: SetlistItem[];

  // Premium Status
  isPremium: boolean;

  // Ticket Stub Theme ('multicolor' | 'classic')
  ticketTheme: 'multicolor' | 'classic';

  // Settings
  setlistFmApiKey: string;
  isCloudSyncEnabled: boolean;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';

  // Actions
  saveConcert: (input: CreateConcertInput) => string;
  updateConcert: (concertId: string, input: CreateConcertInput) => void;
  deleteConcert: (concertId: string) => void;
  clearAllData: () => void;
  setIsPremium: (status: boolean) => void;
  setTicketTheme: (theme: 'multicolor' | 'classic') => void;
  setSetlistFmApiKey: (key: string) => void;
  getConcertStats: () => ConcertStats;
  exportVaultJson: () => string;
  importVaultJson: (jsonStr: string) => boolean;
  syncCloudPush: () => Promise<void>;
  syncCloudPull: (userId: string) => Promise<void>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontier-caravan-9r14f56ys-surface7.vercel.app';

export const useEncoreStore = create<EncoreState>()(
  persist(
    (set, get) => ({
      concerts: [],
      artists: [],
      venues: [],
      setlistItems: [],

      isPremium: false,
      ticketTheme: 'multicolor',
      setlistFmApiKey: '',
      isCloudSyncEnabled: true,
      cloudSyncStatus: 'synced',

      setIsPremium: (status) => set({ isPremium: status }),
      setTicketTheme: (theme) => set({ ticketTheme: theme }),

      saveConcert: (input) => {
        const { concerts, artists, venues, setlistItems } = get();

        // 1. Find or create Headliner Artist
        let headliner = artists.find(a => a.name.toLowerCase() === input.headlineArtistName.toLowerCase());
        if (!headliner) {
          headliner = {
            id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.headlineArtistName,
            createdAt: Date.now(),
          };
          artists.push(headliner);
        }

        // 2. Find or create Opener Artist (if specified)
        let opener: Artist | undefined = undefined;
        if (input.openingArtistName && input.openingArtistName.trim().length > 0) {
          opener = artists.find(a => a.name.toLowerCase() === input.openingArtistName!.toLowerCase());
          if (!opener) {
            opener = {
              id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: input.openingArtistName.trim(),
              createdAt: Date.now(),
            };
            artists.push(opener);
          }
        }

        // 3. Find or create Venue
        let venue = venues.find(v => v.name.toLowerCase() === input.venueName.toLowerCase() && v.city.toLowerCase() === (input.venueCity || 'Local').toLowerCase());
        if (!venue) {
          venue = {
            id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.venueName,
            city: input.venueCity || 'Noblesville',
            country: input.venueCountry || 'USA',
            createdAt: Date.now(),
          };
          venues.push(venue);
        }

        // 4. Create Concert
        const concertId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newConcert: Concert = {
          id: concertId,
          date: input.date,
          venueId: venue.id,
          headlineArtistId: headliner.id,
          openingArtistId: opener?.id,
          tourName: input.tourName,
          rating: input.rating || 5.0,
          ticketPrice: input.ticketPrice || 0,
          currency: 'USD',
          photoUris: input.photoUris || [],
          generalNotes: input.notes || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending_insert',
        };

        // 5. Create Setlist Items
        const newSetlistItems: SetlistItem[] = input.setlist.map(s => ({
          id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          concertId,
          artistId: headliner!.id,
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
          cloudSyncStatus: 'syncing',
        });

        get().syncCloudPush();

        return concertId;
      },

      updateConcert: (concertId, input) => {
        const { concerts, artists, venues, setlistItems } = get();

        const existingConcertIndex = concerts.findIndex(c => c.id === concertId);
        if (existingConcertIndex < 0) return;

        // 1. Find or create Headliner Artist
        let headliner = artists.find(a => a.name.toLowerCase() === input.headlineArtistName.toLowerCase());
        if (!headliner) {
          headliner = {
            id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.headlineArtistName,
            createdAt: Date.now(),
          };
          artists.push(headliner);
        }

        // 2. Find or create Opener
        let opener: Artist | undefined = undefined;
        if (input.openingArtistName && input.openingArtistName.trim().length > 0) {
          opener = artists.find(a => a.name.toLowerCase() === input.openingArtistName!.toLowerCase());
          if (!opener) {
            opener = {
              id: `a_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: input.openingArtistName.trim(),
              createdAt: Date.now(),
            };
            artists.push(opener);
          }
        }

        // 3. Find or create Venue
        let venue = venues.find(v => v.name.toLowerCase() === input.venueName.toLowerCase() && v.city.toLowerCase() === (input.venueCity || 'Local').toLowerCase());
        if (!venue) {
          venue = {
            id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: input.venueName,
            city: input.venueCity || 'Noblesville',
            country: input.venueCountry || 'USA',
            createdAt: Date.now(),
          };
          venues.push(venue);
        }

        // 4. Update Concert in-place
        const updatedConcerts = [...concerts];
        updatedConcerts[existingConcertIndex] = {
          ...updatedConcerts[existingConcertIndex],
          date: input.date,
          venueId: venue.id,
          headlineArtistId: headliner.id,
          openingArtistId: opener?.id,
          tourName: input.tourName,
          photoUris: input.photoUris || [],
          generalNotes: input.notes || '',
          updatedAt: Date.now(),
          syncStatus: 'pending_update',
        };

        // 5. Replace Setlist Items
        const remainingSetlistItems = setlistItems.filter(s => s.concertId !== concertId);
        const newSetlistItems: SetlistItem[] = input.setlist.map(s => ({
          id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          concertId,
          artistId: headliner!.id,
          songTitle: s.songTitle,
          position: s.position,
          isEncore: s.isEncore,
          originalArtist: s.originalArtist,
        }));

        set({
          concerts: updatedConcerts,
          artists: [...artists],
          venues: [...venues],
          setlistItems: [...remainingSetlistItems, ...newSetlistItems],
          cloudSyncStatus: 'syncing',
        });

        get().syncCloudPush();
      },

      deleteConcert: (concertId) => {
        const { concerts, setlistItems } = get();
        set({
          concerts: concerts.filter(c => c.id !== concertId),
          setlistItems: setlistItems.filter(s => s.concertId !== concertId),
        });
        get().syncCloudPush();
      },

      clearAllData: () => {
        set({
          concerts: [],
          artists: [],
          venues: [],
          setlistItems: [],
        });
        get().syncCloudPush();
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
            get().syncCloudPush();
            return true;
          }
        } catch (e) {
          console.error('[LiveLore Vault] Import failed:', e);
        }
        return false;
      },

      syncCloudPush: async () => {
        const { concerts, artists, venues, setlistItems } = get();
        const user = useAuthStore.getState().user;

        if (!user || !user.id) {
          set({ cloudSyncStatus: 'offline' });
          return;
        }

        set({ cloudSyncStatus: 'syncing' });

        try {
          const res = await fetch(`${BACKEND_URL}/api/sync/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              concertsData: { concerts, artists, venues, setlistItems },
            }),
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

      syncCloudPull: async (userId: string) => {
        if (!userId) return;
        set({ cloudSyncStatus: 'syncing' });

        try {
          const res = await fetch(`${BACKEND_URL}/api/sync/pull?userId=${userId}`);

          if (res.ok) {
            const data = await res.json();
            if (data.concertsData) {
              const vault = data.concertsData;
              set({
                concerts: vault.concerts || [],
                artists: vault.artists || [],
                venues: vault.venues || [],
                setlistItems: vault.setlistItems || [],
                cloudSyncStatus: 'synced',
              });
            }
          } else {
            set({ cloudSyncStatus: 'offline' });
          }
        } catch (e) {
          set({ cloudSyncStatus: 'offline' });
        }
      },
    }),
    {
      name: 'livelore_vault_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
