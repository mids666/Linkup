import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-center space-y-6 animate-bounce-short">
        {/* Ringing Visualizer */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-emerald-500/60 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-600/30">
            {incomingCall.caller.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Video className="w-3.5 h-3.5" />
            Incoming Video Call
          </span>
          <h3 className="text-lg font-bold text-white mt-2">{incomingCall.caller.name}</h3>
          <p className="text-xs text-slate-400">is calling you to meet again!</p>
        </div>

        {/* Accept & Decline Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            id="btn-decline-incoming-call"
            onClick={onDecline}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            id="btn-accept-incoming-call"
            onClick={onAccept}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4 animate-pulse" />
            <span>Accept Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
