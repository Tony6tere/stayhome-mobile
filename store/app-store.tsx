import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { CURRENT_USER_AVATAR, LISTINGS, type ListingType } from '@/data/listings';
import { addDays, dayKey, nightsBetween, today } from '@/lib/format';

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type User = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
};

export type Booking = {
  id: string;
  /** Référence lisible affichée au voyageur, ex. « SH-7K2M4Q ». */
  reference: string;
  listingId: string;
  from: string;
  to: string;
  guests: number;
  nights: number;
  total: number;
  status: 'confirmee' | 'annulee';
  createdAt: number;
};

export type SearchQuery = {
  city: string;
  from: string | null;
  to: string | null;
  guests: number;
  type: ListingType | null;
};

type PersistedState = {
  user: User | null;
  favorites: string[];
  bookings: Booking[];
};

type AppContextValue = {
  /** false tant que le contenu du stockage local n'est pas relu */
  hydrated: boolean;
  user: User | null;
  favorites: string[];
  bookings: Booking[];
  search: SearchQuery;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
  setSearch: (patch: Partial<SearchQuery>) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt'>) => Booking;
  cancelBooking: (bookingId: string) => void;
};

/* -------------------------------------------------------------------------- */
/* Compte de démonstration                                                     */
/* -------------------------------------------------------------------------- */

export const DEMO_EMAIL = 'tony@stayhome.cm';
export const DEMO_PASSWORD = 'stayhome';

const DEMO_USER: User = {
  name: 'Tony Tere',
  email: DEMO_EMAIL,
  phone: '+237 6 99 00 11 22',
  avatar: CURRENT_USER_AVATAR,
  memberSince: '2024',
};

const STORAGE_KEY = 'stayhome.state.v1';

/** Référence courte, sans caractères ambigus (ni 0/O ni 1/I). */
function makeReference(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `SH-${out}`;
}

/** Réservation d'exemple pour que l'onglet « Réservations » ne soit pas vide au 1er lancement. */
function seedBookings(): Booking[] {
  const start = addDays(today(), 12);
  const end = addDays(start, 3);
  const listing = LISTINGS[0];
  const nights = nightsBetween(dayKey(start), dayKey(end));
  return [
    {
      id: 'seed-1',
      reference: 'SH-4KQ7M2',
      listingId: listing.id,
      from: dayKey(start),
      to: dayKey(end),
      guests: 2,
      nights,
      total: listing.price * nights,
      status: 'confirmee',
      createdAt: Date.now(),
    },
  ];
}

const defaultSearch: SearchQuery = {
  city: '',
  from: null,
  to: null,
  guests: 2,
  type: null,
};

const AppContext = createContext<AppContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearchState] = useState<SearchQuery>(defaultSearch);

  // Relecture du stockage local au démarrage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const saved = JSON.parse(raw) as Partial<PersistedState>;
          setUser(saved.user ?? null);
          setFavorites(Array.isArray(saved.favorites) ? saved.favorites : []);
          setBookings(
            Array.isArray(saved.bookings)
              ? // Une réservation enregistrée par une version antérieure peut ne pas
                // avoir de référence : on la complète au lieu d'afficher un vide.
                saved.bookings.map((b) => ({ ...b, reference: b.reference || makeReference() }))
              : seedBookings()
          );
        } else if (!cancelled) {
          setFavorites(['l4', 'l6']);
          setBookings(seedBookings());
        }
      } catch {
        // Stockage illisible (première install, quota, mode privé) : on repart d'un état neuf.
        if (!cancelled) {
          setFavorites(['l4', 'l6']);
          setBookings(seedBookings());
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Écriture : uniquement APRÈS hydratation, sinon l'état initial vide
  // écraserait les données déjà stockées.
  const skipFirstWrite = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    const payload: PersistedState = { user, favorites, bookings };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Écriture best-effort : une démo ne doit pas planter si le stockage refuse.
    });
  }, [hydrated, user, favorites, bookings]);

  const signIn = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { ok: false, error: 'Renseignez votre e-mail et votre mot de passe.' };
    }
    // Démo : un seul compte est reconnu.
    if (cleanEmail !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { ok: false, error: 'E-mail ou mot de passe incorrect.' };
    }
    setUser(DEMO_USER);
    return { ok: true };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return { ok: false, error: 'Indiquez votre nom complet.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { ok: false, error: 'Adresse e-mail invalide.' };
    if (password.length < 6) return { ok: false, error: 'Le mot de passe doit faire au moins 6 caractères.' };
    setUser({
      name: cleanName,
      email: cleanEmail,
      phone: '+237 6 00 00 00 00',
      avatar: CURRENT_USER_AVATAR,
      memberSince: `${new Date().getFullYear()}`,
    });
    return { ok: true };
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const isFavorite = useCallback((listingId: string) => favorites.includes(listingId), [favorites]);

  const toggleFavorite = useCallback((listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [listingId, ...prev]
    );
  }, []);

  const setSearch = useCallback((patch: Partial<SearchQuery>) => {
    setSearchState((prev) => ({ ...prev, ...patch }));
  }, []);

  const addBooking = useCallback((booking: Omit<Booking, 'id' | 'reference' | 'status' | 'createdAt'>) => {
    const created: Booking = {
      ...booking,
      id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reference: makeReference(),
      status: 'confirmee',
      createdAt: Date.now(),
    };
    setBookings((prev) => [created, ...prev]);
    return created;
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'annulee' as const } : b))
    );
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      hydrated,
      user,
      favorites,
      bookings,
      search,
      signIn,
      signUp,
      signOut,
      isFavorite,
      toggleFavorite,
      setSearch,
      addBooking,
      cancelBooking,
    }),
    [
      hydrated,
      user,
      favorites,
      bookings,
      search,
      signIn,
      signUp,
      signOut,
      isFavorite,
      toggleFavorite,
      setSearch,
      addBooking,
      cancelBooking,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé à l’intérieur de <AppProvider>.');
  return ctx;
}
