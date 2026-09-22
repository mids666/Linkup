import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  isLight?: boolean;
  previewColors: [string, string, string]; // [bg, surface, accent]
  cssVars: {
    bg: string;
    bgSubtle: string;
    surface: string;
    surfaceSolid: string;
    surfaceHover: string;
    card: string;
    border: string;
    borderStrong: string;
    text: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    accentText: string;
    accentSubtle: string;
    accentBorder: string;
    glow: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'cyber-dark': {
    id: 'cyber-dark',
    name: 'Cyber Slate',
    tagline: 'Midnight & Indigo',
    description: 'Deep midnight slate canvas with crisp indigo & neon blue electric accents',
    isLight: false,
    previewColors: ['#030712', '#0f172a', '#6366f1'],
    cssVars: {
      bg: '#030712',
      bgSubtle: '#090e1a',
      surface: 'rgba(15, 23, 42, 0.95)',
      surfaceSolid: '#0f172a',
      surfaceHover: '#1e293b',
      card: '#0f172a',
      border: '#1e293b',
      borderStrong: '#334155',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentText: '#ffffff',
      accentSubtle: 'rgba(99, 102, 241, 0.15)',
      accentBorder: 'rgba(99, 102, 241, 0.4)',
      glow: 'rgba(99, 102, 241, 0.3)',
    },
  },
  'neon-violet': {
    id: 'neon-violet',
    name: 'Neon Violet',
    tagline: 'Obsidian & Purple Neon',
    description: 'Vivid cyberpunk nocturnal amethyst with glowing violet and magenta borders',
    isLight: false,
    previewColors: ['#090214', '#1d0938', '#a855f7'],
    cssVars: {
      bg: '#090214',
      bgSubtle: '#130429',
      surface: 'rgba(26, 7, 50, 0.95)',
      surfaceSolid: '#1d0938',
      surfaceHover: '#310f5e',
      card: '#1c0836',
      border: '#3b126e',
      borderStrong: '#6b21a8',
      text: '#faf5ff',
      textMuted: '#d8b4fe',
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentText: '#ffffff',
      accentSubtle: 'rgba(168, 85, 247, 0.2)',
      accentBorder: 'rgba(168, 85, 247, 0.5)',
      glow: 'rgba(168, 85, 247, 0.4)',
    },
  },
  'sunset-ember': {
    id: 'sunset-ember',
    name: 'Sunset Ember',
    tagline: 'Warm Charcoal & Blaze',
    description: 'Molten ember atmosphere with blazing orange, terracotta borders & fiery gold',
    isLight: false,
    previewColors: ['#130702', '#2b1206', '#f97316'],
    cssVars: {
      bg: '#130702',
      bgSubtle: '#1f0c04',
      surface: 'rgba(38, 16, 7, 0.95)',
      surfaceSolid: '#2b1206',
      surfaceHover: '#451d0b',
      card: '#2c1307',
      border: '#5a260e',
      borderStrong: '#9a3412',
      text: '#fffbeb',
      textMuted: '#fdba74',
      accent: '#f97316',
      accentHover: '#ea580c',
      accentText: '#ffffff',
      accentSubtle: 'rgba(249, 115, 22, 0.2)',
      accentBorder: 'rgba(249, 115, 22, 0.5)',
      glow: 'rgba(249, 115, 22, 0.4)',
    },
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Cyber Emerald',
    tagline: 'Carbon & Neon Matrix',
    description: 'High-tech dark carbon and mint matrix with vivid radioactive emerald glow',
    isLight: false,
    previewColors: ['#021209', '#062b17', '#10b981'],
    cssVars: {
      bg: '#021209',
      bgSubtle: '#041f11',
      surface: 'rgba(5, 34, 18, 0.95)',
      surfaceSolid: '#062b17',
      surfaceHover: '#0b4526',
      card: '#072e19',
      border: '#0d542e',
      borderStrong: '#059669',
      text: '#ecfdf5',
      textMuted: '#6ee7b7',
      accent: '#10b981',
      accentHover: '#059669',
      accentText: '#ffffff',
      accentSubtle: 'rgba(16, 185, 129, 0.2)',
      accentBorder: 'rgba(16, 185, 129, 0.5)',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    tagline: 'Deep Polar Abyss & Cyan',
    description: 'Cold Arctic abyss oceanic navy paired with crystal glacier cyan & ice highlights',
    isLight: false,
    previewColors: ['#021424', '#092c4d', '#06b6d4'],
    cssVars: {
      bg: '#021424',
      bgSubtle: '#051e36',
      surface: 'rgba(6, 34, 59, 0.95)',
      surfaceSolid: '#092c4d',
      surfaceHover: '#0e4475',
      card: '#082d50',
      border: '#0f528c',
      borderStrong: '#0284c7',
      text: '#f0f9ff',
      textMuted: '#7dd3fc',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentText: '#ffffff',
      accentSubtle: 'rgba(6, 182, 212, 0.2)',
      accentBorder: 'rgba(6, 182, 212, 0.5)',
      glow: 'rgba(6, 182, 212, 0.4)',
    },
  },
  'clean-light': {
    id: 'clean-light',
    name: 'Clean Daylight',
    tagline: 'Modern High-Contrast Light',
    description: 'Crisp, bright minimalist daytime UI with porcelain surfaces & bold royal blue',
    isLight: true,
    previewColors: ['#f8fafc', '#ffffff', '#2563eb'],
    cssVars: {
      bg: '#f8fafc',
      bgSubtle: '#edf2f7',
      surface: 'rgba(255, 255, 255, 0.96)',
      surfaceSolid: '#ffffff',
      surfaceHover: '#f1f5f9',
      card: '#ffffff',
      border: '#cbd5e1',
      borderStrong: '#94a3b8',
      text: '#0f172a',
      textMuted: '#475569',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      accentText: '#ffffff',
      accentSubtle: 'rgba(37, 99, 235, 0.12)',
      accentBorder: 'rgba(37, 99, 235, 0.35)',
      glow: 'rgba(37, 99, 235, 0.25)',
    },
  },
};

const THEME_STORAGE_KEY = 'vchat_selected_theme';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && THEMES[saved]) {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load theme:', e);
  }
  return 'cyber-dark';
}

export function saveStoredTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch (e) {
    console.warn('Failed to save theme:', e);
  }
}

/**
 * Directly updates DOM attributes and inline CSS variables on document.documentElement
 * so that all elements react dynamically and immediately across the entire page.
 */
export function applyThemeToDocument(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const theme = THEMES[themeId] || THEMES['cyber-dark'];

  root.setAttribute('data-theme', themeId);
  document.body.setAttribute('data-theme', themeId);

  // Apply CSS variables explicitly to root
  root.style.setProperty('--theme-bg', theme.cssVars.bg);
  root.style.setProperty('--theme-bg-subtle', theme.cssVars.bgSubtle);
  root.style.setProperty('--theme-surface', theme.cssVars.surface);
  root.style.setProperty('--theme-surface-solid', theme.cssVars.surfaceSolid);
  root.style.setProperty('--theme-surface-hover', theme.cssVars.surfaceHover);
  root.style.setProperty('--theme-card', theme.cssVars.card);
  root.style.setProperty('--theme-border', theme.cssVars.border);
  root.style.setProperty('--theme-border-strong', theme.cssVars.borderStrong);
  root.style.setProperty('--theme-text', theme.cssVars.text);
  root.style.setProperty('--theme-text-muted', theme.cssVars.textMuted);
  root.style.setProperty('--theme-accent', theme.cssVars.accent);
  root.style.setProperty('--theme-accent-hover', theme.cssVars.accentHover);
  root.style.setProperty('--theme-accent-text', theme.cssVars.accentText);
  root.style.setProperty('--theme-accent-subtle', theme.cssVars.accentSubtle);
  root.style.setProperty('--theme-accent-border', theme.cssVars.accentBorder);
  root.style.setProperty('--theme-glow', theme.cssVars.glow);

  if (theme.isLight) {
    root.classList.add('light-mode');
    root.classList.remove('dark-mode');
  } else {
    root.classList.add('dark-mode');
    root.classList.remove('light-mode');
  }
}
