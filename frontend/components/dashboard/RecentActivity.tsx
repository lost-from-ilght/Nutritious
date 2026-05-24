'use client';

import React, { useState } from 'react';
import { Utensils, Zap, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { foodApi, exerciseApi } from '@/lib/api';

interface ActivityItem {
  id: string; title: string; calories: number;
  type: 'food' | 'exercise'; time: string; details?: string; timestamp: string | Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  onRefresh?: () => void;
}

export function RecentActivity({ activities, onRefresh }: RecentActivityProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const filterActivities = () => {
    const now = new Date();

    return activities.filter(activity => {
      if (activeTab === 'all') return true;
      
      const activityDate = new Date(activity.timestamp);
      
      const isSameDay = activityDate.getDate() === now.getDate() &&
                        activityDate.getMonth() === now.getMonth() &&
                        activityDate.getFullYear() === now.getFullYear();

      if (activeTab === 'today') {
        return isSameDay;
      }
      
      // Calculate days difference for rolling windows
      const timeDiff = now.getTime() - activityDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (activeTab === 'week') {
        return daysDiff <= 7;
      }
      if (activeTab === 'month') {
        return daysDiff <= 30;
      }
      
      return true;
    });
  };

  const filteredActivities = filterActivities();

  const handleDelete = async (item: ActivityItem) => {
    if (!confirm('Delete this entry?')) return;
    setDeletingId(item.id);
    try {
      if (item.type === 'food') await foodApi.deleteFood(item.id);
      else await exerciseApi.deleteExercise(item.id);
      onRefresh?.();
    } catch { alert('Failed to delete.'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-3 pb-24">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
            Activity Feed
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{filteredActivities.length} entries</span>
        </div>
        
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors",
                activeTab === tab 
                  ? "bg-[var(--primary)] text-white" 
                  : "bg-[var(--bg-card)] text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <div className="text-4xl">🎮</div>
          <p className="font-bold uppercase tracking-wider text-sm" style={{ color: 'var(--muted)' }}>
            No entries for {activeTab}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Hit the + button to log your first mission
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((item) => {
            const isExpanded = expandedId === item.id;
            const isFood = item.type === 'food';

            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={cn(
                  'relative cursor-pointer transition-all duration-200 overflow-hidden',
                  isExpanded ? 'clip-card' : 'clip-card-sm'
                )}
                style={{
                  background: isExpanded ? 'var(--bg-card-2)' : 'var(--bg-card)',
                  border: `1px solid ${isExpanded ? (isFood ? 'rgba(0,212,255,0.3)' : 'rgba(57,255,20,0.3)') : 'var(--border)'}`,
                }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                     style={{ background: isFood ? 'var(--cyan)' : 'var(--success)' }} />

                <div className="pl-4 pr-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                           style={{ background: isFood ? 'rgba(0,212,255,0.1)' : 'rgba(57,255,20,0.1)' }}>
                        {isFood
                          ? <Utensils size={16} style={{ color: 'var(--cyan)' }} />
                          : <Zap size={16} style={{ color: 'var(--success)' }} />}
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-tight" style={{ color: 'var(--foreground)' }}>
                          {item.title}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                          {activeTab !== 'today' && (
                            <span className="mr-1 opacity-70">
                              {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {item.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-game font-bold text-sm',
                        isFood ? 'text-[var(--foreground)]' : 'text-[var(--success)]'
                      )}>
                        {isFood ? '' : '-'}{Math.abs(item.calories)}
                        <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--muted)' }}>kcal</span>
                      </span>
                      {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} />
                                  : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
                    </div>
                  </div>

                  {/* Expanded */}
                  <div className={cn(
                    'grid transition-all duration-300',
                    isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                  )}>
                    <div className="overflow-hidden">
                      {item.details && (
                        <p className="text-xs mb-3 pt-3" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                          {item.details}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                          disabled={deletingId === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors clip-btn disabled:opacity-50"
                          style={{ background: 'rgba(255,70,85,0.1)', color: 'var(--primary)' }}
                        >
                          <Trash2 size={13} />
                          {deletingId === item.id ? 'Removing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
