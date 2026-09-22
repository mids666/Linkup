import React, { useState } from 'react';
import { Flag, X, ShieldAlert, Check } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSubmitReport: (reason: string, details: string, autoFindNext: boolean) => void;
}

const REPORT_REASONS = [
  { id: 'inappropriate_content', label: 'Inappropriate Content or Nudity', desc: 'Displaying explicit, suggestive, or illegal visuals' },
  { id: 'harassment', label: 'Harassment or Hate Speech', desc: 'Abusive language, threatening behavior, or discrimination' },
  { id: 'spam', label: 'Spam, Scams, or Advertising', desc: 'Promoting products, phishing, or bot-like behavior' },
  { id: 'underage', label: 'Underage User', desc: 'Appears to be under the platform age limit' },
  { id: 'other', label: 'Other Violation', desc: 'Other behavior that violates community standards' },
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report & Block User</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reporting <span className="text-white font-medium">{partnerName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
          Reporting will immediately end this session and permanently block this person from being
          matched with you again.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Reason:</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REPORT_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{r.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Additional Details (Optional):</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context for platform moderators..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl text-xs text-white p-2.5 outline-none focus:border-rose-500 transition-colors resize-none placeholder-slate-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoFindNext}
              onChange={(e) => setAutoFindNext(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Automatically find next person after reporting</span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-report-user"
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Submit Report & Block</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
