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

      // VIP Status (Defaults to true for wcsurface@gmail.com and unlocked users)
      isPremium: true,
      ticketTheme: 'multicolor',
      setlistFmApiKey: '',
      isCloudSyncEnabled: true,
      cloudSyncStatus: 'synced',

      saveConcert: (input: CreateConcertInput) => {
        const { concerts, artists, venues, setlistItems } = get();

        // 1. Create or Find Headline Artist
        let headliner = artists.find(
          (a) => a.name.toLowerCase() === input.headlineArtistName.trim().toLowerCase()
        );
        if (!headliner) {
          headliner = {
            id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: input.headlineArtistName.trim(),
            createdAt: Date.now(),
          };
          artists.push(headliner);
        }

        // 2. Create or Find Opener
        let opener: Artist | undefined = undefined;
        if (input.openingArtistName && input.openingArtistName.trim().length > 0) {
          opener = artists.find(
            (a) => a.name.toLowerCase() === input.openingArtistName!.trim().toLowerCase()
          );
          if (!opener) {
            opener = {
              id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: input.openingArtistName.trim(),
              createdAt: Date.now(),
            };
            artists.push(opener);
          }
        }

        // 3. Create or Find Venue
        const vCity = (input.venueCity || '').trim();
        const vCountry = (input.venueCountry || 'USA').trim();
        const vState = (input.venueState || '').trim();

        let venueObj = venues.find(
          (v) =>
            v.name.toLowerCase() === input.venueName.trim().toLowerCase() &&
            v.city.toLowerCase() === vCity.toLowerCase()
        );
        if (!venueObj) {
          venueObj = {
            id: `ven_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: input.venueName.trim(),
            city: vCity,
            stateProvince: vState,
            country: vCountry,
            createdAt: Date.now(),
          };
          venues.push(venueObj);
        }

        // 4. Create Concert Record
        const newConcertId = `con_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newConcert: Concert = {
          id: newConcertId,
          headlineArtistId: headliner.id,
          openingArtistId: opener ? opener.id : undefined,
          venueId: venueObj.id,
          date: input.date,
          ticketPrice: input.ticketPrice,
          personalRating: input.rating,
          generalNotes: input.notes,
          photoUris: input.photoUris || [],
          hasSetlist: input.setlist && input.setlist.length > 0,
        };

        const updatedConcerts = [newConcert, ...concerts];

        // 5. Save Parsed Setlist Items
        const newSetlistItems: SetlistItem[] = [];
        if (input.setlist && input.setlist.length > 0) {
          input.setlist.forEach((track) => {
            newSetlistItems.push({
              id: `stl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              concertId: newConcertId,
              artistId: headliner!.id,
              songTitle: track.title,
              position: track.position,
              isEncore: track.isEncore,
              notes: track.notes,
            });
          });
        }

        set({
          concerts: updatedConcerts,
          artists: [...artists],
          venues: [...venues],
          setlistItems: [...setlistItems, ...newSetlistItems],
        });

        // Trigger Cloud Backup
        get().syncCloudPush();

        return newConcertId;
      },

      updateConcert: (concertId, input) => {
        const { concerts, artists, venues } = get();

        // 1. Create or Find Headline Artist
        let headliner = artists.find(
          (a) => a.name.toLowerCase() === input.headlineArtistName.trim().toLowerCase()
        );
        if (!headliner) {
          headliner = {
            id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: input.headlineArtistName.trim(),
            createdAt: Date.now(),
          };
          artists.push(headliner);
        }

        // 2. Create or Find Opener
        let opener: Artist | undefined = undefined;
        if (input.openingArtistName && input.openingArtistName.trim().length > 0) {
          opener = artists.find(
            (a) => a.name.toLowerCase() === input.openingArtistName!.trim().toLowerCase()
          );
          if (!opener) {
            opener = {
              id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: input.openingArtistName.trim(),
              createdAt: Date.now(),
            };
            artists.push(opener);
          }
        }

        // 3. Create or Find Venue
        const vCityEdit = (input.venueCity || '').trim();
        const vCountryEdit = (input.venueCountry || 'USA').trim();
        const vStateEdit = (input.venueState || '').trim();

        let venueObj = venues.find(
          (v) =>
            v.name.toLowerCase() === input.venueName.trim().toLowerCase() &&
            v.city.toLowerCase() === vCityEdit.toLowerCase()
        );
        if (!venueObj) {
          venueObj = {
            id: `ven_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: input.venueName.trim(),
            city: vCityEdit,
            stateProvince: vStateEdit,
            country: vCountryEdit,
            createdAt: Date.now(),
          };
          venues.push(venueObj);
        }

        const updatedConcerts = concerts.map((c) => {
          if (c.id === concertId) {
            return {
              ...c,
              headlineArtistId: headliner!.id,
              openingArtistId: opener ? opener.id : undefined,
              venueId: venueObj!.id,
              date: input.date,
              generalNotes: input.notes,
              photoUris: input.photoUris || [],
              hasSetlist: input.setlist && input.setlist.length > 0,
            };
          }
          return c;
        });

        set({
          concerts: updatedConcerts,
          artists: [...artists],
          venues: [...venues],
        });

        get().syncCloudPush();
      },

      deleteConcert: (concertId) => {
        const { concerts, setlistItems } = get();
        set({
          concerts: concerts.filter((c) => c.id !== concertId),
          setlistItems: setlistItems.filter((s) => s.concertId !== concertId),
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
      },

      setIsPremium: (status) => set({ isPremium: status }),

      setTicketTheme: (theme) => set({ ticketTheme: theme }),

      setSetlistFmApiKey: (key) => set({ setlistFmApiKey: key }),

      getConcertStats: () => {
        const { concerts, artists, venues } = get();
        return AnalyticsEngine.calculateStats(concerts, artists, venues);
      },

      exportVaultJson: () => {
        const state = get();
        return JSON.stringify({
          version: '1.0',
          exportedAt: new Date().toISOString(),
          concerts: state.concerts,
          artists: state.artists,
          venues: state.venues,
          setlistItems: state.setlistItems,
        });
      },

      importVaultJson: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.concerts && Array.isArray(parsed.concerts)) {
            set({
              concerts: parsed.concerts,
              artists: parsed.artists || [],
              venues: parsed.venues || [],
              setlistItems: parsed.setlistItems || [],
            });
            return true;
          }
          return false;
        } catch (e) {
          return false;
        }
      },

      syncCloudPush: async () => {
        const authUser = useAuthStore.getState().user;
        if (!authUser || !authUser.id) return;

        set({ cloudSyncStatus: 'syncing' });
        try {
          const state = get();
          await fetch(`${BACKEND_URL}/api/sync/push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authUser.id,
              concertsData: {
                concerts: state.concerts,
                artists: state.artists,
                venues: state.venues,
                setlistItems: state.setlistItems,
              },
            }),
          });
          set({ cloudSyncStatus: 'synced' });
        } catch (e) {
          set({ cloudSyncStatus: 'offline' });
        }
      },

      syncCloudPull: async (userId) => {
        if (!userId) return;

        set({ cloudSyncStatus: 'syncing' });
        try {
          const res = await fetch(`${BACKEND_URL}/api/sync/pull?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.concertsData) {
              const cloud = data.concertsData;
              set({
                concerts: cloud.concerts || [],
                artists: cloud.artists || [],
                venues: cloud.venues || [],
                setlistItems: cloud.setlistItems || [],
                cloudSyncStatus: 'synced',
              });
            }
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
