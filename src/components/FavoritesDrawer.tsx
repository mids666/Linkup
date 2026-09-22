import React, { useState } from 'react';
import {
  X,
  Star,
  PhoneCall,
  Trash2,
  Edit3,
  Check,
  Clock,
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
      className="fixed inset-y-0 right-0 w-full sm:w-96 border-l shadow-2xl z-50 flex flex-col select-none transition-colors duration-200"
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
        className="p-4 border-b flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <h2 style={{ color: 'var(--theme-text)' }} className="text-sm font-bold">
              Favorite Contacts
            </h2>
            <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs">
              People you saved to meet again
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-refresh-favorites"
            type="button"
            onClick={onRefreshStatus}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
            title="Refresh Online Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-close-favorites"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
            <div
              style={{ backgroundColor: 'var(--theme-surface-solid)' }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            >
              <UserCheck className="w-6 h-6 opacity-70" />
            </div>
            <h3 className="text-sm font-semibold">No Favorites Saved Yet</h3>
            <p className="text-xs mt-1 max-w-[240px] leading-relaxed opacity-75">
              When having a great conversation with a partner, click the Star icon on their video
              to save them here so you can call and meet again anytime!
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
                className="p-3.5 rounded-xl border transition-all space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{
                        backgroundColor: 'var(--theme-accent)',
                        color: 'var(--theme-accent-text)',
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                    >
                      {fav.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--theme-text)' }} className="text-xs font-bold">
                          {fav.name}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-emerald-400 ring-2 ring-emerald-950' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div
                        style={{ color: 'var(--theme-text-muted)' }}
                        className="text-[10px] flex items-center gap-1 mt-0.5"
                      >
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>Saved {new Date(fav.addedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={isOnline ? (isBusy ? 'text-amber-400' : 'text-emerald-400') : 'text-slate-500'}>
                          {isOnline ? (isBusy ? 'In Call' : 'Online') : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-remove-fav-${fav.id}`}
                    type="button"
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                  className="p-2.5 rounded-lg border text-xs"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add note (e.g. met during tech chat)"
                        style={{
                          backgroundColor: 'var(--theme-surface-solid)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text)',
                        }}
                        className="flex-1 text-xs px-2 py-1 rounded border outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(fav.id)}
                        style={{
                          backgroundColor: 'var(--theme-accent)',
                          color: 'var(--theme-accent-text)',
                        }}
                        className="p-1 rounded cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p style={{ color: 'var(--theme-text-muted)' }} className="text-[11px] italic">
                        {fav.notes || 'No notes added'}
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
                    backgroundColor: isOnline && !isBusy ? 'var(--theme-accent)' : 'var(--theme-surface)',
                    color: isOnline && !isBusy ? 'var(--theme-accent-text)' : 'var(--theme-text-muted)',
                    borderColor: 'var(--theme-border)',
                  }}
                  className="w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    {isOnline ? (isBusy ? 'User in Another Call' : 'Direct Video Call') : 'User Offline'}
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
