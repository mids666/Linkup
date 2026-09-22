import React, { useState } from 'react';
import { UserProfile, Gender, GenderPreference } from '../types';
import { COUNTRIES } from '../utils/countries';
import {
  Video,
  ShieldCheck,
  Globe,
  Dice5,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose?: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
  isMandatory?: boolean;
}

const AVATAR_SEEDS = [
  'adventurer',
  'avataaars',
  'bottts',
  'fun-emoji',
  'lorelei',
  'micah',
  'miniavs',
  'personas',
  'shapes',
];

const RANDOM_NAMES = [
  'Atlas',
  'Nova',
  'Orion',
  'Zephyr',
  'Echo',
  'Sora',
  'Pixel',
  'Cosmo',
  'Aura',
  'Vesper',
  'Zenith',
  'Sol',
];

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  isMandatory = false,
}) => {
  const [name, setName] = useState(profile.name || 'Anonymous');
  const [avatarSeed, setAvatarSeed] = useState(profile.avatarSeed || 'adventurer');
  const [age, setAge] = useState<number | ''>(profile.age || 21);
  const [gender, setGender] = useState<Gender>(profile.gender || 'male');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    profile.countryCode || 'US'
  );
  const [genderPreference, setGenderPreference] = useState<GenderPreference>(
    profile.genderPreference || 'any'
  );
  const [ageError, setAgeError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(true);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const rName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const rSeed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    setName(`${rName}_${Math.floor(100 + Math.random() * 900)}`);
    setAvatarSeed(rSeed);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAge('');
      setAgeError('Age is required');
      return;
    }
    const num = parseInt(val, 10);
    setAge(num);
    if (num < 18) {
      setAgeError('You must be 18 or older to join video chat.');
    } else if (num > 120) {
      setAgeError('Please enter a realistic age.');
    } else {
      setAgeError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (age === '' || age < 18) {
      setAgeError('You must be 18 or older to participate.');
      return;
    }
    if (!name.trim()) {
      return;
    }

    const countryObj = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

    onSaveProfile({
      name: name.trim(),
      avatarSeed,
      age: Number(age),
      gender,
      country: countryObj.name,
      countryCode: countryObj.code,
      countryFlag: countryObj.flag,
      genderPreference,
      hasSignedUp: true,
    });

    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      id="signup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="signup-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-lg my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors duration-200"
      >
        {/* Close button if not mandatory */}
        {!isMandatory && onClose && (
          <button
            id="btn-close-signup"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="absolute top-5 right-5 p-2 rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="relative mb-6 text-center">
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Video className="w-7 h-7" />
          </div>
          <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-bold tracking-tight">
            {isMandatory ? 'Welcome to Video Chat' : 'Edit Your Profile'}
          </h2>
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs mt-1 max-w-sm mx-auto">
            Set up your identity before meeting random partners worldwide.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Avatar & Display Name */}
          <div>
            <label style={{ color: 'var(--theme-text)' }} className="block text-xs font-semibold mb-2">
              Display Name & Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={`https://api.dicebear.com/7.x/${avatarSeed}/svg?seed=${name || 'user'}`}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-accent)',
                  }}
                  className="w-13 h-13 rounded-2xl border-2 object-cover shadow-md p-1"
                />
              </div>

              <div className="flex-1 relative">
                <input
                  id="input-display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Enter your nickname"
                  required
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl border text-sm focus:outline-none transition-colors"
                />
              </div>

              <button
                id="btn-randomize-avatar-name"
                type="button"
                onClick={handleRandomizeName}
                title="Randomize Name & Avatar"
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                className="p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer hover:opacity-80"
              >
                <Dice5 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Age & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-age" style={{ color: 'var(--theme-text)' }} className="text-xs font-semibold">
                  Age <span style={{ color: 'var(--theme-accent)' }} className="font-normal">(18+ required)</span>
                </label>
                <span
                  style={{
                    backgroundColor: 'var(--theme-accent-subtle)',
                    borderColor: 'var(--theme-accent-border)',
                    color: 'var(--theme-accent)',
                  }}
                  className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                >
                  18+
                </span>
              </div>
              <input
                id="input-age"
                type="number"
                min="18"
                max="110"
                value={age}
                onChange={handleAgeChange}
                required
                placeholder="18+"
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: ageError ? '#f43f5e' : 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                className="w-full py-2.5 px-3.5 rounded-xl border text-sm focus:outline-none transition-colors"
              />
              {ageError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{ageError}</span>
                </div>
              )}
            </div>

            {/* Country Selector */}
            <div>
              <label htmlFor="select-country" style={{ color: 'var(--theme-text)' }} className="block text-xs font-semibold mb-1.5">
                Country
              </label>
              <div className="relative">
                <select
                  id="select-country"
                  value={selectedCountryCode}
                  onChange={e => setSelectedCountryCode(e.target.value)}
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                  className="w-full py-2.5 px-3.5 pr-8 rounded-xl border text-sm focus:outline-none appearance-none transition-colors cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} style={{ backgroundColor: 'var(--theme-surface-solid)', color: 'var(--theme-text)' }}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <div style={{ color: 'var(--theme-text-muted)' }} className="absolute right-3 top-3 pointer-events-none">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label style={{ color: 'var(--theme-text)' }} className="block text-xs font-semibold mb-2">
              Your Gender
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'male', label: 'Male', icon: '👨' },
                { id: 'female', label: 'Female', icon: '👩' },
                { id: 'nonbinary', label: 'Non-Binary', icon: '🧑' },
                { id: 'other', label: 'Other', icon: '✨' },
              ].map(g => {
                const isSelected = gender === g.id;
                return (
                  <button
                    key={g.id}
                    id={`btn-gender-${g.id}`}
                    type="button"
                    onClick={() => setGender(g.id as Gender)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--theme-accent)'
                        : 'var(--theme-surface-solid)',
                      borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-border)',
                      color: isSelected ? 'var(--theme-accent-text)' : 'var(--theme-text-muted)',
                    }}
                    className="py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Gender Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label style={{ color: 'var(--theme-text)' }} className="text-xs font-semibold">
                Match Preference <span style={{ color: 'var(--theme-text-muted)' }} className="font-normal">(Who to chat with)</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'any', label: 'Anyone', icon: '🌐' },
                { id: 'female', label: 'Female', icon: '👩' },
                { id: 'male', label: 'Male', icon: '👨' },
                { id: 'nonbinary', label: 'Non-Binary', icon: '🧑' },
              ].map(pref => {
                const isSelected = genderPreference === pref.id;
                return (
                  <button
                    key={pref.id}
                    id={`btn-pref-${pref.id}`}
                    type="button"
                    onClick={() => setGenderPreference(pref.id as GenderPreference)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--theme-accent)'
                        : 'var(--theme-surface-solid)',
                      borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-border)',
                      color: isSelected ? 'var(--theme-accent-text)' : 'var(--theme-text-muted)',
                    }}
                    className="py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>{pref.icon}</span>
                    <span>{pref.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandatory Camera & Safety Notice */}
          <div
            style={{
              backgroundColor: 'var(--theme-accent-subtle)',
              borderColor: 'var(--theme-accent-border)',
              color: 'var(--theme-text)',
            }}
            className="p-3.5 rounded-xl border space-y-2 text-[11px]"
          >
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Camera Requirement:</strong> Video chat requires both users to keep cameras turned on. If you turn off your camera during a call, the session will stop automatically.
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <label style={{ color: 'var(--theme-text-muted)' }} className="flex items-center gap-2.5 text-xs cursor-pointer select-none">
            <input
              id="chk-terms"
              type="checkbox"
              checked={termsAgreed}
              onChange={e => setTermsAgreed(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span>I confirm I am 18+ and agree to community standards</span>
          </label>

          {/* Submit Button */}
          <button
            id="btn-submit-signup"
            type="submit"
            disabled={!termsAgreed || age === '' || age < 18}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
              boxShadow: '0 8px 20px -4px var(--theme-glow)',
            }}
            className="w-full py-3.5 px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] hover:opacity-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isMandatory ? 'Enter Video Chat' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
