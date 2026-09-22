import React, { useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  RotateCcw,
  Star,
  Flag,
  MessageSquare,
  ShieldCheck,
  Radio,
  Search,
} from 'lucide-react';
import { CallStatus } from '../types';

interface ControlsBarProps {
  callStatus: CallStatus;
  isCurrentPartnerFavorite: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isVirtualStream: boolean;
  isChatOpen: boolean;
  unreadCount: number;
  onSkip: () => void;
  onStartSearch: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleVirtualMode: () => void;
  onToggleFavorite: () => void;
  onOpenReport: () => void;
  onToggleChat: () => void;
  onOpenCryptoInspector: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  callStatus,
  isCurrentPartnerFavorite,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isVirtualStream,
  isChatOpen,
  unreadCount,
  onSkip,
  onStartSearch,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleVirtualMode,
  onToggleFavorite,
  onOpenReport,
  onToggleChat,
  onOpenCryptoInspector,
}) => {
  const isConnected = callStatus === 'connected';

  // Keyboard shortcut: Space or Esc to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Escape' || (e.key === ' ' && isConnected)) {
        e.preventDefault();
        if (isConnected) {
          onSkip();
        } else if (callStatus === 'idle') {
          onStartSearch();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected, callStatus, onSkip, onStartSearch]);

  return (
    <div
      id="controls-bar"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
      className="h-20 border-t backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-30 select-none transition-colors duration-200"
    >
      {/* Left: Primary Call Action (Skip / Start) */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <button
            id="btn-skip-call"
            type="button"
            onClick={onSkip}
            className="group py-2.5 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Skip to next person (Press Esc)"
          >
            <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-200" />
            <span>Skip User</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-rose-700/60 text-[10px] text-rose-200 border border-rose-600/60">
              Esc
            </kbd>
          </button>
        ) : (
          <button
            id="btn-start-search-controls"
            type="button"
            onClick={onStartSearch}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="py-2.5 px-5 sm:px-6 rounded-xl font-semibold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 hover:opacity-95"
          >
            <Search className="w-4 h-4" />
            <span>Find Match</span>
          </button>
        )}

        {/* Favorite & Report buttons (when connected) */}
        {isConnected && (
          <div
            style={{ borderColor: 'var(--theme-border)' }}
            className="hidden sm:flex items-center gap-1.5 pl-2 border-l"
          >
            <button
              id="btn-favorite-control"
              type="button"
              onClick={onToggleFavorite}
              style={{
                backgroundColor: isCurrentPartnerFavorite
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'var(--theme-surface-solid)',
                borderColor: isCurrentPartnerFavorite
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'var(--theme-border)',
                color: isCurrentPartnerFavorite ? '#fbbf24' : 'var(--theme-text)',
              }}
              className="p-2.5 rounded-xl border transition-all cursor-pointer hover:opacity-90"
              title={isCurrentPartnerFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-4 h-4 ${isCurrentPartnerFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              id="btn-report-control"
              type="button"
              onClick={onOpenReport}
              style={{
                backgroundColor: 'var(--theme-surface-solid)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
              className="p-2.5 rounded-xl border hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer"
              title="Report User"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Media Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Microphone Toggle */}
        <button
          id="btn-toggle-microphone"
          type="button"
          onClick={onToggleAudio}
          style={{
            backgroundColor: isAudioEnabled
              ? 'var(--theme-surface-solid)'
              : 'rgba(244, 63, 94, 0.2)',
            borderColor: isAudioEnabled ? 'var(--theme-border)' : 'rgba(244, 63, 94, 0.4)',
            color: isAudioEnabled ? 'var(--theme-text)' : '#f43f5e',
          }}
          className="p-3 rounded-xl border transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title={isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Camera Toggle */}
        <button
          id="btn-toggle-camera"
          type="button"
          onClick={onToggleVideo}
          style={{
            backgroundColor: isVideoEnabled
              ? 'var(--theme-surface-solid)'
              : 'rgba(244, 63, 94, 0.2)',
            borderColor: isVideoEnabled ? 'var(--theme-border)' : 'rgba(244, 63, 94, 0.4)',
            color: isVideoEnabled ? 'var(--theme-text)' : '#f43f5e',
          }}
          className="p-3 rounded-xl border transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          id="btn-toggle-screenshare"
          type="button"
          onClick={onToggleScreenShare}
          style={{
            backgroundColor: isScreenSharing
              ? 'var(--theme-accent)'
              : 'var(--theme-surface-solid)',
            borderColor: isScreenSharing ? 'var(--theme-accent)' : 'var(--theme-border)',
            color: isScreenSharing ? 'var(--theme-accent-text)' : 'var(--theme-text)',
          }}
          className={`px-3.5 py-2.5 rounded-xl border font-medium text-xs flex items-center gap-2 transition-all cursor-pointer hover:opacity-90 shadow-sm ${
            isScreenSharing ? 'animate-pulse' : ''
          }`}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share your Screen'}
        >
          <MonitorUp className="w-4 h-4" />
          <span className="hidden md:inline">
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </span>
        </button>

        {/* Virtual Mode Switcher */}
        <button
          id="btn-toggle-virtual-stream"
          type="button"
          onClick={onToggleVirtualMode}
          style={{
            backgroundColor: isVirtualStream
              ? 'rgba(245, 158, 11, 0.2)'
              : 'var(--theme-surface-solid)',
            borderColor: isVirtualStream ? 'rgba(245, 158, 11, 0.4)' : 'var(--theme-border)',
            color: isVirtualStream ? '#f59e0b' : 'var(--theme-text-muted)',
          }}
          className="p-3 rounded-xl border transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title={isVirtualStream ? 'Using Virtual Avatar Stream' : 'Using Physical Camera'}
        >
          <Radio className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Chat Drawer & E2EE Info */}
      <div className="flex items-center gap-2">
        <button
          id="btn-open-crypto-inspector"
          type="button"
          onClick={onOpenCryptoInspector}
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border cursor-pointer hover:opacity-90"
          title="Inspect Cryptographic Parameters"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>E2EE</span>
        </button>

        {/* Chat Drawer Toggle */}
        <button
          id="btn-toggle-chat-drawer"
          type="button"
          onClick={onToggleChat}
          style={{
            backgroundColor: isChatOpen
              ? 'var(--theme-accent)'
              : 'var(--theme-surface-solid)',
            borderColor: isChatOpen ? 'var(--theme-accent)' : 'var(--theme-border)',
            color: isChatOpen ? 'var(--theme-accent-text)' : 'var(--theme-text)',
          }}
          className="relative p-3 rounded-xl border transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title="Open Encrypted Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-black"
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
