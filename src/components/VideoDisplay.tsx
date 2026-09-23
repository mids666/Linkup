import React, { useEffect, useRef, useState } from 'react';
import {
  Star,
  Flag,
  MonitorUp,
  MicOff,
  VideoOff,
  Search,
  X,
  Lock,
  RotateCcw,
  Video,
  Smartphone,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { CallStatus, GenderPreference, PartnerInfo } from '../types';

interface VideoDisplayProps {
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  callStatus: CallStatus;
  disconnectReason?: string | null;
  currentPartner: PartnerInfo | null;
  isInitiator: boolean;
  isCurrentPartnerFavorite: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isVirtualStream: boolean;
  queuePosition: number;
  genderPreference: GenderPreference;
  onSelectGenderPreference: (pref: GenderPreference) => void;
  onStartSearch: () => void;
  onCancelSearch: () => void;
  onToggleFavorite: () => void;
  onOpenReport: () => void;
  onOpenCryptoInspector: () => void;
  onSkip: () => void;
  onOpenTestMobile?: () => void;
  onSimulateTestMatch?: () => void;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  remoteStream,
  localStream,
  callStatus,
  disconnectReason,
  currentPartner,
  isCurrentPartnerFavorite,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isVirtualStream,
  queuePosition,
  genderPreference,
  onSelectGenderPreference,
  onStartSearch,
  onCancelSearch,
  onToggleFavorite,
  onOpenReport,
  onOpenCryptoInspector,
  onSkip,
  onOpenTestMobile,
  onSimulateTestMatch,
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);

  // Attach and play remote stream with autoplay fallback for mobile browsers
  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;

    if (remoteStream) {
      video.srcObject = remoteStream;

      const attemptPlay = async () => {
        try {
          await video.play();
          setNeedsAudioUnlock(false);
        } catch (err: any) {
          console.warn('Remote video unmuted autoplay blocked by browser policy:', err);
          video.muted = true;
          try {
            await video.play();
            setNeedsAudioUnlock(true);
          } catch (playErr) {
            console.error('Remote video playback failed even when muted:', playErr);
          }
        }
      };

      attemptPlay();

      const handleLoadedMetadata = () => {
        attemptPlay();
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [remoteStream, callStatus]);

  // Attach and play local stream
  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;

    if (localStream) {
      video.srcObject = localStream;
      video.play().catch(err => {
        console.warn('Local preview play error:', err);
      });
    }
  }, [localStream, isScreenSharing]);

  const handleUnlockAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = remoteVideoRef.current;
    if (video) {
      video.muted = false;
      video.play().then(() => {
        setNeedsAudioUnlock(false);
      }).catch(err => {
        console.warn('Manual audio unlock failed:', err);
      });
    }
  };

  return (
    <div
      id="video-stage-container"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)',
      }}
      className="relative flex-1 w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden transition-colors duration-200"
    >
      {/* Subtle Apple Studio Ambient Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Main Remote Stage */}
      {callStatus === 'connected' ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={remoteVideoRef}
            id="remote-video-feed"
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-black/70 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin mb-3" />
              <span className="text-xs font-medium text-zinc-300">Connecting video...</span>
            </div>
          )}

          {/* Audio Unlock Banner for mobile browsers */}
          {needsAudioUnlock && (
            <button
              id="btn-unlock-mobile-audio"
              type="button"
              onClick={handleUnlockAudio}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-full bg-white text-black font-medium text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 hover:bg-zinc-200"
            >
              <Volume2 className="w-4 h-4 text-black" />
              <span>Tap to Enable Audio</span>
            </button>
          )}

          {/* Top Floating Glass HUD Pill (Apple Dynamic Island / FaceTime Header) */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            {/* Partner Info Capsule */}
            <div
              style={{
                backgroundColor: 'rgba(20, 20, 22, 0.75)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full backdrop-blur-2xl border pointer-events-auto shadow-2xl text-white"
            >
              <div
                style={{ backgroundColor: 'var(--theme-accent)' }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm"
              >
                {currentPartner?.countryFlag || (currentPartner?.name ? currentPartner.name.charAt(0).toUpperCase() : 'P')}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-white tracking-tight">
                  {currentPartner?.name || 'Partner'}
                </span>
                {currentPartner?.age && (
                  <span className="text-zinc-400 font-normal">
                    {currentPartner.age}
                  </span>
                )}
                {currentPartner?.country && (
                  <>
                    <span className="text-zinc-500 font-normal">·</span>
                    <span className="text-zinc-400 font-normal">
                      {currentPartner.country}
                    </span>
                  </>
                )}
              </div>

              <button
                id="btn-partner-crypto-badge"
                type="button"
                onClick={onOpenCryptoInspector}
                className="ml-1 flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                title="End-to-End Encrypted Session"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline font-normal">Encrypted</span>
              </button>
            </div>

            {/* Top Right Actions: Skip & Favorite */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Skip / Next Button */}
              <button
                id="btn-skip-hud"
                type="button"
                onClick={onSkip}
                className="py-1.5 px-4 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-white text-xs font-medium shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Skip to next person"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Next</span>
              </button>

              {/* Add to Favorites */}
              <button
                id="btn-toggle-favorite-hud"
                type="button"
                onClick={onToggleFavorite}
                style={{
                  backgroundColor: isCurrentPartnerFavorite
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(20, 20, 22, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                }}
                className="p-2 rounded-full border backdrop-blur-2xl transition-all cursor-pointer shadow-lg text-white hover:bg-white/15"
                title={isCurrentPartnerFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isCurrentPartnerFavorite ? 'fill-amber-400 text-amber-400' : 'text-white'
                  }`}
                />
              </button>

              {/* Report */}
              <button
                id="btn-report-hud"
                type="button"
                onClick={onOpenReport}
                style={{
                  backgroundColor: 'rgba(20, 20, 22, 0.75)',
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                }}
                className="p-2 rounded-full border hover:text-rose-400 backdrop-blur-2xl transition-all cursor-pointer shadow-lg text-zinc-400 hover:bg-white/15"
                title="Report User"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* State Stage Overlay when not connected */
        <div
          id="state-overlay-card"
          className="relative z-10 max-w-xl w-full mx-4 px-6 py-10 sm:py-14 text-center transition-all duration-200"
        >
          {callStatus === 'idle' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Apple Hero Statement */}
              <div className="space-y-3">
                <h1
                  style={{ color: 'var(--theme-text)' }}
                  className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight"
                >
                  Connect instantly.
                </h1>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-sm sm:text-base leading-relaxed max-w-md mx-auto"
                >
                  Private random video conversations with verified adults worldwide. Secured with end-to-end encryption.
                </p>
              </div>

              {/* Apple-style Segmented Filter Bar */}
              <div className="max-w-xs sm:max-w-sm mx-auto">
                <div
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="p-1 rounded-full border flex items-center justify-between"
                >
                  {[
                    { id: 'any', label: 'Everyone' },
                    { id: 'female', label: 'Women' },
                    { id: 'male', label: 'Men' },
                    { id: 'nonbinary', label: 'Non-Binary' },
                  ].map(item => {
                    const isSelected = genderPreference === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`btn-match-filter-${item.id}`}
                        type="button"
                        onClick={() => onSelectGenderPreference(item.id as GenderPreference)}
                        style={{
                          backgroundColor: isSelected ? 'var(--theme-accent)' : 'transparent',
                          color: isSelected ? 'var(--theme-accent-text)' : 'var(--theme-text-muted)',
                        }}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer text-center truncate ${
                          isSelected ? 'shadow-sm font-semibold' : 'hover:text-[var(--theme-text)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Apple Action CTA Button */}
              <div className="pt-1 flex flex-col items-center gap-3">
                <button
                  id="btn-start-random-match"
                  type="button"
                  onClick={onStartSearch}
                  style={{
                    backgroundColor: 'var(--theme-accent)',
                    color: 'var(--theme-accent-text)',
                  }}
                  className="w-full sm:w-auto min-w-[220px] py-3.5 px-8 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 active:scale-[0.98]"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Video Chat</span>
                </button>

                {/* Clean Unboxed Trust Markers (Anti-Slop) */}
                <div
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="flex items-center justify-center gap-2 text-[12px] font-normal"
                >
                  <span>End-to-End Encrypted</span>
                  <span aria-hidden="true">·</span>
                  <span>HD WebRTC</span>
                  <span aria-hidden="true">·</span>
                  <span>Camera Required</span>
                </div>
              </div>

              {/* Subtle Accessory Actions (Mobile QR & Simulation) */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenTestMobile && (
                  <button
                    id="btn-idle-open-mobile-test"
                    type="button"
                    onClick={onOpenTestMobile}
                    style={{
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-muted)',
                    }}
                    className="py-2 px-4 rounded-full border text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white/[0.06] hover:text-[var(--theme-text)]"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Connect Phone</span>
                  </button>
                )}
                {onSimulateTestMatch && (
                  <button
                    id="btn-idle-simulate-match"
                    type="button"
                    onClick={onSimulateTestMatch}
                    style={{
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-muted)',
                    }}
                    className="py-2 px-4 rounded-full border text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-white/[0.06] hover:text-[var(--theme-text)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Demo Call</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {callStatus === 'searching' && (
            <div className="space-y-6">
              {/* Apple AirDrop / Find My Concentric Ripples */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-30" />
                <div className="absolute inset-3 rounded-full border border-white/15 animate-pulse" />
                <div
                  style={{
                    backgroundColor: 'var(--theme-accent-subtle)',
                    borderColor: 'var(--theme-accent-border)',
                    color: 'var(--theme-accent)',
                  }}
                  className="w-16 h-16 rounded-full border flex items-center justify-center shadow-inner"
                >
                  <Search className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h2
                  style={{ color: 'var(--theme-text)' }}
                  className="text-xl font-semibold tracking-tight"
                >
                  Looking for someone...
                </h2>
                <div
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="flex items-center justify-center gap-2 text-xs"
                >
                  <span>Queue position #{queuePosition || 1}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">Filter: {genderPreference}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  id="btn-cancel-search"
                  type="button"
                  onClick={onCancelSearch}
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                  className="py-2 px-5 rounded-full border text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.06]"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                {onSimulateTestMatch && (
                  <button
                    id="btn-searching-simulate"
                    type="button"
                    onClick={onSimulateTestMatch}
                    style={{
                      backgroundColor: 'var(--theme-accent-subtle)',
                      borderColor: 'var(--theme-accent-border)',
                      color: 'var(--theme-accent)',
                    }}
                    className="py-2 px-4 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                  >
                    <span>Instant Match</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="space-y-4">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <div className="space-y-1">
                <h2
                  style={{ color: 'var(--theme-text)' }}
                  className="text-lg font-semibold tracking-tight"
                >
                  Connecting...
                </h2>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs"
                >
                  Establishing secure peer-to-peer stream
                </p>
              </div>
            </div>
          )}

          {callStatus === 'partner_skipped' && (
            <div className="space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.08] flex items-center justify-center text-zinc-300">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h2
                  style={{ color: 'var(--theme-text)' }}
                  className="text-xl font-semibold tracking-tight"
                >
                  Partner moved to next person
                </h2>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs"
                >
                  Ready to connect with someone new?
                </p>
              </div>
              <button
                id="btn-match-after-skip"
                type="button"
                onClick={onStartSearch}
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="py-3 px-7 rounded-full text-xs font-semibold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Next Person</span>
              </button>
            </div>
          )}

          {callStatus === 'partner_disconnected' && (
            <div className="space-y-5">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.08] flex items-center justify-center text-zinc-300">
                {disconnectReason?.includes('camera') ? (
                  <VideoOff className="w-5 h-5 text-rose-400" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1.5">
                <h2
                  style={{ color: 'var(--theme-text)' }}
                  className="text-xl font-semibold tracking-tight"
                >
                  Call Ended
                </h2>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs leading-relaxed max-w-sm mx-auto"
                >
                  {disconnectReason || 'The video conversation has ended.'}
                </p>
              </div>

              <button
                id="btn-match-after-disconnect"
                type="button"
                onClick={onStartSearch}
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="py-3 px-7 rounded-full text-xs font-semibold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Someone New</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Local Self Video (FaceTime-Style Picture-in-Picture Preview) */}
      <div
        id="local-video-pip"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backgroundColor: '#161618',
        }}
        className="absolute bottom-4 right-4 w-32 h-24 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border shadow-2xl z-20 transition-all group"
      >
        <video
          ref={localVideoRef}
          id="local-video-feed"
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isVideoEnabled && !isScreenSharing ? 'hidden' : ''}`}
        />

        {/* Fallback when video disabled */}
        {!isVideoEnabled && !isScreenSharing && (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-900 text-zinc-400">
            <VideoOff className="w-5 h-5 text-zinc-500 mb-1" />
            <span className="text-[10px] text-zinc-400 font-medium">Camera Off</span>
          </div>
        )}

        {/* Local Stream Overlay Badges */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-zinc-200">You</span>
            {isVirtualStream && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-medium">
                Virtual
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isScreenSharing && (
              <span
                style={{ backgroundColor: 'var(--theme-accent)' }}
                className="p-1 rounded text-white"
                title="Sharing your screen"
              >
                <MonitorUp className="w-3 h-3" />
              </span>
            )}
            {!isAudioEnabled && (
              <span className="p-1 rounded bg-rose-500/50 text-rose-200" title="Microphone muted">
                <MicOff className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
