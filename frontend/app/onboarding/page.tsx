'use client';

import React, { useState } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { ArrowRight, Scale, User, Target, Calculator } from 'lucide-react';
import { userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

const STEPS = ['weight', 'stats', 'goal'] as const;
type Step = typeof STEPS[number];

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:   'Sedentary — desk job, little exercise',
  light:       'Light — 1–3 days/week',
  moderate:    'Moderate — 3–5 days/week',
  active:      'Active — 6–7 days/week',
  very_active: 'Very Active — physical job + training',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('weight');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    currentWeightKg: '',
    targetWeightKg:  '',
    age:             '',
    gender:          'male',
    heightCm:        '',
    activityLevel:   'sedentary',
    goalType:        'lose',
  });

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const stepIndex = STEPS.indexOf(step);

  // Live TDEE preview
  const tdeePreview = (() => {
    const age = Number(form.age);
    const h   = Number(form.heightCm);
    const w   = Number(form.currentWeightKg);
    if (!age || !h || !w) return null;
    let bmr = form.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;
    const mult: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = Math.round(bmr * (mult[form.activityLevel] ?? 1.2));
    const goal = form.goalType === 'lose' ? Math.max(1200, tdee - 500) : form.goalType === 'gain' ? tdee + 300 : tdee;
    return { tdee, goal };
  })();

  const handleNext = () => {
    setError(null);
    if (step === 'weight') {
      if (!form.currentWeightKg || !form.targetWeightKg) { setError('Please enter both weights'); return; }
      setStep('stats');
    } else if (step === 'stats') {
      if (!form.age || !form.heightCm) { setError('Please fill in all fields'); return; }
      setStep('goal');
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      await userApi.updateProfile({
        currentWeightKg: Number(form.currentWeightKg),
        targetWeightKg:  Number(form.targetWeightKg),
        age:             Number(form.age),
        gender:          form.gender,
        heightCm:        Number(form.heightCm),
        activityLevel:   form.activityLevel,
        goalType:        form.goalType,
      } as any);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileContainer className="flex flex-col justify-between p-8">
      {/* Progress dots */}
      <div className="flex gap-2 justify-center pt-4">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-primary w-8' : 'bg-white/10 w-4'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* Step: weight */}
        {step === 'weight' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-primary/10 rounded-3xl">
                <Scale size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center">Your Weight</h1>
              <p className="text-gray-400 text-center text-sm">We'll use this to set your calorie goal and track progress.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Current weight (kg)</label>
                <input type="number" step="0.1" value={form.currentWeightKg} onChange={set('currentWeightKg')}
                  placeholder="e.g. 85" autoFocus
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white text-lg focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Target weight (kg)</label>
                <input type="number" step="0.1" value={form.targetWeightKg} onChange={set('targetWeightKg')}
                  placeholder="e.g. 75"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white text-lg focus:outline-none focus:border-primary transition-colors" />
              </div>
              {form.currentWeightKg && form.targetWeightKg && (
                <div className="bg-white/5 rounded-2xl p-3 text-center text-sm text-gray-400">
                  Goal: lose <span className="text-white font-semibold">{(Number(form.currentWeightKg) - Number(form.targetWeightKg)).toFixed(1)} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: stats */}
        {step === 'stats' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-primary/10 rounded-3xl">
                <User size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center">About You</h1>
              <p className="text-gray-400 text-center text-sm">Used to calculate your exact calorie needs.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Age</label>
                  <input type="number" value={form.age} onChange={set('age')} placeholder="25"
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Gender</label>
                  <select value={form.gender} onChange={set('gender')}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Height (cm)</label>
                <input type="number" value={form.heightCm} onChange={set('heightCm')} placeholder="175"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* Step: goal */}
        {step === 'goal' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-primary/10 rounded-3xl">
                <Target size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center">Your Goal</h1>
              <p className="text-gray-400 text-center text-sm">We'll calculate your daily calorie target automatically.</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['lose', 'maintain', 'gain'] as const).map((type) => (
                  <button key={type} onClick={() => setForm((f) => ({ ...f, goalType: type }))}
                    className={`p-3 rounded-2xl border text-sm font-medium capitalize transition-all ${
                      form.goalType === type ? 'bg-primary text-black border-primary' : 'bg-[#1A1A1A] text-gray-400 border-white/5'
                    }`}>
                    {type}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Activity Level</label>
                <select value={form.activityLevel} onChange={set('activityLevel')}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none text-sm">
                  {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {tdeePreview && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                    <Calculator size={15} /> Your personalised goal
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Maintenance (TDEE)</span>
                    <span className="text-white">{tdeePreview.tdee.toLocaleString()} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Daily target</span>
                    <span className="text-primary font-bold text-base">{tdeePreview.goal.toLocaleString()} kcal</span>
                  </div>
                  {form.goalType === 'lose' && form.currentWeightKg && form.targetWeightKg && (
                    <div className="text-xs text-gray-500 pt-1">
                      ~{Math.round(((Number(form.currentWeightKg) - Number(form.targetWeightKg)) * 7700) / (500 * 7))} weeks to reach your goal
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* CTA */}
      <div className="space-y-3 pb-4">
        <button
          onClick={handleNext}
          disabled={saving}
          className="w-full bg-primary text-black font-bold p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <LoadingSpinner size="sm" /> : step === 'goal' ? 'Get Started' : 'Continue'}
          {!saving && <ArrowRight size={20} />}
        </button>
        {step !== 'weight' && (
          <button onClick={() => setStep(STEPS[stepIndex - 1])} className="w-full text-gray-500 text-sm py-2">
            Back
          </button>
        )}
        <button onClick={() => router.replace('/')} className="w-full text-gray-600 text-xs py-1">
          Skip for now
        </button>
      </div>
    </MobileContainer>
  );
}
