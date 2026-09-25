'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { LeadType, Lead } from '@/types/crm';
import {
  Clock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export function TodayView() {
  const {
    leads,
    activities,
    setCurrentView,
    setSelectedLeadId,
    currentUser
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [scope, setScope] = useState<'my' | 'all'>(
    currentUser?.role === 'member' ? 'my' : 'all'
  );
  const [activeTab, setActiveTab] = useState<'agenda' | 'exceptions' | 'activity'>('agenda');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter leads by type and scope
  const scopedLeads = useMemo(() => {
    return leads.filter((l) => {
      if (typeFilter !== 'All' && l.type !== typeFilter) return false;
      if (scope === 'my' && currentUser) {
        return l.assigned_to.toLowerCase() === currentUser.name.toLowerCase();
      }
      return true;
    });
  }, [leads, typeFilter, scope, currentUser]);

  // Activity stats lookup
  const leadActivityStats = useMemo(() => {
    const stats: Record<string, { callCount: number; lastDate: string }> = {};
    for (const act of activities) {
      if (!stats[act.lead_id]) {
        stats[act.lead_id] = { callCount: 0, lastDate: act.created_at };
      }
      if (act.type === 'call') stats[act.lead_id].callCount += 1;
      if (new Date(act.created_at) > new Date(stats[act.lead_id].lastDate)) {
        stats[act.lead_id].lastDate = act.created_at;
      }
    }
    return stats;
  }, [activities]);

  // Overdue leads
  const overdueLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due &&
        l.next_action_due < todayStr
    );
  }, [scopedLeads, todayStr]);

  // Today's leads
  const dueTodayLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due === todayStr
    );
  }, [scopedLeads, todayStr]);

  // Uncontacted new leads
  const uncontactedLeads = useMemo(() => {
    return scopedLeads.filter((l) => {
      if (l.stage !== 'New') return false;
      const stat = leadActivityStats[l.id];
      return !stat || stat.callCount === 0;
    });
  }, [scopedLeads, leadActivityStats]);

  // Missing next action
  const missingActionLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        (!l.next_action || !l.next_action.trim() || !l.next_action_due)
    );
  }, [scopedLeads]);

  // Active deals volume
  const activePipelineValue = useMemo(() => {
    const active = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return scopedLeads
      .filter((l) => active.includes(l.stage))
      .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [scopedLeads]);

  const wonDealsCount = useMemo(() => {
    return scopedLeads.filter((l) => l.stage === 'Won').length;
  }, [scopedLeads]);

  // Combined Agenda: Overdue first, then Today
  const agendaList = useMemo(() => {
    return [...overdueLeads, ...dueTodayLeads];
  }, [overdueLeads, dueTodayLeads]);

  // All exceptions combined
  const exceptionsList = useMemo(() => {
    const map = new Map<string, { lead: Lead; reasons: string[] }>();

    overdueLeads.forEach((l) => {
      map.set(l.id, { lead: l, reasons: [`Overdue (${l.next_action_due})`] });
    });

    uncontactedLeads.forEach((l) => {
      if (map.has(l.id)) {
        map.get(l.id)!.reasons.push('Uncontacted New Lead');
      } else {
        map.set(l.id, { lead: l, reasons: ['Uncontacted New Lead'] });
      }
    });

    missingActionLeads.forEach((l) => {
      if (map.has(l.id)) {
        map.get(l.id)!.reasons.push('No Next Step Scheduled');
      } else {
        map.set(l.id, { lead: l, reasons: ['No Next Step Scheduled'] });
      }
    });

    return Array.from(map.values());
  }, [overdueLeads, uncontactedLeads, missingActionLeads]);

  // Recent team activities with lead details
  const recentActivities = useMemo(() => {
    const leadMap = new Map<string, Lead>();
    leads.forEach((l) => leadMap.set(l.id, l));

    return activities.slice(0, 8).map((act) => ({
      ...act,
      lead: leadMap.get(act.lead_id)
    }));
  }, [activities, leads]);

  const handleOpenLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('leads');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Calm Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#12151C] tracking-tight">
            Today
          </h1>
          <p className="text-[13px] text-[#12151C]/60 mt-0.5">
            {agendaList.length > 0
              ? `${agendaList.length} action${agendaList.length === 1 ? '' : 's'} scheduled for ${scope === 'my' && currentUser ? currentUser.name : 'the team'}.`
              : 'All caught up. No pending follow-ups or overdue actions.'}
          </p>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          {/* Scope Toggle */}
          <div className="inline-flex p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-sm">
            <button
              onClick={() => setScope('my')}
              className={`px-3 py-1 text-[12px] font-medium transition-colors ${
                scope === 'my'
                  ? 'bg-[#12151C] text-white shadow-sm'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1 text-[12px] font-medium transition-colors ${
                scope === 'all'
                  ? 'bg-[#12151C] text-white shadow-sm'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              All Team
            </button>
          </div>

          {/* Line Filter */}
          <div className="inline-flex p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-sm">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 text-[12px] font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white shadow-sm'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Stat Bar (Apple Single-Surface Strip) */}
      <div className="bg-white border border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
        {/* Metric 1: Overdue */}
        <button
          onClick={() => setActiveTab('exceptions')}
          className="p-3.5 text-left hover:bg-[#F4F6F9] transition-colors focus:outline-none group"
        >
          <div className="text-[11px] font-mono uppercase text-[#12151C]/50">
            Overdue
          </div>
          <div className="text-[22px] font-mono font-semibold text-[#12151C] mt-0.5 flex items-baseline gap-2">
            <span>{overdueLeads.length}</span>
            {overdueLeads.length > 0 && (
              <span className="text-[10.5px] font-mono text-[#3B82F6] font-medium">
                Action needed
              </span>
            )}
          </div>
        </button>

        {/* Metric 2: Due Today */}
        <button
          onClick={() => setActiveTab('agenda')}
          className="p-3.5 text-left hover:bg-[#F4F6F9] transition-colors focus:outline-none"
        >
          <div className="text-[11px] font-mono uppercase text-[#12151C]/50">
            Due Today
          </div>
          <div className="text-[22px] font-mono font-semibold text-[#12151C] mt-0.5">
            {dueTodayLeads.length}
          </div>
        </button>

        {/* Metric 3: Active Pipeline */}
        <button
          onClick={() => setCurrentView('pipeline')}
          className="p-3.5 text-left hover:bg-[#F4F6F9] transition-colors focus:outline-none"
        >
          <div className="text-[11px] font-mono uppercase text-[#12151C]/50">
            Active Deals
          </div>
          <div className="text-[22px] font-mono font-semibold text-[#12151C] mt-0.5 truncate">
            {activePipelineValue > 0 ? `₹${activePipelineValue.toLocaleString()}` : '—'}
          </div>
        </button>

        {/* Metric 4: Closed Won */}
        <button
          onClick={() => setCurrentView('clients')}
          className="p-3.5 text-left hover:bg-[#F4F6F9] transition-colors focus:outline-none"
        >
          <div className="text-[11px] font-mono uppercase text-[#12151C]/50">
            Closed Won
          </div>
          <div className="text-[22px] font-mono font-semibold text-[#12151C] mt-0.5">
            {wonDealsCount}
          </div>
        </button>
      </div>

      {/* Minimal Sub-navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E5E7EB] text-[13px] pt-1">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`pb-2.5 font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${
            activeTab === 'agenda'
              ? 'text-[#12151C] border-[#12151C]'
              : 'text-[#12151C]/50 border-transparent hover:text-[#12151C]'
          }`}
        >
          <span>Agenda</span>
          <span className="text-[11px] font-mono text-[#12151C]/50">
            ({agendaList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`pb-2.5 font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${
            activeTab === 'exceptions'
              ? 'text-[#12151C] border-[#12151C]'
              : 'text-[#12151C]/50 border-transparent hover:text-[#12151C]'
          }`}
        >
          <span>Attention Needed</span>
          {exceptionsList.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#12151C] text-white text-[10px] font-mono">
              {exceptionsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-2.5 font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'text-[#12151C] border-[#12151C]'
              : 'text-[#12151C]/50 border-transparent hover:text-[#12151C]'
          }`}
        >
          <span>Recent Activity</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
        </button>
      </div>

      {/* Tab 1: Agenda (What Should Happen Next) */}
      {activeTab === 'agenda' && (
        <div className="space-y-2">
          {agendaList.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E7EB]">
              <CheckCircle2 className="w-7 h-7 text-[#12151C]/30 mx-auto mb-2" />
              <h3 className="text-[14px] font-medium text-[#12151C]">
                All caught up for today
              </h3>
              <p className="text-[12px] text-[#12151C]/60 mt-1 max-w-sm mx-auto">
                No overdue actions or follow-ups scheduled for today.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] bg-white border border-[#E5E7EB]">
              {agendaList.map((lead) => {
                const isOverdue = lead.next_action_due && lead.next_action_due < todayStr;
                return (
                  <div
                    key={lead.id}
                    onClick={() => handleOpenLead(lead.id)}
                    className="p-3.5 hover:bg-[#F4F6F9] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isOverdue ? (
                          <span className="text-[9.5px] font-mono font-bold bg-[#12151C] text-white px-1.5 py-0.5 uppercase">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                            Today
                          </span>
                        )}
                        <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]/70">
                          {lead.type}
                        </span>
                        <h4 className="text-[13.5px] font-semibold text-[#12151C]">
                          {lead.business_name}
                        </h4>
                        <span className="text-[12px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>

                      <div className="text-[12.5px] text-[#12151C] flex items-center gap-1.5 font-medium">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action || 'Follow up with contact'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-mono text-[#12151C]/60">
                        {lead.assigned_to}
                      </span>
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C]"
                        title={`Call ${lead.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button className="px-3 py-1 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] transition-colors">
                        Take Action
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Exceptions (What Needs Attention) */}
      {activeTab === 'exceptions' && (
        <div className="space-y-2">
          {exceptionsList.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E7EB]">
              <CheckCircle2 className="w-7 h-7 text-[#12151C]/30 mx-auto mb-2" />
              <h3 className="text-[14px] font-medium text-[#12151C]">
                Zero exceptions
              </h3>
              <p className="text-[12px] text-[#12151C]/60 mt-1 max-w-sm mx-auto">
                No overdue actions, uncontacted leads, or missing next steps.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] bg-white border border-[#E5E7EB]">
              {exceptionsList.map(({ lead, reasons }) => (
                <div
                  key={lead.id}
                  onClick={() => handleOpenLead(lead.id)}
                  className="p-3.5 hover:bg-[#F4F6F9] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[13.5px] font-semibold text-[#12151C]">
                        {lead.business_name}
                      </h4>
                      <span className="text-[11.5px] text-[#12151C]/60">
                        ({lead.contact_name} • {lead.stage})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {reasons.map((r) => (
                        <span
                          key={r}
                          className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-[11px] font-mono text-[#12151C]/60">
                      {lead.assigned_to}
                    </span>
                    <button className="px-3 py-1 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] transition-colors">
                      Fix Lead
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Activity (What is Happening) */}
      {activeTab === 'activity' && (
        <div className="space-y-2">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E7EB]">
              <p className="text-[12px] text-[#12151C]/60">
                No activity recorded yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] bg-white border border-[#E5E7EB]">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => act.lead && handleOpenLead(act.lead.id)}
                  className="p-3 hover:bg-[#F4F6F9] transition-colors cursor-pointer flex items-baseline justify-between gap-3 text-[12.5px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono uppercase font-semibold text-[#12151C]">
                        {act.type.replace('_', ' ')}
                      </span>
                      {act.lead && (
                        <span className="font-semibold text-[#12151C]">
                          {act.lead.business_name}
                        </span>
                      )}
                    </div>
                    <div className="text-[#12151C]/75 mt-0.5 text-[12px]">
                      {act.text}
                    </div>
                  </div>

                  <span className="text-[10.5px] font-mono text-[#12151C]/50 shrink-0">
                    {formatRelativeTime(act.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
