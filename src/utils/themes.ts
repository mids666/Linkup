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
  'apple-dark': {
    id: 'apple-dark',
    name: 'Space Black',
    tagline: 'Apple Pro Dark',
    description: 'Pristine OLED dark canvas, frosted glass surfaces, and Cupertino Retina blue accents',
    isLight: false,
    previewColors: ['#000000', '#161618', '#2997ff'],
    cssVars: {
      bg: '#000000',
      bgSubtle: '#0a0a0c',
      surface: 'rgba(22, 22, 24, 0.85)',
      surfaceSolid: '#161618',
      surfaceHover: '#232326',
      card: '#161618',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      text: '#f5f5f7',
      textMuted: '#86868b',
      accent: '#2997ff',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(41, 151, 255, 0.12)',
      accentBorder: 'rgba(41, 151, 255, 0.3)',
      glow: 'rgba(41, 151, 255, 0.12)',
    },
  },
  'apple-light': {
    id: 'apple-light',
    name: 'Studio Light',
    tagline: 'Apple Official Clean',
    description: 'Minimalist porcelain canvas, pure white floating glass cards, and crisp typography',
    isLight: true,
    previewColors: ['#f5f5f7', '#ffffff', '#0071e3'],
    cssVars: {
      bg: '#f5f5f7',
      bgSubtle: '#ebebed',
      surface: 'rgba(255, 255, 255, 0.88)',
      surfaceSolid: '#ffffff',
      surfaceHover: '#f5f5f7',
      card: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      borderStrong: 'rgba(0, 0, 0, 0.14)',
      text: '#1d1d1f',
      textMuted: '#6e6e73',
      accent: '#0071e3',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(0, 113, 227, 0.08)',
      accentBorder: 'rgba(0, 113, 227, 0.25)',
      glow: 'rgba(0, 113, 227, 0.1)',
    },
  },
  'apple-titanium': {
    id: 'apple-titanium',
    name: 'Natural Titanium',
    tagline: 'Brushed Titanium Pro',
    description: 'Subdued metallic gray tones inspired by titanium hardware and studio displays',
    isLight: false,
    previewColors: ['#121215', '#1d1e23', '#e2e4ea'],
    cssVars: {
      bg: '#121215',
      bgSubtle: '#191a20',
      surface: 'rgba(29, 30, 35, 0.85)',
      surfaceSolid: '#1d1e23',
      surfaceHover: '#282930',
      card: '#1d1e23',
      border: 'rgba(255, 255, 255, 0.09)',
      borderStrong: 'rgba(255, 255, 255, 0.18)',
      text: '#f5f5f7',
      textMuted: '#9a9a9e',
      accent: '#e2e4ea',
      accentHover: '#ffffff',
      accentText: '#121215',
      accentSubtle: 'rgba(226, 228, 234, 0.12)',
      accentBorder: 'rgba(226, 228, 234, 0.28)',
      glow: 'rgba(226, 228, 234, 0.08)',
    },
  },
  'apple-midnight': {
    id: 'apple-midnight',
    name: 'Midnight Navy',
    tagline: 'Cupertino Night',
    description: 'Deep nocturnal indigo canvas with calm cobalt accents and frosted glass',
    isLight: false,
    previewColors: ['#040711', '#0d1527', '#388bfd'],
    cssVars: {
      bg: '#040711',
      bgSubtle: '#091022',
      surface: 'rgba(13, 21, 39, 0.85)',
      surfaceSolid: '#0d1527',
      surfaceHover: '#15223f',
      card: '#0d1527',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(56, 139, 253, 0.22)',
      text: '#f5f5f7',
      textMuted: '#8b9bb4',
      accent: '#388bfd',
      accentHover: '#1f6feb',
      accentText: '#ffffff',
      accentSubtle: 'rgba(56, 139, 253, 0.12)',
      accentBorder: 'rgba(56, 139, 253, 0.3)',
      glow: 'rgba(56, 139, 253, 0.1)',
    },
  },
  // Legacy aliases mapped gracefully to Apple themes:
  'cyber-dark': {
    id: 'apple-dark',
    name: 'Space Black',
    tagline: 'Apple Pro Dark',
    description: 'Pristine OLED dark canvas, frosted glass surfaces, and Cupertino Retina blue accents',
    isLight: false,
    previewColors: ['#000000', '#161618', '#2997ff'],
    cssVars: {
      bg: '#000000',
      bgSubtle: '#0a0a0c',
      surface: 'rgba(22, 22, 24, 0.85)',
      surfaceSolid: '#161618',
      surfaceHover: '#232326',
      card: '#161618',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      text: '#f5f5f7',
      textMuted: '#86868b',
      accent: '#2997ff',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(41, 151, 255, 0.12)',
      accentBorder: 'rgba(41, 151, 255, 0.3)',
      glow: 'rgba(41, 151, 255, 0.12)',
    },
  },
  'neon-violet': {
    id: 'apple-dark',
    name: 'Space Black',
    tagline: 'Apple Pro Dark',
    description: 'Pristine OLED dark canvas, frosted glass surfaces, and Cupertino Retina blue accents',
    isLight: false,
    previewColors: ['#000000', '#161618', '#2997ff'],
    cssVars: {
      bg: '#000000',
      bgSubtle: '#0a0a0c',
      surface: 'rgba(22, 22, 24, 0.85)',
      surfaceSolid: '#161618',
      surfaceHover: '#232326',
      card: '#161618',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      text: '#f5f5f7',
      textMuted: '#86868b',
      accent: '#2997ff',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(41, 151, 255, 0.12)',
      accentBorder: 'rgba(41, 151, 255, 0.3)',
      glow: 'rgba(41, 151, 255, 0.12)',
    },
  },
  'sunset-ember': {
    id: 'apple-titanium',
    name: 'Natural Titanium',
    tagline: 'Brushed Titanium Pro',
    description: 'Subdued metallic gray tones inspired by titanium hardware and studio displays',
    isLight: false,
    previewColors: ['#121215', '#1d1e23', '#e2e4ea'],
    cssVars: {
      bg: '#121215',
      bgSubtle: '#191a20',
      surface: 'rgba(29, 30, 35, 0.85)',
      surfaceSolid: '#1d1e23',
      surfaceHover: '#282930',
      card: '#1d1e23',
      border: 'rgba(255, 255, 255, 0.09)',
      borderStrong: 'rgba(255, 255, 255, 0.18)',
      text: '#f5f5f7',
      textMuted: '#9a9a9e',
      accent: '#e2e4ea',
      accentHover: '#ffffff',
      accentText: '#121215',
      accentSubtle: 'rgba(226, 228, 234, 0.12)',
      accentBorder: 'rgba(226, 228, 234, 0.28)',
      glow: 'rgba(226, 228, 234, 0.08)',
    },
  },
  'emerald-matrix': {
    id: 'apple-dark',
    name: 'Space Black',
    tagline: 'Apple Pro Dark',
    description: 'Pristine OLED dark canvas, frosted glass surfaces, and Cupertino Retina blue accents',
    isLight: false,
    previewColors: ['#000000', '#161618', '#2997ff'],
    cssVars: {
      bg: '#000000',
      bgSubtle: '#0a0a0c',
      surface: 'rgba(22, 22, 24, 0.85)',
      surfaceSolid: '#161618',
      surfaceHover: '#232326',
      card: '#161618',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(255, 255, 255, 0.16)',
      text: '#f5f5f7',
      textMuted: '#86868b',
      accent: '#2997ff',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(41, 151, 255, 0.12)',
      accentBorder: 'rgba(41, 151, 255, 0.3)',
      glow: 'rgba(41, 151, 255, 0.12)',
    },
  },
  'nordic-frost': {
    id: 'apple-midnight',
    name: 'Midnight Navy',
    tagline: 'Cupertino Night',
    description: 'Deep nocturnal indigo canvas with calm cobalt accents and frosted glass',
    isLight: false,
    previewColors: ['#040711', '#0d1527', '#388bfd'],
    cssVars: {
      bg: '#040711',
      bgSubtle: '#091022',
      surface: 'rgba(13, 21, 39, 0.85)',
      surfaceSolid: '#0d1527',
      surfaceHover: '#15223f',
      card: '#0d1527',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: 'rgba(56, 139, 253, 0.22)',
      text: '#f5f5f7',
      textMuted: '#8b9bb4',
      accent: '#388bfd',
      accentHover: '#1f6feb',
      accentText: '#ffffff',
      accentSubtle: 'rgba(56, 139, 253, 0.12)',
      accentBorder: 'rgba(56, 139, 253, 0.3)',
      glow: 'rgba(56, 139, 253, 0.1)',
    },
  },
  'clean-light': {
    id: 'apple-light',
    name: 'Studio Light',
    tagline: 'Apple Official Clean',
    description: 'Minimalist porcelain canvas, pure white floating glass cards, and crisp typography',
    isLight: true,
    previewColors: ['#f5f5f7', '#ffffff', '#0071e3'],
    cssVars: {
      bg: '#f5f5f7',
      bgSubtle: '#ebebed',
      surface: 'rgba(255, 255, 255, 0.88)',
      surfaceSolid: '#ffffff',
      surfaceHover: '#f5f5f7',
      card: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      borderStrong: 'rgba(0, 0, 0, 0.14)',
      text: '#1d1d1f',
      textMuted: '#6e6e73',
      accent: '#0071e3',
      accentHover: '#0077ed',
      accentText: '#ffffff',
      accentSubtle: 'rgba(0, 113, 227, 0.08)',
      accentBorder: 'rgba(0, 113, 227, 0.25)',
      glow: 'rgba(0, 113, 227, 0.1)',
    },
  },
};

export const DISPLAY_THEMES: ThemeConfig[] = [
  THEMES['apple-dark'],
  THEMES['apple-light'],
  THEMES['apple-titanium'],
  THEMES['apple-midnight'],
];

const THEME_STORAGE_KEY = 'vchat_selected_theme';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved) {
      if (saved === 'clean-light') return 'apple-light';
      if (saved === 'cyber-dark' || saved === 'neon-violet' || saved === 'emerald-matrix') return 'apple-dark';
      if (saved === 'sunset-ember') return 'apple-titanium';
      if (saved === 'nordic-frost') return 'apple-midnight';
      if (THEMES[saved]) return saved;
    }
  } catch (e) {
    console.warn('Failed to load theme:', e);
  }
  return 'apple-dark';
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
  const theme = THEMES[themeId] || THEMES['apple-dark'];

  root.setAttribute('data-theme', theme.id);
  document.body.setAttribute('data-theme', theme.id);

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
