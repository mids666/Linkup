import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  Check,
  Sparkles,
  X,
  Users,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200"
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
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2
                style={{ color: 'var(--theme-text)' }}
                className="text-base font-semibold leading-tight"
              >
                Connect on Mobile
              </h2>
              <p
                style={{ color: 'var(--theme-text-muted)' }}
                className="text-xs"
              >
                Open on iPhone or Android to chat between devices
              </p>
            </div>
          </div>

          <button
            id="btn-close-test-mobile"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Server status pill */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3 rounded-2xl border flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span style={{ color: 'var(--theme-text)' }} className="font-medium">
                Live Server
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
              <Users className="w-3.5 h-3.5" />
              <span>{serverStats.onlineCount} Online</span>
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
            <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs">
              Scan with your phone's camera to join
            </p>

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
                className="w-full text-[11px] font-mono py-2 px-3.5 rounded-full border focus:outline-none select-all truncate"
              />
              <button
                id="btn-copy-mobile-url"
                type="button"
                onClick={handleCopy}
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: 'var(--theme-accent-text)',
                }}
                className="py-2 px-3.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 hover:opacity-90"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Simulate option */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3.5 rounded-2xl border flex items-center justify-between"
          >
            <div>
              <div style={{ color: 'var(--theme-text)' }} className="text-xs font-semibold">
                Instant Simulation
              </div>
              <div style={{ color: 'var(--theme-text-muted)' }} className="text-[11px]">
                Test audio, video, & encryption immediately
              </div>
            </div>

            <button
              id="btn-simulate-partner-modal"
              type="button"
              onClick={handleRunBot}
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="py-2 px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
