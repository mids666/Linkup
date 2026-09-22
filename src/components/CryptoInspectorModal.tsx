import React from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Key,
  Binary,
  CheckCircle2,
  Cpu,
  Eye,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Cryptographic Security Inspector</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  E2EE Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time Web Crypto API verification with {partnerName || 'Peer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Number Comparison Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Safety Number (Cryptographic Fingerprint)</span>
          </div>
          <div className="text-lg sm:text-xl font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/20 py-2.5 px-4 rounded-lg border border-emerald-500/20">
            {cryptoData.safetyNumber}
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Compare this number with your partner. If the numbers match on both screens, your
            session is cryptographically verified and free from eavesdropping.
          </p>
        </div>

        {/* Protocol Specifications Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Symmetric Cipher</span>
            </div>
            <div className="text-xs font-mono text-white">{cryptoData.algorithm}</div>
            <div className="text-[10px] text-slate-400">Authenticated encryption with 128-bit tag</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Key Agreement</span>
            </div>
            <div className="text-xs font-mono text-white">{cryptoData.keyExchange}</div>
            <div className="text-[10px] text-slate-400">Ephemeral Diffie-Hellman P-256</div>
          </div>
        </div>

        {/* Shared Key Fingerprint */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session Key Fingerprint:</span>
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Hardware Derived
            </span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 font-mono text-xs text-indigo-300 break-all select-all">
            {cryptoData.sharedKeyFingerprint}
          </div>
        </div>

        {/* Live Ciphertext Payload Inspector */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Latest Transmitted Ciphertext:</span>
            </span>
            <span className="text-[10px] text-slate-400">WebRTC DataChannel</span>
          </div>

          {cryptoData.lastEncryptedPayload ? (
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-slate-950 text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500">IV: </span>
                  <span className="text-amber-400">{cryptoData.lastEncryptedPayload.iv}</span>
                </div>
                <div>
                  <span className="text-slate-500">Payload: </span>
                  <span className="text-emerald-400">
                    {cryptoData.lastEncryptedPayload.ciphertextSnippet}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Auth Tag: </span>
                  <span className="text-cyan-400">
                    {cryptoData.lastEncryptedPayload.authTagSnippet}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Only ciphertext traverses the network. The server cannot inspect or alter
                the message contents.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 text-center text-xs text-slate-500 italic">
              Send a message in chat to observe the real-time encrypted ciphertext and IV stream.
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs border border-slate-700 transition-all"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
