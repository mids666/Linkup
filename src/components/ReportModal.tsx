import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSubmitReport: (reason: string, details: string, autoFindNext: boolean) => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate_content', label: 'Inappropriate Content or Nudity', desc: 'Displaying explicit, suggestive, or illegal visuals' },
  { id: 'harassment', label: 'Harassment or Abusive Behavior', desc: 'Threatening language, hostility, or discrimination' },
  { id: 'spam', label: 'Spam or Commercial Advertising', desc: 'Promoting unauthorized services or bot behavior' },
  { id: 'underage', label: 'Underage User', desc: 'Appears to be under the platform age requirement' },
  { id: 'other', label: 'Other Concern', desc: 'Behavior that violates community standards' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [autoFindNext, setAutoFindNext] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(selectedReason, details, autoFindNext);
    onClose();
  };

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="report-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ color: 'var(--theme-text)' }} className="text-base font-semibold">
                Report & Block
              </h3>
              <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs">
                Reporting {partnerName || 'user'}
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

        {/* Warning Note */}
        <div
          style={{
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            borderColor: 'rgba(255, 59, 48, 0.25)',
          }}
          className="p-3 rounded-2xl border text-xs text-rose-300 leading-relaxed"
        >
          Submitting a report ends this call immediately and prevents matching with this person again.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label style={{ color: 'var(--theme-text)' }} className="text-xs font-medium">
              Reason:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(255, 59, 48, 0.15)'
                        : 'var(--theme-surface-solid)',
                      borderColor: isSelected
                        ? 'rgba(255, 59, 48, 0.4)'
                        : 'var(--theme-border)',
                    }}
                    className="p-2.5 rounded-2xl border text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--theme-text)' }} className="text-xs font-medium">
                        {r.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p style={{ color: 'var(--theme-text-muted)' }} className="text-[11px] mt-0.5">
                      {r.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label style={{ color: 'var(--theme-text)' }} className="text-xs font-medium">
              Additional Details (Optional):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Any details to help safety review..."
              rows={2}
              style={{
                backgroundColor: 'var(--theme-surface-solid)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
              }}
              className="w-full text-xs p-3 rounded-2xl border outline-none resize-none"
            />
          </div>

          {/* Auto find next checkbox */}
          <label style={{ color: 'var(--theme-text-muted)' }} className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoFindNext}
              onChange={(e) => setAutoFindNext(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span>Automatically match with next person</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              style={{ color: 'var(--theme-text-muted)' }}
              className="py-2 px-4 rounded-full text-xs font-medium hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-white text-xs font-medium shadow-md transition-all cursor-pointer"
            >
              Report & Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
