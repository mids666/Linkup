import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { IncomingCallData } from '../types';

interface IncomingCallModalProps {
  incomingCall: IncomingCallData | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  incomingCall,
  onAccept,
  onDecline,
}) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-sm rounded-3xl border shadow-2xl p-7 text-center space-y-6"
      >
        {/* Apple FaceTime Ringing Avatar */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-40" />
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-2xl shadow-lg"
          >
            {incomingCall.caller.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs uppercase tracking-widest font-medium">
            Incoming Video Call
          </p>
          <h3 style={{ color: 'var(--theme-text)' }} className="text-xl font-semibold tracking-tight">
            {incomingCall.caller.name}
          </h3>
        </div>

        {/* Apple FaceTime Call Controls: Decline & Accept Circles */}
        <div className="flex items-center justify-center gap-10 pt-2">
          <div className="flex flex-col items-center gap-2">
            <button
              id="btn-decline-incoming-call"
              onClick={onDecline}
              className="w-14 h-14 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span style={{ color: 'var(--theme-text-muted)' }} className="text-[11px]">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              id="btn-accept-incoming-call"
              onClick={onAccept}
              className="w-14 h-14 rounded-full bg-[#34c759] hover:bg-[#2db24f] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Accept"
            >
              <Phone className="w-6 h-6 animate-pulse" />
            </button>
            <span style={{ color: 'var(--theme-text-muted)' }} className="text-[11px]">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};
