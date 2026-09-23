import React from 'react';
import {
  ShieldCheck,
  Video,
  Star,
  ExternalLink,
  Radio,
  Palette,
  Smartphone,
} from 'lucide-react';
import { ServerStats, UserProfile, ThemeId } from '../types';
import { THEMES } from '../utils/themes';

interface HeaderProps {
  profile: UserProfile;
  serverStats: ServerStats;
  currentTheme: ThemeId;
  favoriteCount: number;
  onlineFavoritesCount: number;
  onOpenFavorites: () => void;
  onOpenCryptoInspector: () => void;
  onOpenThemeModal: () => void;
  onOpenProfileModal: () => void;
  onOpenTestMobile?: () => void;
  onUpdateName: (name: string) => void;
  isVirtualStream: boolean;
  onToggleVirtualMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  serverStats,
  currentTheme,
  favoriteCount,
  onlineFavoritesCount,
  onOpenFavorites,
  onOpenCryptoInspector,
  onOpenThemeModal,
  onOpenProfileModal,
  onOpenTestMobile,
  isVirtualStream,
  onToggleVirtualMode,
}) => {
  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const activeThemeConfig = THEMES[currentTheme] || THEMES['apple-dark'];

  return (
    <header
      id="platform-header"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
      className="h-14 border-b backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between z-30 select-none transition-colors duration-200"
    >
      {/* Zone 1: Apple-style Single Wordmark & Quiet Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
          >
            <Video className="w-4 h-4" />
          </div>
          <span
            style={{ color: 'var(--theme-text)' }}
            className="text-sm font-semibold tracking-tight"
          >
            Nexus
          </span>
        </div>

        {/* Clean, unboxed status metadata with typographic separators */}
        <div
          style={{ color: 'var(--theme-text-muted)' }}
          className="hidden md:flex items-center gap-2 text-xs font-normal"
        >
          <span aria-hidden="true" className="opacity-40">/</span>
          <span>End-to-End Encrypted</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span>{serverStats.onlineCount.toLocaleString()} online</span>
        </div>
      </div>

      {/* Zone 3: Polished Apple-style Action Affordances */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Virtual Mode Toggle */}
        <button
          id="btn-toggle-virtual-mode"
          type="button"
          onClick={onToggleVirtualMode}
          title={isVirtualStream ? 'Using virtual avatar stream' : 'Using physical camera'}
          style={{
            borderColor: isVirtualStream ? 'var(--theme-accent)' : 'var(--theme-border)',
          }}
          className={`hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            isVirtualStream
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'hover:bg-white/[0.06] text-[var(--theme-text-muted)]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isVirtualStream ? 'Virtual Stream' : 'Camera'}</span>
        </button>

        {/* E2EE Security Inspector */}
        <button
          id="btn-crypto-inspector-header"
          type="button"
          onClick={onOpenCryptoInspector}
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          title="End-to-End Encryption verification & parameters"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border hover:bg-white/[0.06] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-normal">Security</span>
        </button>

        {/* Appearance / Theme Selector */}
        <button
          id="btn-open-theme-section"
          type="button"
          onClick={onOpenThemeModal}
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          title={`Appearance: ${activeThemeConfig.name}. Click to change.`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border hover:bg-white/[0.06] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden md:inline font-normal">{activeThemeConfig.name}</span>
        </button>

        {/* Favorites */}
        <button
          id="btn-open-favorites"
          type="button"
          onClick={onOpenFavorites}
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text)',
          }}
          title="Saved favorite contacts"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border hover:bg-white/[0.06] transition-colors relative cursor-pointer"
        >
          <Star className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'text-amber-400 fill-amber-400/40' : 'text-[var(--theme-text-muted)]'}`} />
          <span className="hidden sm:inline font-normal">Favorites</span>
          {favoriteCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                color: 'var(--theme-accent)',
              }}
              className="px-1.5 py-0.2 rounded-full text-[10px] font-medium"
            >
              {favoriteCount}
            </span>
          )}
          {onlineFavoritesCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
          )}
        </button>

        {/* Test on Mobile / QR Code Button */}
        {onOpenTestMobile && (
          <button
            id="btn-header-open-mobile-test"
            type="button"
            onClick={onOpenTestMobile}
            style={{
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-muted)',
            }}
            title="Scan QR Code to test on Mobile device"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border hover:bg-white/[0.06] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-normal">Connect Mobile</span>
          </button>
        )}

        {/* Dual Tab Multi-Window Test */}
        <button
          id="btn-dual-test-window"
          type="button"
          onClick={handleOpenNewTab}
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          title="Open second window to test matchmaking between 2 users"
          className="hidden xl:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border hover:bg-white/[0.06] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Apple ID Style Profile Pill */}
        <button
          id="btn-header-profile-card"
          type="button"
          onClick={onOpenProfileModal}
          style={{
            borderColor: 'var(--theme-border-strong)',
            backgroundColor: 'var(--theme-surface-solid)',
          }}
          title="Edit Profile"
          className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border transition-all cursor-pointer hover:opacity-90 shadow-sm"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-6 h-6 rounded-full flex items-center justify-center font-medium text-[11px] shadow-sm overflow-hidden"
          >
            <span>{profile.countryFlag || (profile.name ? profile.name.charAt(0).toUpperCase() : 'U')}</span>
          </div>
          <span
            style={{ color: 'var(--theme-text)' }}
            className="text-xs font-medium max-w-[90px] truncate"
          >
            {profile.name || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
};
