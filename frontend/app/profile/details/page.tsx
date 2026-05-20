'use client';

import React, { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { ArrowLeft, Save, User, Target, Calculator } from 'lucide-react';
import Link from 'next/link';
import { userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary:   'Sedentary (desk job, no exercise)',
  light:       'Light (1–3 days/week)',
  moderate:    'Moderate (3–5 days/week)',
  active:      'Active (6–7 days/week)',
  very_active: 'Very Active (physical job + training)',
};

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:             '',
    age:              '',
    gender:           'male',
    heightCm:         '',
    currentWeightKg:  '',
    targetWeightKg:   '',
    activityLevel:    'sedentary',
    goalType:         'lose',
    groqApiKey:       '',
  });

  // Estimated calorie goal preview (client-side Mifflin-St Jeor)
  const tdeePreview = (() => {
    const age = Number(form.age);
    const h   = Number(form.heightCm);
    const w   = Number(form.currentWeightKg);
    if (!age || !h || !w) return null;

    let bmr = form.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161;

    const multipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
    };
    const tdee = Math.round(bmr * (multipliers[form.activityLevel] ?? 1.2));
    const goal = form.goalType === 'lose' ? tdee - 500
               : form.goalType === 'gain' ? tdee + 300
               : tdee;
    return { tdee, goal: Math.max(1200, goal) };
  })();

  useEffect(() => {
    userApi.getProfile().then((res) => {
      const u = res.user;
      setForm({
        name:            u.name            ?? '',
        age:             u.age             ? String(u.age)            : '',
        gender:          u.gender          ?? 'male',
        heightCm:        u.heightCm        ? String(u.heightCm)       : '',
        currentWeightKg: u.currentWeightKg ? String(u.currentWeightKg): '',
        targetWeightKg:  u.targetWeightKg  ? String(u.targetWeightKg) : '',
        activityLevel:   u.activityLevel   ?? 'sedentary',
        goalType:        u.goalType        ?? 'lose',
        groqApiKey:      '', // we don't fetch the actual key, just keep it empty on load
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await userApi.updateProfile({
        name:            form.name || undefined,
        age:             form.age             ? Number(form.age)            : undefined,
        gender:          form.gender          || undefined,
        heightCm:        form.heightCm        ? Number(form.heightCm)       : undefined,
        currentWeightKg: form.currentWeightKg ? Number(form.currentWeightKg): undefined,
        targetWeightKg:  form.targetWeightKg  ? Number(form.targetWeightKg) : undefined,
        activityLevel:   form.activityLevel   || undefined,
        goalType:        form.goalType        || undefined,
        groqApiKey:      form.groqApiKey      || undefined,
      } as any);
      setSaved(true);
      setTimeout(() => { setSaved(false); router.push('/profile'); }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer className="flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="p-6 flex items-center gap-4 sticky top-0 bg-[#121212]/90 backdrop-blur-md z-10 border-b border-white/5">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">Personal Details</h1>
        </div>

        <div className="p-6 space-y-8">

          {/* Account */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Account</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Physical Stats */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Physical Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Age</label>
                <input type="number" value={form.age} onChange={set('age')} placeholder="25"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Gender</label>
                <select value={form.gender} onChange={set('gender')}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Height (cm)</label>
              <input type="number" value={form.heightCm} onChange={set('heightCm')} placeholder="175"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Current weight (kg)</label>
                <input type="number" step="0.1" value={form.currentWeightKg} onChange={set('currentWeightKg')} placeholder="80"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Target weight (kg)</label>
                <input type="number" step="0.1" value={form.targetWeightKg} onChange={set('targetWeightKg')} placeholder="70"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </section>

          {/* Goal */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Goal</h2>

            <div className="grid grid-cols-3 gap-2">
              {(['lose', 'maintain', 'gain'] as const).map((type) => (
                <button key={type} onClick={() => setForm((f) => ({ ...f, goalType: type }))}
                  className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                    form.goalType === type
                      ? 'bg-primary text-black border-primary'
                      : 'bg-[#1A1A1A] text-gray-400 border-white/5 hover:bg-white/5'
                  }`}>
                  {type} Weight
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Activity Level</label>
              <select value={form.activityLevel} onChange={set('activityLevel')}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none text-sm">
                {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </section>

          {/* API Settings */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">API Settings</h2>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Groq API Key (Optional)</label>
              <input
                type="password"
                value={form.groqApiKey}
                onChange={set('groqApiKey')}
                placeholder="gsk_..."
                className="w-full bg-[#1A1A1A] p-4 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <p className="text-[10px] text-gray-500">Provide your own Groq API key to use the AI Entry Logger. It will be stored securely.</p>
            </div>
          </section>

          {/* TDEE Preview */}
          {tdeePreview && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                <Calculator size={16} />
                Calculated from your stats
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Maintenance (TDEE)</span>
                <span className="text-white font-medium">{tdeePreview.tdee.toLocaleString()} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {form.goalType === 'lose' ? 'Goal (−500 kcal deficit)' :
                   form.goalType === 'gain' ? 'Goal (+300 kcal surplus)' : 'Goal'}
                </span>
                <span className="text-primary font-bold">{tdeePreview.goal.toLocaleString()} kcal/day</span>
              </div>
              {form.goalType === 'lose' && form.currentWeightKg && form.targetWeightKg && (
                <div className="text-xs text-gray-500 pt-1">
                  At this deficit, you'd reach your goal in ~
                  {Math.round(
                    ((Number(form.currentWeightKg) - Number(form.targetWeightKg)) * 7700) / (500 * 7)
                  )} weeks
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-black font-game text-xl tracking-wider p-4 clip-btn hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : saved ? (
              '✓ Saved!'
            ) : (
              <>
                <Save size={20} />
                Save & Calculate Goal
              </>
            )}
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
