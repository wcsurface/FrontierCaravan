import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEncoreStore } from './useEncoreStore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, displayName: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkMe: () => Promise<void>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.token && data.user) {
            set({ user: data.user, token: data.token, isLoading: false, error: null });

            // Immediately pull user's saved concerts vault from Railway PostgreSQL DB
            useEncoreStore.getState().syncCloudPull(data.user.id);
            return true;
          } else {
            set({ error: data.error || 'Login failed', isLoading: false });
            return false;
          }
        } catch (e: any) {
          set({ error: e.message || 'Network error during login', isLoading: false });
          return false;
        }
      },

      register: async (email, displayName, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, displayName, password }),
          });

          const data = await res.json();

          if (res.ok && data.token && data.user) {
            set({ user: data.user, token: data.token, isLoading: false, error: null });

            // Immediately pull / initialize user's concerts vault in Railway PostgreSQL
            useEncoreStore.getState().syncCloudPull(data.user.id);
            return true;
          } else {
            set({ error: data.error || 'Registration failed', isLoading: false });
            return false;
          }
        } catch (e: any) {
          set({ error: e.message || 'Network error during registration', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        useEncoreStore.getState().clearAllData();
      },

      clearError: () => set({ error: null }),

      checkMe: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              set({ user: data.user });
              // Pull user's latest vault from Railway PostgreSQL DB
              useEncoreStore.getState().syncCloudPull(data.user.id);
            }
          } else {
            set({ user: null, token: null });
          }
        } catch (e) {
          // Offline mode
        }
      },
    }),
    {
      name: 'livelore_auth_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
