'use client';

import React, { useState, useEffect } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { CalorieGoalCard } from '@/components/dashboard/CalorieGoalCard';
import { MacroNutrients } from '@/components/dashboard/MacroNutrients';
import { ActivityGraph } from '@/components/dashboard/ActivityGraph';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { WeightCard } from '@/components/dashboard/WeightCard';
import { AddEntryModal } from '@/components/modals/AddEntryModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dashboardApi, weightApi, userApi } from '@/lib/api';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';

function ProteinNudge({ current, total }: { current: number; total: number }) {
  const hour = new Date().getHours();
  const pct = total > 0 ? current / total : 1;
  if (pct >= 0.7 || hour < 14 || total === 0) return null;
  const remaining = Math.round(total - current);
  return (
    <div className="clip-card-sm p-4 flex items-start gap-3 slide-up"
         style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
      <span className="text-xl flex-shrink-0">💪</span>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--cyan)' }}>
          Protein Alert
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          {remaining}g short of target. Add a high-protein meal to protect your muscle.
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dashboard, weights, profile] = await Promise.all([
        dashboardApi.getDashboard(),
        weightApi.getHistory(),
        userApi.getProfile(),
      ]);
      setDashboardData(dashboard);
      setWeightLogs(weights.logs);
      setProfileData(profile.user);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const userAvatar = profileData?.agentAvatar || user?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;

  if (loading) return (
    <MobileContainer>
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </MobileContainer>
  );

  if (error) return (
    <MobileContainer>
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-bold uppercase tracking-wider text-sm" style={{ color: 'var(--primary)' }}>
            Connection Error
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{error}</p>
        </div>
      </div>
    </MobileContainer>
  );

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">

        {/* App Bar */}
        <div className="flex justify-between items-center pt-3">
          <div>
            <h1 className="font-game text-2xl leading-none tracking-wide"
                style={{ color: 'var(--foreground)' }}>
              NUTRI<span style={{ color: 'var(--primary)' }}>TRACK</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] mt-0.5"
               style={{ color: 'var(--muted)' }}>
              {user?.name ? `Agent ${user.name.split(' ')[0]}` : 'Agent'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {theme === 'dark'
                ? <Sun size={14} style={{ color: 'var(--gold)' }} />
                : <Moon size={14} style={{ color: 'var(--cyan)' }} />}
            </button>

            {/* Avatar */}
            <Link href="/profile">
              <div className="w-9 h-9 overflow-hidden glow-red"
                   style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))', border: '2px solid var(--primary)' }}>
                <img src={userAvatar} alt="Agent" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        </div>

        {/* Calorie Goal */}
        {dashboardData && (
          <CalorieGoalCard
            consumed={dashboardData.calorieGoal.consumed}
            goal={dashboardData.calorieGoal.goal}
            burned={dashboardData.calorieGoal.burned}
            deficit={dashboardData.calorieGoal.deficit}
          />
        )}

        {/* Protein nudge */}
        {dashboardData && (
          <ProteinNudge
            current={dashboardData.macros.protein.current}
            total={dashboardData.macros.protein.total}
          />
        )}

        {/* Weight */}
        <WeightCard
          logs={weightLogs}
          targetWeightKg={profileData?.targetWeightKg}
          onLogged={fetchAll}
        />

        {/* Macros */}
        {dashboardData && (
          <MacroNutrients
            protein={dashboardData.macros.protein}
            carbs={dashboardData.macros.carbs}
            fats={dashboardData.macros.fats}
          />
        )}

        {/* Activity graph */}
        {dashboardData && <ActivityGraph data={dashboardData.activityGraph} />}

        {/* Recent activity */}
        {dashboardData && (
          <RecentActivity activities={dashboardData.recentActivity} onRefresh={fetchAll} />
        )}
      </div>

      <BottomNav onAddClick={() => setIsAddModalOpen(true)} />
      <AddEntryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchAll} />
    </MobileContainer>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
