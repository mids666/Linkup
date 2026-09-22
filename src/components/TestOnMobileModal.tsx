import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Sparkles,
  X,
  Users,
  Wifi,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { ServerStats } from '../types';

interface TestOnMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStats: ServerStats;
  onSimulateTestMatch: () => void;
}

export const TestOnMobileModal: React.FC<TestOnMobileModalProps> = ({
  isOpen,
  onClose,
  serverStats,
  onSimulateTestMatch,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=000000&margin=8`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleRunBot = () => {
    onClose();
    onSimulateTestMatch();
  };

  return (
    <div
      id="test-mobile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="test-mobile-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
          boxShadow: '0 25px 50px -12px var(--theme-glow)',
        }}
        className="w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
      >
        {/* Header */}
        <div
          style={{ borderColor: 'var(--theme-border)' }}
          className="p-5 border-b flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--theme-accent-subtle)',
                color: 'var(--theme-accent)',
                borderColor: 'var(--theme-accent-border)',
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-sm"
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{ color: 'var(--theme-text)' }}
                className="text-base font-bold leading-tight"
              >
                Test on Mobile & Matching
              </h2>
              <p
                style={{ color: 'var(--theme-text-muted)' }}
                className="text-xs"
              >
                Connect a second device or simulate an instant match
              </p>
            </div>
          </div>

          <button
            id="btn-close-test-mobile"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Server Connection Status Banner */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3 rounded-2xl border flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span
                style={{ color: 'var(--theme-text)' }}
                className="text-xs font-semibold"
              >
                Server Connected
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span
                style={{ color: 'var(--theme-text-muted)' }}
                className="flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" />
                <strong style={{ color: 'var(--theme-text)' }}>
                  {serverStats.onlineCount}
                </strong>{' '}
                Online
              </span>
              <span
                style={{ color: 'var(--theme-accent)' }}
                className="font-medium"
              >
                {serverStats.queueCount} searching
              </span>
            </div>
          </div>

          {/* QR Code & Direct Link */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-4 rounded-2xl border text-center space-y-3"
          >
            <div className="text-xs font-semibold text-left flex items-center justify-between">
              <span style={{ color: 'var(--theme-text)' }}>1. Scan with Phone Camera</span>
              <span style={{ color: 'var(--theme-text-muted)' }} className="text-[10px]">
                Must use this exact link
              </span>
            </div>

            {/* QR Image */}
            <div className="bg-white p-2.5 rounded-2xl w-44 h-44 mx-auto shadow-md flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt="Scan to open on phone"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* URL Copy Box */}
            <div className="flex items-center gap-2">
              <input
                id="input-mobile-test-url"
                type="text"
                readOnly
                value={currentUrl}
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                className="w-full text-[11px] font-mono py-2 px-3 rounded-xl border focus:outline-none select-all truncate"
              />
              <button
                id="btn-copy-mobile-url"
                type="button"
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? '#10b981' : 'var(--theme-accent)',
                  color: '#ffffff',
                }}
                className="py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions checklist */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3.5 rounded-2xl border text-left space-y-2 text-xs"
          >
            <div
              style={{ color: 'var(--theme-text)' }}
              className="font-semibold flex items-center gap-1.5 text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How matching between 2 devices works:</span>
            </div>
            <ul
              style={{ color: 'var(--theme-text-muted)' }}
              className="space-y-1.5 text-[11px] pl-4 list-disc"
            >
              <li>
                Ensure <strong>BOTH</strong> devices open the exact same link above.
              </li>
              <li>
                Click <strong>"Start Video Chat"</strong> on device 1, then click{' '}
                <strong>"Start Video Chat"</strong> on device 2.
              </li>
              <li>
                Both devices will match in under 1 second!
              </li>
            </ul>
          </div>

          {/* Quick Option: Simulate Match instantly */}
          <div
            style={{
              backgroundColor: 'var(--theme-accent-subtle)',
              borderColor: 'var(--theme-accent-border)',
            }}
            className="p-3.5 rounded-2xl border text-left space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                <span
                  style={{ color: 'var(--theme-text)' }}
                  className="font-bold text-xs"
                >
                  Don't want to use phone right now?
                </span>
              </div>
              <span
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide"
              >
                Instant
              </span>
            </div>
            <p
              style={{ color: 'var(--theme-text-muted)' }}
              className="text-[11px] leading-relaxed"
            >
              Simulate a live partner (Sophia 🇫🇷) with real WebRTC video, audio, E2EE
              encryption handshake, and interactive chat bot responses.
            </p>
            <button
              id="btn-simulate-match-from-modal"
              type="button"
              onClick={handleRunBot}
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:opacity-95 active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Instant Match Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
