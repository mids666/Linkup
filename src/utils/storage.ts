import { FavoriteUser, UserProfile } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: 'vchat_user_profile',
  FAVORITES: 'vchat_favorites',
  BLOCKED: 'vchat_blocked_users',
  PREFERENCES: 'vchat_user_prefs',
};

const RANDOM_NAMES = [
  'Atlas', 'Nova', 'Echo', 'Phoenix', 'Orion', 'Zephyr',
  'Solaris', 'Vesper', 'CyberPulse', 'PixelVoyager', 'Aero', 'Luna',
];

const AVATAR_SEEDS = [
  'adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei',
  'micah', 'miniavs', 'personas', 'shapes'
];

export function getOrCreateUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading profile from storage:', e);
  }

  const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const randomSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  const newProfile: UserProfile = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${randomName}_${Math.floor(100 + Math.random() * 900)}`,
    avatarSeed: randomSeed,
    age: 21,
    gender: 'male',
    country: 'United States',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    genderPreference: 'any',
    hasSignedUp: false,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
  } catch (e) {
    console.warn('Failed saving profile to storage:', e);
  }

  return newProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed saving profile:', e);
  }
}

export function getFavorites(): FavoriteUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed reading favorites:', e);
  }
  return [];
}

export function saveFavorite(user: FavoriteUser): void {
  try {
    const list = getFavorites();
    const existingIndex = list.findIndex(item => item.id === user.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...user, lastMetAt: Date.now() };
    } else {
      list.unshift({ ...user, addedAt: Date.now(), lastMetAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed saving favorite:', e);
  }
}

export function updateFavoriteNote(userId: string, notes: string): void {
  try {
    const list = getFavorites();
    const item = list.find(f => f.id === userId);
    if (item) {
      item.notes = notes;
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed updating favorite note:', e);
  }
}

export function removeFavorite(userId: string): void {
  try {
    const list = getFavorites().filter(item => item.id !== userId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed removing favorite:', e);
  }
}

export function isUserFavorite(userId: string): boolean {
  return getFavorites().some(item => item.id === userId);
}

export function getBlockedUsers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKED);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed reading blocked users:', e);
  }
  return [];
}

export function blockUser(userId: string): void {
  try {
    const list = getBlockedUsers();
    if (!list.includes(userId)) {
      list.push(userId);
      localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed blocking user:', e);
  }
}

export function unblockUser(userId: string): void {
  try {
    const list = getBlockedUsers().filter(id => id !== userId);
    localStorage.setItem(STORAGE_KEYS.BLOCKED, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed unblocking user:', e);
  }
}
