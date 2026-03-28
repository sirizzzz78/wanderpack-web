import { useState } from 'react';
import { Card } from '../components/ui/Card';
import type { ClothingPreferences } from '../lib/packingCalculator';

const STYLE_OPTIONS: { value: ClothingPreferences['gender']; label: string }[] = [
  { value: 'none', label: 'No preference' },
  { value: 'masculine', label: 'Masculine' },
  { value: 'feminine', label: 'Feminine' },
];

const BOTTOMS_OPTIONS: { value: ClothingPreferences['bottoms']; label: string }[] = [
  { value: 'pants', label: 'Pants' },
  { value: 'skirts', label: 'Skirts' },
  { value: 'both', label: 'Both' },
];

export function SettingsPage() {
  const [gender, setGender] = useState<ClothingPreferences['gender']>(
    () => (localStorage.getItem('readiLi.genderPref') as ClothingPreferences['gender']) || 'none'
  );
  const [bottoms, setBottoms] = useState<ClothingPreferences['bottoms']>(
    () => (localStorage.getItem('readiLi.bottomsPref') as ClothingPreferences['bottoms']) || 'pants'
  );

  const handleGenderChange = (value: ClothingPreferences['gender']) => {
    setGender(value);
    localStorage.setItem('readiLi.genderPref', value);
  };

  const handleBottomsChange = (value: ClothingPreferences['bottoms']) => {
    setBottoms(value);
    localStorage.setItem('readiLi.bottomsPref', value);
  };

  return (
    <div className="min-h-dvh bg-[var(--background)]" style={{ padding: '0 var(--page-px)' }}>
      <h1
        className="font-semibold text-[var(--text-primary)] tracking-tight"
        style={{ fontSize: 'var(--text-page-title)', paddingTop: '2rem', paddingBottom: '1.5rem' }}
      >
        Settings
      </h1>

      {/* Clothing Preferences */}
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--blue-faint)] mb-2">
        Clothing Preferences
      </p>

      <Card>
        <p className="text-[15px] font-medium text-[var(--text-primary)] mb-3">Style</p>
        <div className="flex flex-col gap-2">
          {STYLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleGenderChange(opt.value)}
              className="flex items-center gap-3 py-2 px-1 rounded-lg transition-colors"
            >
              <span
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  borderColor: gender === opt.value ? 'var(--lavender)' : 'var(--border)',
                }}
              >
                {gender === opt.value && (
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--lavender)' }}
                  />
                )}
              </span>
              <span className="text-[15px] text-[var(--text-primary)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {gender !== 'none' && (
        <Card className="mt-3">
          <p className="text-[15px] font-medium text-[var(--text-primary)] mb-3">Preferred bottoms</p>
          <div className="flex flex-col gap-2">
            {BOTTOMS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleBottomsChange(opt.value)}
                className="flex items-center gap-3 py-2 px-1 rounded-lg transition-colors"
              >
                <span
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: bottoms === opt.value ? 'var(--lavender)' : 'var(--border)',
                  }}
                >
                  {bottoms === opt.value && (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--lavender)' }}
                    />
                  )}
                </span>
                <span className="text-[15px] text-[var(--text-primary)]">{opt.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <p className="text-[12px] text-[var(--text-secondary)] mt-3 px-1">
        Applies to new trips only.
      </p>

      {/* About */}
      <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[var(--blue-faint)] mb-2 mt-8">
        About
      </p>
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-[15px] text-[var(--text-primary)]">Version</span>
          <span className="text-[15px] text-[var(--text-secondary)]">1.0</span>
        </div>
      </Card>
    </div>
  );
}
