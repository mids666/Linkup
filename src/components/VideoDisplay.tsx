import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  Star,
  Flag,
  MonitorUp,
  MicOff,
  VideoOff,
  Sparkles,
  Search,
  X,
  Lock,
  Zap,
  RotateCcw,
  Video,
  AlertTriangle,
  Smartphone,
  Bot,
  Volume2,
  VolumeX,
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
          // On mobile, if unmuted playback is blocked, mute the video element so frames render immediately
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

  const genderEmoji = (g?: string) => {
    switch (g) {
      case 'female':
        return '👩';
      case 'male':
        return '👨';
      case 'nonbinary':
        return '🧑';
      default:
        return '✨';
    }
  };

  return (
    <div
      id="video-stage-container"
      style={{
        backgroundColor: 'var(--theme-bg-subtle)',
        color: 'var(--theme-text)',
      }}
      className="relative flex-1 w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden transition-colors duration-200"
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--theme-border-strong) 1px, transparent 0)',
          backgroundSize: '2.5rem 2.5rem',
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 bg-black/80">
              <Zap className="w-8 h-8 text-amber-400 animate-spin mb-2" />
              <span className="text-xs font-medium">Connecting camera feed...</span>
            </div>
          )}

          {/* Audio Unlock Banner for mobile browsers */}
          {needsAudioUnlock && (
            <button
              id="btn-unlock-mobile-audio"
              type="button"
              onClick={handleUnlockAudio}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-pulse"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>Tap to Enable Partner Audio</span>
            </button>
          )}

          {/* Camera-on enforcement reminder banner at top center */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] text-white/90 pointer-events-none shadow-md">
            <Video className="w-3 h-3 text-emerald-400" />
            <span>Camera Required: Disabling camera stops the call automatically</span>
          </div>

          {/* Top HUD: Partner Info & Quick Skip */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {/* Partner Details */}
            <div
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-md border pointer-events-auto shadow-xl"
            >
              <div
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm"
              >
                {currentPartner?.countryFlag || (currentPartner?.name.charAt(0).toUpperCase() || 'P')}
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-semibold">{currentPartner?.name || 'Partner'}</span>
                  {currentPartner?.age && (
                    <span
                      style={{
                        backgroundColor: 'var(--theme-surface-solid)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-muted)',
                      }}
                      className="text-[10px] px-1 py-0.2 rounded border"
                    >
                      {currentPartner.age}
                    </span>
                  )}
                  {currentPartner?.gender && (
                    <span className="text-xs" title={`Gender: ${currentPartner.gender}`}>
                      {genderEmoji(currentPartner.gender)}
                    </span>
                  )}
                </div>
                {currentPartner?.country && (
                  <div
                    style={{ color: 'var(--theme-text-muted)' }}
                    className="text-[10px] mt-0.5 leading-none"
                  >
                    {currentPartner.country}
                  </div>
                )}
              </div>

              <button
                id="btn-partner-crypto-badge"
                type="button"
                onClick={onOpenCryptoInspector}
                className="ml-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 transition-colors"
                title="End-to-End Encrypted Session"
              >
                <Lock className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">E2EE</span>
              </button>
            </div>

            {/* Top Right Action Buttons: Skip, Favorite & Report */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Skip Button in HUD */}
              <button
                id="btn-skip-hud"
                type="button"
                onClick={onSkip}
                className="py-1.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Skip to next random person"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              {/* Add to Favorites Button */}
              <button
                id="btn-toggle-favorite-hud"
                type="button"
                onClick={onToggleFavorite}
                style={{
                  backgroundColor: isCurrentPartnerFavorite
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'var(--theme-surface)',
                  borderColor: isCurrentPartnerFavorite
                    ? 'rgba(245, 158, 11, 0.5)'
                    : 'var(--theme-border)',
                  color: isCurrentPartnerFavorite ? '#fbbf24' : 'var(--theme-text)',
                }}
                className="p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-md"
                title={isCurrentPartnerFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isCurrentPartnerFavorite ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>

              {/* Report Button */}
              <button
                id="btn-report-hud"
                type="button"
                onClick={onOpenReport}
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-muted)',
                }}
                className="p-2 rounded-xl border hover:text-rose-400 backdrop-blur-md transition-all cursor-pointer shadow-md"
                title="Report or Block User"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* State Card Overlay when not connected */
        <div
          id="state-overlay-card"
          style={{
            backgroundColor: 'var(--theme-card)',
            borderColor: 'var(--theme-border-strong)',
            color: 'var(--theme-text)',
            boxShadow: '0 20px 50px -10px var(--theme-glow)',
          }}
          className="relative z-10 max-w-lg w-full mx-4 p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl text-center transition-all duration-200"
        >
          {callStatus === 'idle' && (
            <div className="space-y-5">
              <div
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-accent-border)',
                  color: 'var(--theme-accent)',
                }}
                className="w-14 h-14 mx-auto rounded-2xl border flex items-center justify-center shadow-md"
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2
                  style={{ color: 'var(--theme-text)' }}
                  className="text-xl font-bold tracking-tight"
                >
                  Instant Video Chat
                </h2>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs leading-relaxed max-w-sm mx-auto"
                >
                  Meet verified adults worldwide with real-time screen sharing and E2E encryption.
                </p>
              </div>

              {/* Gender Preference Quick Selector */}
              <div
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                }}
                className="p-3.5 rounded-2xl border text-left"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    style={{ color: 'var(--theme-text)' }}
                    className="text-xs font-semibold"
                  >
                    Who do you want to match with?
                  </span>
                  <span
                    style={{ color: 'var(--theme-accent)' }}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    Filter
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'any', label: 'Anyone', icon: '🌐' },
                    { id: 'female', label: 'Female', icon: '👩' },
                    { id: 'male', label: 'Male', icon: '👨' },
                    { id: 'nonbinary', label: 'Non-Binary', icon: '🧑' },
                  ].map(item => {
                    const isSelected = genderPreference === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`btn-match-filter-${item.id}`}
                        type="button"
                        onClick={() => onSelectGenderPreference(item.id as GenderPreference)}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--theme-accent)'
                            : 'var(--theme-surface)',
                          borderColor: isSelected
                            ? 'var(--theme-accent)'
                            : 'var(--theme-border)',
                          color: isSelected
                            ? 'var(--theme-accent-text)'
                            : 'var(--theme-text-muted)',
                        }}
                        className="py-2 px-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm hover:opacity-95"
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span className="text-[11px] font-semibold truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Camera Notice */}
              <div
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-accent-border)',
                  color: 'var(--theme-text)',
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[11px]"
              >
                <Video className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-accent)' }} />
                <span>
                  <strong>Camera Rule:</strong> Video chat requires an active camera. Disabling camera stops the call automatically.
                </span>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div
                      style={{ color: 'var(--theme-text)' }}
                      className="text-[11px] font-semibold"
                    >
                      End-to-End Encrypted
                    </div>
                    <div
                      style={{ color: 'var(--theme-text-muted)' }}
                      className="text-[10px]"
                    >
                      AES-GCM 256-bit
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border"
                >
                  <MonitorUp
                    className="w-4 h-4 shrink-0"
                    style={{ color: 'var(--theme-accent)' }}
                  />
                  <div>
                    <div
                      style={{ color: 'var(--theme-text)' }}
                      className="text-[11px] font-semibold"
                    >
                      Screen Sharing
                    </div>
                    <div
                      style={{ color: 'var(--theme-text-muted)' }}
                      className="text-[10px]"
                    >
                      HD WebRTC feed
                    </div>
                  </div>
                </div>
              </div>

              <button
                id="btn-start-random-match"
                type="button"
                onClick={onStartSearch}
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                  boxShadow: '0 10px 25px -5px var(--theme-glow)',
                }}
                className="w-full py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:opacity-95"
              >
                <Search className="w-4 h-4" />
                <span>Start Video Chat</span>
              </button>

              {/* Quick Testing Options (Mobile QR & Simulation) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {onOpenTestMobile && (
                  <button
                    id="btn-idle-open-mobile-test"
                    type="button"
                    onClick={onOpenTestMobile}
                    style={{
                      backgroundColor: 'var(--theme-surface-solid)',
                      borderColor: 'var(--theme-border-strong)',
                      color: 'var(--theme-text)',
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-90 shadow-sm"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Scan Mobile QR Code</span>
                  </button>
                )}
                {onSimulateTestMatch && (
                  <button
                    id="btn-idle-simulate-match"
                    type="button"
                    onClick={onSimulateTestMatch}
                    style={{
                      backgroundColor: 'var(--theme-accent-subtle)',
                      borderColor: 'var(--theme-accent-border)',
                      color: 'var(--theme-accent)',
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:opacity-90 shadow-sm"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Simulate Instant Match</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {callStatus === 'searching' && (
            <div className="space-y-6">
              {/* Radar Wave Animation with Theme Accent */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div
                  style={{ borderColor: 'var(--theme-accent)' }}
                  className="absolute inset-0 rounded-full border-2 animate-ping opacity-50"
                />
                <div
                  style={{ borderColor: 'var(--theme-accent)' }}
                  className="absolute inset-2 rounded-full border animate-pulse opacity-80"
                />
                <div
                  style={{
                    backgroundColor: 'var(--theme-accent-subtle)',
                    borderColor: 'var(--theme-accent-border)',
                    color: 'var(--theme-accent)',
                  }}
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-inner"
                >
                  <Search className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3
                  style={{ color: 'var(--theme-text)' }}
                  className="text-base font-semibold"
                >
                  Searching for someone online...
                </h3>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs"
                >
                  Matching queue position: #{queuePosition || 1} • Filter: {genderPreference}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  id="btn-cancel-search"
                  type="button"
                  onClick={onCancelSearch}
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                  className="py-2.5 px-4 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Search</span>
                </button>

                {onOpenTestMobile && (
                  <button
                    id="btn-searching-open-mobile"
                    type="button"
                    onClick={onOpenTestMobile}
                    style={{
                      backgroundColor: 'var(--theme-surface-solid)',
                      borderColor: 'var(--theme-border-strong)',
                      color: 'var(--theme-text)',
                    }}
                    className="py-2.5 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connect Phone</span>
                  </button>
                )}

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
                    className="py-2.5 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Instant Match</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {callStatus === 'connecting' && (
            <div className="space-y-4">
              <div
                style={{
                  backgroundColor: 'var(--theme-accent-subtle)',
                  borderColor: 'var(--theme-accent-border)',
                  color: 'var(--theme-accent)',
                }}
                className="w-14 h-14 mx-auto rounded-full border flex items-center justify-center animate-spin"
              >
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3
                  style={{ color: 'var(--theme-text)' }}
                  className="text-base font-semibold"
                >
                  Match Found!
                </h3>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs"
                >
                  Negotiating WebRTC stream & ECDH P-256 E2EE keys...
                </p>
              </div>
            </div>
          )}

          {callStatus === 'partner_skipped' && (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3
                  style={{ color: 'var(--theme-text)' }}
                  className="text-base font-semibold"
                >
                  Partner skipped to next person
                </h3>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs"
                >
                  Ready to match with someone new?
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
                className="py-2.5 px-6 rounded-xl text-xs font-semibold shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer hover:opacity-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Next Person</span>
              </button>
            </div>
          )}

          {callStatus === 'partner_disconnected' && (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                {disconnectReason?.includes('Camera') || disconnectReason?.includes('camera') ? (
                  <VideoOff className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1.5">
                <h3
                  style={{ color: 'var(--theme-text)' }}
                  className="text-base font-semibold"
                >
                  {disconnectReason?.includes('Camera') || disconnectReason?.includes('camera')
                    ? 'Call Ended Automatically'
                    : 'Call Ended'}
                </h3>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-xs leading-relaxed max-w-sm mx-auto"
                >
                  {disconnectReason || 'The video chat has ended.'}
                </p>
              </div>

              {disconnectReason?.includes('camera') && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Camera must remain enabled throughout the video chat. Please turn on your camera to start a new match.
                  </span>
                </div>
              )}

              <button
                id="btn-match-after-disconnect"
                type="button"
                onClick={onStartSearch}
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="py-2.5 px-6 rounded-xl text-xs font-semibold shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer hover:opacity-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Someone New</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Local Self Video (Picture-in-Picture Preview) */}
      <div
        id="local-video-pip"
        style={{
          borderColor: 'var(--theme-border-strong)',
          backgroundColor: 'var(--theme-surface-solid)',
        }}
        className="absolute bottom-4 right-4 w-36 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden border-2 shadow-2xl z-20 transition-all group"
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
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              color: 'var(--theme-text-muted)',
            }}
            className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
          >
            <VideoOff className="w-6 h-6 text-rose-400 mb-1" />
            <span className="text-[10px] text-rose-400 font-medium">Camera Disabled</span>
            <span className="text-[9px] opacity-70">Must be on to chat</span>
          </div>
        )}

        {/* Local Stream Overlay Badges */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium">You</span>
            {isVirtualStream && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300" title="Virtual Avatar Mode">
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
              <span className="p-1 rounded bg-rose-500/40 text-rose-300" title="Microphone muted">
                <MicOff className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
