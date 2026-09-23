import React from 'react';
import { ThemeId } from '../types';
import { DISPLAY_THEMES, ThemeConfig } from '../utils/themes';
import { Check, X, Sun, Moon } from 'lucide-react';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="theme-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="theme-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-xl my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-theme-modal"
          type="button"
          onClick={onClose}
          style={{ color: 'var(--theme-text-muted)' }}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h2
            style={{ color: 'var(--theme-text)' }}
            className="text-2xl font-semibold tracking-tight"
          >
            Appearance
          </h2>
          <p
            style={{ color: 'var(--theme-text-muted)' }}
            className="text-xs"
          >
            Select your preferred display finish and contrast mode.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {DISPLAY_THEMES.map((theme: ThemeConfig) => {
            const isSelected =
              currentTheme === theme.id ||
              (theme.id === 'apple-dark' && currentTheme === 'cyber-dark') ||
              (theme.id === 'apple-light' && currentTheme === 'clean-light');

            return (
              <button
                key={theme.id}
                id={`btn-select-theme-${theme.id}`}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                style={{
                  backgroundColor: theme.cssVars.surfaceSolid,
                  borderColor: isSelected ? theme.cssVars.accent : theme.cssVars.border,
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                  isSelected ? 'ring-2 ring-blue-500/40' : 'hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Bar with Name & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.cssVars.accent }}
                      />
                      <span
                        style={{ color: theme.cssVars.text }}
                        className="text-sm font-semibold tracking-tight"
                      >
                        {theme.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {theme.isLight ? (
                        <span
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            color: theme.cssVars.textMuted,
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5"
                        >
                          <Sun className="w-2.5 h-2.5" /> Light
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: theme.cssVars.textMuted,
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5"
                        >
                          <Moon className="w-2.5 h-2.5" /> Dark
                        </span>
                      )}

                      {isSelected ? (
                        <span
                          style={{
                            backgroundColor: theme.cssVars.accent,
                            color: theme.cssVars.accentText,
                          }}
                          className="p-1 rounded-full shadow-sm"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span
                          style={{ borderColor: theme.cssVars.borderStrong }}
                          className="w-4 h-4 rounded-full border"
                        />
                      )}
                    </div>
                  </div>

                  <p
                    style={{ color: theme.cssVars.textMuted }}
                    className="text-[11px] leading-relaxed line-clamp-2"
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Color Swatch Bars */}
                <div className="mt-3.5 flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                  <div
                    className="h-3 flex-1 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.previewColors[0] }}
                    title="Canvas tone"
                  />
                  <div
                    className="h-3 flex-1 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.previewColors[1] }}
                    title="Surface tone"
                  />
                  <div
                    className="h-3 flex-1 rounded-full"
                    style={{ backgroundColor: theme.previewColors[2] }}
                    title="Accent tone"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <span style={{ color: 'var(--theme-text-muted)' }}>
            Appearance settings save automatically to your browser.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="py-1.5 px-4 rounded-full font-medium text-xs cursor-pointer hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
