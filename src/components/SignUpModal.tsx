import React, { useState } from 'react';
import { UserProfile, Gender, GenderPreference } from '../types';
import { COUNTRIES } from '../utils/countries';
import {
  Video,
  ShieldCheck,
  Globe,
  Dice5,
  AlertCircle,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl overflow-y-auto"
      onClick={(e) => {
        if (!isMandatory && onClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="signup-modal-card"
        style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border-strong)',
          color: 'var(--theme-text)',
        }}
        className="relative w-full max-w-md my-8 rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-colors duration-200"
      >
        {/* Close button if not mandatory */}
        {!isMandatory && onClose && (
          <button
            id="btn-close-signup"
            type="button"
            onClick={onClose}
            style={{ color: 'var(--theme-text-muted)' }}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-md"
          >
            <Video className="w-6 h-6" />
          </div>
          <h2 style={{ color: 'var(--theme-text)' }} className="text-2xl font-semibold tracking-tight">
            {isMandatory ? 'Set Up Your Profile' : 'Edit Profile'}
          </h2>
          <p style={{ color: 'var(--theme-text-muted)' }} className="text-xs mt-1 max-w-xs mx-auto">
            Choose how you appear to others in video conversations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar & Display Name */}
          <div>
            <label style={{ color: 'var(--theme-text)' }} className="block text-xs font-medium mb-1.5">
              Display Name & Avatar
            </label>
            <div className="flex items-center gap-2.5">
              <img
                src={`https://api.dicebear.com/7.x/${avatarSeed}/svg?seed=${name || 'user'}`}
                alt="Avatar"
                referrerPolicy="no-referrer"
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                }}
                className="w-11 h-11 rounded-full border object-cover shadow-sm p-0.5"
              />

              <div className="flex-1">
                <input
                  id="input-display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={24}
                  placeholder="Enter your name"
                  required
                  style={{
                    backgroundColor: 'var(--theme-surface-solid)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                  className="w-full py-2 px-3.5 rounded-full border text-xs focus:outline-none transition-colors"
                />
              </div>

              <button
                id="btn-randomize-avatar-name"
                type="button"
                onClick={handleRandomizeName}
                title="Randomize"
                style={{
                  backgroundColor: 'var(--theme-surface-solid)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                className="p-2 rounded-full border transition-colors flex items-center justify-center cursor-pointer hover:bg-white/[0.08]"
              >
                <Dice5 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Age & Country Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Age Input */}
            <div>
              <label htmlFor="input-age" style={{ color: 'var(--theme-text)' }} className="block text-xs font-medium mb-1.5">
                Age <span style={{ color: 'var(--theme-text-muted)' }}>(18+)</span>
              </label>
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
                  borderColor: ageError ? '#ff3b30' : 'var(--theme-border)',
                  color: 'var(--theme-text)',
                }}
                className="w-full py-2 px-3.5 rounded-full border text-xs focus:outline-none transition-colors"
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
              <label htmlFor="select-country" style={{ color: 'var(--theme-text)' }} className="block text-xs font-medium mb-1.5">
                Region
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
                  className="w-full py-2 pl-3.5 pr-8 rounded-full border text-xs focus:outline-none appearance-none transition-colors cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} style={{ backgroundColor: '#161618', color: '#f5f5f7' }}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <div style={{ color: 'var(--theme-text-muted)' }} className="absolute right-3 top-2.5 pointer-events-none">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label style={{ color: 'var(--theme-text)' }} className="block text-xs font-medium mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
                { id: 'nonbinary', label: 'Non-Binary' },
                { id: 'other', label: 'Other' },
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
                    className="py-1.5 px-2 rounded-full border text-xs font-medium flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Preference */}
          <div>
            <label style={{ color: 'var(--theme-text)' }} className="block text-xs font-medium mb-1.5">
              Match Preference
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'any', label: 'Everyone' },
                { id: 'female', label: 'Women' },
                { id: 'male', label: 'Men' },
                { id: 'nonbinary', label: 'Non-Binary' },
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
                    className="py-1.5 px-2 rounded-full border text-xs font-medium flex items-center justify-center transition-all cursor-pointer"
                  >
                    <span>{pref.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera Requirement Notice */}
          <div
            style={{
              backgroundColor: 'var(--theme-surface-solid)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-muted)',
            }}
            className="p-3 rounded-2xl border text-[11px] flex items-start gap-2 leading-relaxed"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Video chat requires active camera participation from both people. Turning off camera automatically closes the room.
            </span>
          </div>

          {/* Terms checkbox */}
          <label style={{ color: 'var(--theme-text-muted)' }} className="flex items-center gap-2 text-xs cursor-pointer select-none pt-1">
            <input
              id="chk-terms"
              type="checkbox"
              checked={termsAgreed}
              onChange={e => setTermsAgreed(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <span>I am 18 years or older and accept terms</span>
          </label>

          {/* Submit Button */}
          <button
            id="btn-submit-signup"
            type="submit"
            disabled={!termsAgreed || age === '' || age < 18}
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: 'var(--theme-accent-text)',
            }}
            className="w-full py-3 px-5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 shadow-md mt-2"
          >
            <span>{isMandatory ? 'Enter Video Chat' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
