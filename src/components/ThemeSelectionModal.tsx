import React from 'react';
import { ThemeId } from '../types';
import { THEMES, ThemeConfig } from '../utils/themes';
import { Palette, Check, X, Sparkles, Sun, Moon } from 'lucide-react';

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

  const themesList = Object.values(THEMES);

  return (
    <div
      id="theme-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="theme-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-2xl my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-theme-modal"
          type="button"
          onClick={onClose}
          style={{ color: 'var(--theme-text-muted)' }}
          className="absolute top-5 right-5 p-2 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="relative mb-6">
          <div
            style={{
              backgroundColor: 'var(--theme-accent-subtle)',
              borderColor: 'var(--theme-accent-border)',
              color: 'var(--theme-accent)',
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-2"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Customizer</span>
          </div>
          <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold tracking-tight">
            Choose Your Visual Theme
          </h2>
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs mt-1">
            Transform the atmosphere with distinct color schemes, ambient tones, and contrast modes.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {themesList.map((theme: ThemeConfig) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                id={`btn-select-theme-${theme.id}`}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                style={{
                  backgroundColor: theme.cssVars.surfaceSolid,
                  borderColor: isSelected ? theme.cssVars.accent : theme.cssVars.border,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${theme.cssVars.accent}, 0 10px 25px -5px ${theme.cssVars.glow}`
                    : 'none',
                }}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]`}
              >
                <div>
                  {/* Top Bar with Name & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]"
                        style={{ backgroundColor: theme.cssVars.accent }}
                      />
                      <span
                        style={{ color: theme.cssVars.text }}
                        className="text-sm font-bold tracking-tight"
                      >
                        {theme.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {theme.isLight ? (
                        <span
                          style={{
                            backgroundColor: theme.cssVars.accentSubtle,
                            color: theme.cssVars.accent,
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5"
                        >
                          <Sun className="w-2.5 h-2.5" /> Light
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: theme.cssVars.accentSubtle,
                            color: theme.cssVars.accent,
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5"
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

                  <div
                    style={{ color: theme.cssVars.accent }}
                    className="text-[11px] font-medium mb-1"
                  >
                    {theme.tagline}
                  </div>

                  <p
                    style={{ color: theme.cssVars.textMuted }}
                    className="text-[11px] leading-relaxed mb-3 line-clamp-2"
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Live UI Mini Preview Strip */}
                <div
                  style={{
                    backgroundColor: theme.cssVars.bg,
                    borderColor: theme.cssVars.border,
                  }}
                  className="p-2 rounded-xl border flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    {theme.previewColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full border border-black/30 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={`Color swatch ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      backgroundColor: theme.cssVars.accent,
                      color: theme.cssVars.accentText,
                    }}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-sm"
                  >
                    {isSelected ? 'Active' : 'Apply'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{ borderColor: 'var(--theme-border)' }}
          className="mt-6 pt-4 border-t flex items-center justify-between"
        >
          <div style={{ color: 'var(--theme-text-muted)' }} className="text-xs">
            Themes are saved automatically to your device.
          </div>
          <button
            id="btn-done-theme-modal"
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="py-2.5 px-6 rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer hover:opacity-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
