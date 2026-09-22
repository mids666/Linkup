import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Lock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Binary,
} from 'lucide-react';
import { CryptoInspectorData, EncryptedMessage, UserProfile } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: EncryptedMessage[];
  onSendMessage: (text: string) => void;
  profile: UserProfile;
  partner: { id: string; name: string; avatarSeed: string } | null;
  cryptoData: CryptoInspectorData;
  onOpenCryptoInspector: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  profile,
  partner,
  cryptoData,
  onOpenCryptoInspector,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="chat-drawer-panel"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
      className="w-full sm:w-80 md:w-96 border-l flex flex-col h-full z-40 select-none shadow-2xl transition-colors duration-200"
    >
      {/* Drawer Header */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
        className="p-3.5 border-b flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 style={{ color: 'var(--theme-text)' }} className="text-xs font-semibold">
                E2EE Chat
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                AES-256-GCM
              </span>
            </div>
            <div style={{ color: 'var(--theme-text-muted)' }} className="text-[11px]">
              {partner ? `Connected with ${partner.name}` : 'No active peer'}
            </div>
          </div>
        </div>

        <button
          id="btn-close-chat"
          type="button"
          onClick={onClose}
          style={{ color: 'var(--theme-text-muted)' }}
          className="p-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Security Verification Banner */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface-solid)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-muted)',
        }}
        className="px-3.5 py-2 border-b flex items-center justify-between text-[11px]"
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
          <span>Safety Code:</span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--theme-accent)' }}>
            {cryptoData.safetyNumber.slice(0, 11)}...
          </span>
        </div>
        <button
          id="btn-verify-crypto-chat"
          type="button"
          onClick={onOpenCryptoInspector}
          style={{ color: 'var(--theme-accent)' }}
          className="font-medium text-[10px] hover:underline cursor-pointer"
        >
          Inspect
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{ backgroundColor: 'var(--theme-bg)' }}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <div
              style={{ backgroundColor: 'var(--theme-surface-solid)' }}
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
            >
              <Lock className="w-5 h-5 opacity-70" />
            </div>
            <p className="text-xs font-medium">End-to-End Encrypted</p>
            <p className="text-[11px] mt-1 max-w-[200px] opacity-75">
              Messages are encrypted on your device and can only be read by you and your partner.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === profile.id;
            const isExpanded = expandedMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="flex items-center gap-1 text-[10px] mb-1 px-1"
                >
                  <span>{isMe ? 'You' : msg.senderName}</span>
                  <span>•</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.isEncrypted && (
                    <span title="AES-GCM Authenticated Ciphertext">
                      <Lock className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />
                    </span>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: isMe
                      ? 'var(--theme-accent)'
                      : 'var(--theme-surface-solid)',
                    color: isMe
                      ? 'var(--theme-accent-text)'
                      : 'var(--theme-text)',
                    borderColor: isMe ? 'transparent' : 'var(--theme-border)',
                  }}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-sm border`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Cryptographic Inspector Accordion */}
                {msg.ciphertextHex && (
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMessageId(isExpanded ? null : msg.id)
                      }
                      style={{ color: 'var(--theme-text-muted)' }}
                      className="flex items-center gap-1 text-[10px] hover:opacity-80 transition-opacity py-0.5 px-1 cursor-pointer"
                    >
                      <Binary className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide Ciphertext' : 'View Ciphertext'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-2.5 h-2.5" />
                      ) : (
                        <ChevronDown className="w-2.5 h-2.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          backgroundColor: 'var(--theme-surface-solid)',
                          borderColor: 'var(--theme-border)',
                        }}
                        className="mt-1 p-2 rounded-lg border text-[10px] font-mono max-w-[280px] space-y-1"
                      >
                        <div>
                          <span style={{ color: 'var(--theme-text-muted)' }}>IV (12-byte): </span>
                          <span className="text-amber-400 break-all">{msg.ivHex}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--theme-text-muted)' }}>Ciphertext + Tag: </span>
                          <span className="text-emerald-400 break-all">
                            {msg.ciphertextHex}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
        className="p-3 border-t"
      >
        <div className="flex items-center gap-2">
          <input
            id="input-chat-message"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              partner
                ? 'Send encrypted message...'
                : 'Connect to a partner to chat...'
            }
            disabled={!partner}
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text)',
            }}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-colors disabled:opacity-50"
          />
          <button
            id="btn-send-message"
            type="submit"
            disabled={!inputText.trim() || !partner}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
