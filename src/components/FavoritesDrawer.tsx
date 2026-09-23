import React, { useState } from 'react';
import {
  X,
  Star,
  PhoneCall,
  Trash2,
  Edit3,
  Check,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { FavoriteUser } from '../types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteUser[];
  favoritesStatus: Record<string, { online: boolean; status: string }>;
  onCallFavorite: (userId: string) => void;
  onRemoveFavorite: (userId: string) => void;
  onUpdateNotes: (userId: string, notes: string) => void;
  onRefreshStatus: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  favoritesStatus,
  onCallFavorite,
  onRemoveFavorite,
  onUpdateNotes,
  onRefreshStatus,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleStartEditNote = (fav: FavoriteUser) => {
    setEditingId(fav.id);
    setNoteText(fav.notes || '');
  };

  const handleSaveNote = (userId: string) => {
    onUpdateNotes(userId, noteText);
    setEditingId(null);
  };

  return (
    <div
      id="favorites-drawer-panel"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text)',
      }}
      className="fixed inset-y-0 right-0 w-full sm:w-96 border-l shadow-2xl z-50 flex flex-col select-none backdrop-blur-2xl transition-colors duration-200"
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
        className="p-4 border-b flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h2 style={{ color: 'var(--theme-text)' }} className="text-sm font-semibold">
              Favorites
            </h2>
            <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs">
              Saved people to meet again
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-refresh-favorites"
            type="button"
            onClick={onRefreshStatus}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-close-favorites"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div
        style={{ backgroundColor: 'var(--theme-bg)' }}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {favorites.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center mb-3 text-zinc-300">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No Favorites Yet</h3>
            <p className="text-xs mt-1 max-w-[220px] leading-relaxed text-zinc-400">
              When talking with someone you like, tap the star icon to save them for direct calls later.
            </p>
          </div>
        ) : (
          favorites.map((fav) => {
            const statusInfo = favoritesStatus[fav.id];
            const isOnline = statusInfo?.online ?? false;
            const isBusy = statusInfo?.status === 'in_call';
            const isEditing = editingId === fav.id;

            return (
              <div
                key={fav.id}
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                }}
                className="p-3.5 rounded-2xl border transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        backgroundColor: 'var(--theme-accent)',
                        color: 'var(--theme-accent-text)',
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shadow-sm"
                    >
                      {fav.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--theme-text)' }} className="text-xs font-semibold">
                          {fav.name}
                        </span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-400' : 'bg-zinc-500'
                          }`}
                        />
                      </div>
                      <div
                        style={{ color: 'var(--theme-text-muted)' }}
                        className="text-[11px] flex items-center gap-1 mt-0.5"
                      >
                        <span className={isOnline ? (isBusy ? 'text-amber-400' : 'text-emerald-400') : 'text-zinc-500'}>
                          {isOnline ? (isBusy ? 'In a call' : 'Available') : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-remove-fav-${fav.id}`}
                    type="button"
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Notes section */}
                <div
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="p-2.5 rounded-xl border text-xs"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add note..."
                        style={{
                          backgroundColor: 'var(--theme-surface-solid)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)',
                        }}
                        className="flex-1 text-xs px-2.5 py-1 rounded-lg border outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(fav.id)}
                        style={{
                          backgroundColor: 'var(--theme-accent)',
                          color: 'var(--theme-accent-text)',
                        }}
                        className="p-1.5 rounded-lg cursor-pointer hover:opacity-90"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p style={{ color: 'var(--theme-text-muted)' }} className="text-[11px] italic">
                        {fav.notes || 'Add private note...'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(fav)}
                        style={{ color: 'var(--theme-accent)' }}
                        className="text-[10px] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Call Button */}
                <button
                  id={`btn-call-fav-${fav.id}`}
                  type="button"
                  onClick={() => onCallFavorite(fav.id)}
                  disabled={!isOnline || isBusy}
                  style={{
                    backgroundColor: isOnline && !isBusy ? 'var(--theme-accent)' : 'transparent',
                    color: isOnline && !isBusy ? 'var(--theme-accent-text)' : 'var(--theme-text-muted)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="w-full py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-95 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    {isOnline ? (isBusy ? 'User in Another Call' : 'Call Directly') : 'Offline'}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
