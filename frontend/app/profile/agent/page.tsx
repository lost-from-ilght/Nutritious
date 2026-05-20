'use client';

import React, { useState } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { ArrowLeft, Check } from 'lucide-react';
import { VALORANT_AGENTS } from '@/lib/agents';
import { userApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function AgentSelectionContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLockIn = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    try {
      const agent = VALORANT_AGENTS.find(a => a.id === selectedAgent);
      if (agent) {
        await userApi.updateProfile({ agentAvatar: agent.avatar });
        router.push('/profile');
      }
    } catch (err) {
      console.error('Failed to lock in agent', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-8 shrink-0">
          <Link href="/profile" className="w-9 h-9 flex items-center justify-center clip-card-sm transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
            Select Agent
          </span>
          <div className="w-9" />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24">
          <div className="grid grid-cols-3 gap-3">
            {VALORANT_AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="relative clip-card aspect-square overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: selectedAgent === agent.id ? '2px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                {selectedAgent === agent.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check size={32} className="text-white drop-shadow-md" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-1 text-center bg-black/50 backdrop-blur-sm text-[8px] font-black uppercase tracking-wider text-white">
                  {agent.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lock In Button */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background to-transparent pointer-events-none">
          <button
            onClick={handleLockIn}
            disabled={!selectedAgent || saving}
            className="w-full h-12 flex items-center justify-center gap-2 clip-btn font-game text-lg tracking-wider transition-all pointer-events-auto"
            style={{
              background: !selectedAgent ? 'var(--bg-card)' : 'var(--primary)',
              color: !selectedAgent ? 'var(--muted)' : 'var(--foreground)',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? <LoadingSpinner size="sm" /> : 'LOCK IN'}
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}

export default function AgentSelectionPage() {
  return <ProtectedRoute><AgentSelectionContent /></ProtectedRoute>;
}
