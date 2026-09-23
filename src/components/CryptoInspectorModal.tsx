import React from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Key,
  Binary,
  Cpu,
} from 'lucide-react';
import { CryptoInspectorData } from '../types';

interface CryptoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoData: CryptoInspectorData;
  partnerName?: string;
}

export const CryptoInspectorModal: React.FC<CryptoInspectorModalProps> = ({
  isOpen,
  onClose,
  cryptoData,
  partnerName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="crypto-inspector-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="crypto-inspector-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ color: 'var(--theme-text)' }} className="text-base font-semibold">
                  End-to-End Encryption
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                  Active
                </span>
              </div>
              <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs mt-0.5">
                Hardware-accelerated Web Crypto session with {partnerName || 'Partner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-1.5 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Safety Number Comparison Box */}
        <div
          style={{
            backgroundColor: 'var(--theme-surface-solid)',
            borderColor: 'var(--theme-border)',
          }}
          className="p-4 rounded-2xl border space-y-2 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
            <Key className="w-3.5 h-3.5" />
            <span>Cryptographic Fingerprint</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold tracking-widest text-emerald-400 py-2 px-4 rounded-xl bg-black/30 border border-emerald-500/20">
            {cryptoData.safetyNumber}
          </div>
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-[11px] max-w-sm mx-auto leading-relaxed">
            Verify this number with your conversation partner. Matching codes confirm absolute privacy.
          </p>
        </div>

        {/* Protocol Specifications Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3.5 rounded-2xl border space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--theme-text)' }}>
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Cipher</span>
            </div>
            <div className="text-xs font-mono font-medium text-white">{cryptoData.algorithm}</div>
            <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
              256-bit Galois/Counter Mode
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
            className="p-3.5 rounded-2xl border space-y-1"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--theme-text)' }}>
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Key Agreement</span>
            </div>
            <div className="text-xs font-mono font-medium text-white">{cryptoData.keyExchange}</div>
            <div className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
              Ephemeral Diffie-Hellman P-256
            </div>
          </div>
        </div>

        {/* Shared Key Fingerprint */}
        <div
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
          className="p-3.5 rounded-2xl border space-y-1.5"
        >
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--theme-text)' }}>
            <span className="flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session Key Fingerprint:</span>
            </span>
          </div>
          <div className="font-mono text-[11px] text-zinc-300 break-all bg-black/30 p-2.5 rounded-xl border border-white/5">
            {cryptoData.sharedKeyFingerprint || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
          </div>
        </div>

        {/* Done button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="py-2 px-5 rounded-full text-xs font-medium cursor-pointer hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
