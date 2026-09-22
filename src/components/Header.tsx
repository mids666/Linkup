import React from 'react';
import {
  ShieldCheck,
  Users,
  Video,
  Star,
  ExternalLink,
  Radio,
  Lock,
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

  const activeThemeConfig = THEMES[currentTheme] || THEMES['cyber-dark'];

  return (
    <header
      id="platform-header"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
      className="h-16 border-b backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 select-none transition-colors duration-200"
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div
          style={{
            backgroundColor: 'var(--theme-accent-subtle)',
            borderColor: 'var(--theme-accent-border)',
            color: 'var(--theme-accent)',
          }}
          className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm"
        >
          <Video className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              style={{ color: 'var(--theme-text)' }}
              className="text-base font-bold tracking-tight"
            >
              NexusChat
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="w-2.5 h-2.5" />
              E2EE
            </span>
          </div>
          <div
            style={{ color: 'var(--theme-text-muted)' }}
            className="flex items-center gap-2 text-xs"
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {serverStats.onlineCount} online
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 opacity-60" />
              {serverStats.activeChatCount} calls
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Dynamic Theme Selection Button */}
        <button
          id="btn-open-theme-section"
          type="button"
          onClick={onOpenThemeModal}
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border-strong)',
            color: 'var(--theme-text)',
          }}
          title={`Active Theme: ${activeThemeConfig.name} (${activeThemeConfig.tagline}). Click to customize theme.`}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer hover:opacity-90 shadow-sm active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: 'var(--theme-accent)' }}
            />
            <Palette className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-bold">{activeThemeConfig.name}</span>
            <span className="hidden md:inline text-[9px]" style={{ color: 'var(--theme-accent)' }}>
              Theme
            </span>
          </div>
        </button>

        {/* Virtual Stream Toggle */}
        <button
          id="btn-toggle-virtual-mode"
          type="button"
          onClick={onToggleVirtualMode}
          title={isVirtualStream ? 'Using virtual avatar stream' : 'Using physical webcam'}
          style={{
            backgroundColor: isVirtualStream
              ? 'rgba(245, 158, 11, 0.15)'
              : 'var(--theme-surface-solid)',
            borderColor: isVirtualStream
              ? 'rgba(245, 158, 11, 0.4)'
              : 'var(--theme-border)',
            color: isVirtualStream ? '#f59e0b' : 'var(--theme-text-muted)',
          }}
          className="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isVirtualStream ? 'Virtual' : 'Webcam'}</span>
        </button>

        {/* Security / E2EE Inspector Button */}
        <button
          id="btn-crypto-inspector-header"
          type="button"
          onClick={onOpenCryptoInspector}
          style={{
            backgroundColor: 'var(--theme-accent-subtle)',
            borderColor: 'var(--theme-accent-border)',
            color: 'var(--theme-accent)',
          }}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden lg:inline font-medium">E2EE</span>
        </button>

        {/* Favorites Drawer Trigger */}
        <button
          id="btn-open-favorites"
          type="button"
          onClick={onOpenFavorites}
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text)',
          }}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all relative cursor-pointer hover:opacity-90"
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="hidden sm:inline font-medium">Favorites</span>
          {favoriteCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                color: 'var(--theme-text)',
              }}
              className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold"
            >
              {favoriteCount}
            </span>
          )}
          {onlineFavoritesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black absolute -top-0.5 -right-0.5" />
          )}
        </button>

        {/* Multi-Tab Test Button */}
        <button
          id="btn-dual-test-window"
          type="button"
          onClick={handleOpenNewTab}
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          title="Open second window to test matchmaking between 2 users"
          className="hidden xl:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border hover:opacity-90 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Dual Tab</span>
        </button>

        {/* Test on Mobile / QR Code Button */}
        {onOpenTestMobile && (
          <button
            id="btn-header-open-mobile-test"
            type="button"
            onClick={onOpenTestMobile}
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border-strong)',
              color: 'var(--theme-text)',
            }}
            title="Scan QR Code to test on Mobile device or simulate live match"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border hover:opacity-90 cursor-pointer shadow-sm active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-semibold">Test Mobile</span>
            <span className="sm:hidden font-semibold">Test</span>
          </button>
        )}

        {/* User Profile Chip */}
        <button
          id="btn-header-profile-card"
          type="button"
          onClick={onOpenProfileModal}
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border-strong)',
            color: 'var(--theme-text)',
          }}
          title="Edit Profile (Age, Gender, Country)"
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border transition-all cursor-pointer group shadow-sm hover:opacity-90"
        >
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden"
          >
            <span className="text-xs">{profile.countryFlag || '🌐'}</span>
          </div>
          <div className="text-left leading-none">
            <div className="flex items-center gap-1">
              <span
                style={{ color: 'var(--theme-text)' }}
                className="text-xs font-semibold max-w-[85px] sm:max-w-[110px] truncate"
              >
                {profile.name}
              </span>
              {profile.age && (
                <span
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-[10px]"
                >
                  {profile.age}
                </span>
              )}
            </div>
            <div
              style={{ color: 'var(--theme-text-muted)' }}
              className="text-[9px] capitalize flex items-center gap-1 mt-0.5"
            >
              <span>{profile.gender || 'profile'}</span>
              <span>•</span>
              <span>{profile.country || 'Global'}</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
