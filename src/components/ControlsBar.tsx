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
      className="h-18 border-t backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between z-30 select-none transition-colors duration-200"
    >
      {/* Left: Primary Action (Skip / Start) */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <button
            id="btn-skip-call"
            type="button"
            onClick={onSkip}
            className="py-2 px-4 sm:px-5 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-white font-medium text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Next conversation (Press Esc)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Next</span>
            <kbd className="hidden sm:inline-block ml-0.5 px-1.5 py-0.5 rounded bg-black/20 text-[10px] text-white font-normal">
              esc
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
            className="py-2 px-5 rounded-full font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 hover:opacity-95"
          >
            <Search className="w-4 h-4" />
            <span>Start Chat</span>
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
                borderColor: 'var(--theme-border)',
                color: isCurrentPartnerFavorite ? '#fbbf24' : 'var(--theme-text-muted)',
              }}
              className="p-2.5 rounded-full border hover:bg-white/[0.06] transition-all cursor-pointer"
              title={isCurrentPartnerFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
            >
              <Star className={`w-4 h-4 ${isCurrentPartnerFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              id="btn-report-control"
              type="button"
              onClick={onOpenReport}
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-muted)',
              }}
              className="p-2.5 rounded-full border hover:text-rose-400 hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Report User"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Apple FaceTime-style Round Media Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Microphone Toggle */}
        <button
          id="btn-toggle-microphone"
          type="button"
          onClick={onToggleAudio}
          style={{
            backgroundColor: isAudioEnabled
              ? 'var(--theme-surface-solid)'
              : 'rgba(255, 59, 48, 0.15)',
            borderColor: isAudioEnabled ? 'var(--theme-border)' : 'rgba(255, 59, 48, 0.3)',
            color: isAudioEnabled ? 'var(--theme-text)' : '#ff3b30',
          }}
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:opacity-90 shadow-sm"
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
              : 'rgba(255, 59, 48, 0.15)',
            borderColor: isVideoEnabled ? 'var(--theme-border)' : 'rgba(255, 59, 48, 0.3)',
            color: isVideoEnabled ? 'var(--theme-text)' : '#ff3b30',
          }}
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:opacity-90 shadow-sm"
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
          className="h-10 px-3.5 rounded-full border font-medium text-xs flex items-center gap-2 transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        >
          <MonitorUp className="w-4 h-4" />
          <span className="hidden md:inline font-normal">
            {isScreenSharing ? 'Stop' : 'Share'}
          </span>
        </button>

        {/* Virtual Mode Toggle */}
        <button
          id="btn-toggle-virtual-stream"
          type="button"
          onClick={onToggleVirtualMode}
          style={{
            backgroundColor: isVirtualStream
              ? 'rgba(245, 158, 11, 0.15)'
              : 'var(--theme-surface-solid)',
            borderColor: isVirtualStream ? 'rgba(245, 158, 11, 0.3)' : 'var(--theme-border)',
            color: isVirtualStream ? '#f59e0b' : 'var(--theme-text-muted)',
          }}
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title={isVirtualStream ? 'Using Virtual Avatar Stream' : 'Using Physical Camera'}
        >
          <Radio className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Messages & Security */}
      <div className="flex items-center gap-2">
        <button
          id="btn-open-crypto-inspector"
          type="button"
          onClick={onOpenCryptoInspector}
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
          className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border cursor-pointer hover:bg-white/[0.06] hover:text-[var(--theme-text)] transition-colors"
          title="Security details"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-normal">Security</span>
        </button>

        {/* Encrypted Messages Drawer Toggle */}
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
          className="relative w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer hover:opacity-90 shadow-sm"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && !isChatOpen && (
            <span
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border border-black"
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
