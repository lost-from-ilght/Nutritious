'use client';

import React, { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { progressApi, weightApi } from '@/lib/api';
import {
  TrendingDown, TrendingUp, Flame, Dumbbell,
  Scale, ChevronDown, ChevronUp, Trash2, BarChart2,
} from 'lucide-react';
import { AddEntryModal } from '@/components/modals/AddEntryModal';

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-4 flex flex-col gap-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${positive === undefined ? 'text-white' : positive ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function DailyBar({ day }: { day: { date: string; calories: number; goal: number; inDeficit: boolean } }) {
  const pct = Math.min(100, day.goal > 0 ? (day.calories / day.goal) * 100 : 0);
  const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full h-24 bg-white/5 rounded-lg relative overflow-hidden flex items-end">
        <div
          className={`w-full rounded-lg transition-all duration-700 ${day.inDeficit ? 'bg-green-500' : day.calories === 0 ? 'bg-white/5' : 'bg-red-400'}`}
          style={{ height: `${Math.max(4, pct)}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}

function WeightHistoryList({ logs, onDelete }: {
  logs: Array<{ date: string; weightKg: number; note?: string }>;
  onDelete: (date: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? logs : logs.slice(-7);

  return (
    <div className="bg-[#1A1A1A] rounded-3xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-white">Weight History</h3>
        </div>
        {logs.length > 7 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-500 flex items-center gap-1">
            {expanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> All {logs.length}</>}
          </button>
        )}
      </div>

      {shown.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No weight logs yet. Log your weight from the dashboard.</p>
      )}

      <div className="space-y-2">
        {[...shown].reverse().map((log) => (
          <div key={log.date} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div>
              <div className="text-white font-semibold">{log.weightKg.toFixed(1)} kg</div>
              <div className="text-xs text-gray-500">
                {new Date(log.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => onDelete(log.date)}
              className="p-2 text-gray-600 hover:text-red-400 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type Tab = 'week' | 'month';

function ProgressContent() {
  const [tab, setTab] = useState<Tab>('week');
  const [weekly, setWeekly] = useState<any>(null);
  const [monthly, setMonthly] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [w, m, wt] = await Promise.all([
        progressApi.getWeekly(),
        progressApi.getMonthly(),
        weightApi.getHistory(),
      ]);
      setWeekly(w);
      setMonthly(m);
      setWeightLogs(wt.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeight = async (date: string) => {
    await weightApi.deleteLog(date);
    fetchAll();
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
      </MobileContainer>
    );
  }

  const tw = weekly?.thisWeek;
  const pw = weekly?.prevWeek;

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="p-6 pt-8 flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <BarChart2 size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Progress</h1>
        </div>

        {/* Tab switcher */}
        <div className="px-6 mb-6">
          <div className="flex bg-[#1A1A1A] rounded-2xl p-1">
            {(['week', 'month'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-primary text-black' : 'text-gray-400'
                }`}
              >
                {t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 space-y-5">
          {tab === 'week' && tw && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Days in deficit"
                  value={`${tw.daysInDeficit} / ${tw.daysWithData || 7}`}
                  sub="days tracked"
                  positive={tw.daysInDeficit >= 5}
                />
                <StatCard
                  label="Avg daily calories"
                  value={tw.avgCalories.toLocaleString()}
                  sub={`goal: ${weekly.calorieGoal.toLocaleString()}`}
                  positive={tw.avgCalories > 0 && tw.avgCalories <= weekly.calorieGoal}
                />
                <StatCard
                  label="Weight change"
                  value={tw.weightChange !== null ? `${tw.weightChange > 0 ? '+' : ''}${tw.weightChange.toFixed(1)} kg` : '—'}
                  positive={tw.weightChange !== null ? tw.weightChange <= 0 : undefined}
                />
                <StatCard
                  label="Avg protein"
                  value={`${tw.avgProtein}g`}
                  sub="per day"
                />
              </div>

              {/* vs last week */}
              {pw && pw.daysWithData > 0 && (
                <div className="bg-[#1A1A1A] rounded-2xl p-4 space-y-2">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">vs Last Week</div>
                  {[
                    { label: 'Avg calories', curr: tw.avgCalories, prev: pw.avgCalories, lowerBetter: true },
                    { label: 'Days in deficit', curr: tw.daysInDeficit, prev: pw.daysInDeficit, lowerBetter: false },
                    { label: 'Avg protein', curr: tw.avgProtein, prev: pw.avgProtein, lowerBetter: false },
                  ].map(({ label, curr, prev, lowerBetter }) => {
                    const diff = curr - prev;
                    const good = lowerBetter ? diff <= 0 : diff >= 0;
                    return (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-medium">{curr}</span>
                          {diff !== 0 && (
                            <span className={`flex items-center text-xs ${good ? 'text-green-400' : 'text-red-400'}`}>
                              {diff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(diff)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Daily bar chart */}
              {weekly.dailyBreakdown?.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Daily Calories</h3>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />In goal</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />Over</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-end h-28">
                    {weekly.dailyBreakdown.map((d: any) => (
                      <DailyBar key={d.date} day={d} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'month' && monthly && (
            <>
              {/* 4-week bars */}
              <div className="bg-[#1A1A1A] rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Weekly Averages</h3>
                {monthly.weeks.map((w: any) => {
                  const pct = monthly.calorieGoal > 0 ? Math.min(100, (w.avgCalories / monthly.calorieGoal) * 100) : 0;
                  const good = w.avgCalories > 0 && w.avgCalories <= monthly.calorieGoal;
                  return (
                    <div key={w.label} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{w.label}</span>
                        <span className={good ? 'text-green-400' : w.avgCalories === 0 ? 'text-gray-600' : 'text-red-400'}>
                          {w.avgCalories > 0 ? `${w.avgCalories.toLocaleString()} kcal avg` : 'No data'}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${good ? 'bg-green-500' : w.avgCalories === 0 ? 'bg-white/5' : 'bg-red-400'}`}
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">{w.daysInDeficit}/7 days in deficit · {w.avgProtein}g protein avg</div>
                    </div>
                  );
                })}
              </div>

              {/* Weight trend for month */}
              {monthly.weightLogs?.length >= 2 && (
                <div className="bg-[#1A1A1A] rounded-3xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Weight Trend (30 days)</h3>
                  <MonthlyWeightChart logs={monthly.weightLogs} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{monthly.weightLogs[0].weightKg.toFixed(1)} kg</span>
                    <span className={
                      monthly.weightLogs[monthly.weightLogs.length - 1].weightKg < monthly.weightLogs[0].weightKg
                        ? 'text-green-400' : 'text-red-400'
                    }>
                      {monthly.weightLogs[monthly.weightLogs.length - 1].weightKg.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Weight history (always shown) */}
          <WeightHistoryList logs={weightLogs} onDelete={handleDeleteWeight} />
        </div>
      </div>

      <BottomNav onAddClick={() => setIsAddOpen(true)} />
      <AddEntryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchAll} />
    </MobileContainer>
  );
}

function MonthlyWeightChart({ logs }: { logs: Array<{ date: string; weightKg: number }> }) {
  const weights = logs.map((l) => l.weightKg);
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const range = max - min || 1;
  const W = 300; const H = 60; const pad = 6;

  const points = weights.map((w, i) => {
    const x = pad + (i / (weights.length - 1)) * (W - pad * 2);
    const y = H - pad - ((w - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
      <polyline points={points.join(' ')} fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const [x, y] = points[points.length - 1].split(',').map(Number);
        return <circle cx={x} cy={y} r={4} fill="#a3e635" />;
      })()}
    </svg>
  );
}

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}
