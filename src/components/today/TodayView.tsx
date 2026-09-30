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
  Briefcase,
  Sparkles,
  Activity as ActivityIcon,
  Plus
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
    setQuickAddOpen,
    currentUser
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [scope, setScope] = useState<'my' | 'all'>(
    currentUser?.role === 'member' ? 'my' : 'all'
  );
  const [activeTab, setActiveTab] = useState<'agenda' | 'exceptions'>('agenda');

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

  // Lead activity lookup
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

  // Active pipeline value
  const activePipelineValue = useMemo(() => {
    const active = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return scopedLeads
      .filter((l) => active.includes(l.stage))
      .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [scopedLeads]);

  const activeDealsCount = useMemo(() => {
    const active = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return scopedLeads.filter((l) => active.includes(l.stage)).length;
  }, [scopedLeads]);

  const wonDealsCount = useMemo(() => {
    return scopedLeads.filter((l) => l.stage === 'Won').length;
  }, [scopedLeads]);

  // Combined Agenda: Overdue first, then Today
  const agendaList = useMemo(() => {
    return [...overdueLeads, ...dueTodayLeads];
  }, [overdueLeads, dueTodayLeads]);

  // Exceptions list
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
        map.get(l.id)!.reasons.push('No Scheduled Step');
      } else {
        map.set(l.id, { lead: l, reasons: ['No Scheduled Step'] });
      }
    });

    return Array.from(map.values());
  }, [overdueLeads, uncontactedLeads, missingActionLeads]);

  // Recent team activities
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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-4">
      {/* 1. Header Tile */}
      <div className="rounded-xl bg-white border border-[#E5E7EB] p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(18,21,28,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[19px] font-semibold text-[#12151C] tracking-tight">
              Today
            </h1>
            <span className="text-[#E5E7EB] font-light">/</span>
            <span className="text-[12px] font-mono text-[#12151C]/50 tracking-tight">
              {new Date().toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <p className="text-[12.5px] text-[#12151C]/60 mt-0.5">
            {agendaList.length > 0
              ? `${agendaList.length} action${agendaList.length === 1 ? '' : 's'} scheduled for ${
                  scope === 'my' && currentUser ? currentUser.name : 'the team'
                }.`
              : 'All caught up. Zero overdue or pending follow-ups for today.'}
          </p>
        </div>

        {/* Uniform Controls (Exact Height: 32px / h-8) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Segmented Control */}
          <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg items-center">
            <button
              onClick={() => setScope('my')}
              className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center justify-center transition-all ${
                scope === 'my'
                  ? 'bg-[#12151C] text-white shadow-xs'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setScope('all')}
              className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center justify-center transition-all ${
                scope === 'all'
                  ? 'bg-[#12151C] text-white shadow-xs'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              All Team
            </button>
          </div>

          {/* Line Segmented Control */}
          <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg items-center">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`h-7 px-2.5 text-[12px] font-medium rounded-md flex items-center justify-center transition-all ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white shadow-xs'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product' : t}
              </button>
            ))}
          </div>

          {/* New Lead Button */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="h-8 px-3.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shrink-0 rounded-lg shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Tiles (Bento Grid) with Refined Depth */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Tile 1: Overdue */}
        <div
          onClick={() => setActiveTab('exceptions')}
          className="rounded-xl bg-white border border-[#E5E7EB] p-4.5 hover:border-[#12151C]/40 hover:shadow-[0_4px_12px_rgba(18,21,28,0.04)] transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_rgba(18,21,28,0.02)] group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span className="group-hover:text-[#12151C] transition-colors">Overdue</span>
            <Clock className="w-3.5 h-3.5 text-[#12151C]/40 group-hover:text-[#12151C] transition-colors" />
          </div>
          <div className="mt-2.5 text-[28px] font-mono font-semibold tracking-tight text-[#12151C]">
            {overdueLeads.length}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1 flex items-center justify-between">
            <span>Requires action</span>
            {overdueLeads.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#12151C]" />
            )}
          </div>
        </div>

        {/* Tile 2: Due Today */}
        <div
          onClick={() => setActiveTab('agenda')}
          className="rounded-xl bg-white border border-[#E5E7EB] p-4.5 hover:border-[#12151C]/40 hover:shadow-[0_4px_12px_rgba(18,21,28,0.04)] transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_rgba(18,21,28,0.02)] group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span className="group-hover:text-[#12151C] transition-colors">Due Today</span>
            <Sparkles className="w-3.5 h-3.5 text-[#12151C]/40 group-hover:text-[#3B82F6] transition-colors" />
          </div>
          <div className="mt-2.5 text-[28px] font-mono font-semibold tracking-tight text-[#12151C]">
            {dueTodayLeads.length}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            Scheduled touchpoints
          </div>
        </div>

        {/* Tile 3: Active Deals */}
        <div
          onClick={() => setCurrentView('pipeline')}
          className="rounded-xl bg-white border border-[#E5E7EB] p-4.5 hover:border-[#12151C]/40 hover:shadow-[0_4px_12px_rgba(18,21,28,0.04)] transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_rgba(18,21,28,0.02)] group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span className="group-hover:text-[#12151C] transition-colors">Active Deals</span>
            <Briefcase className="w-3.5 h-3.5 text-[#12151C]/40 group-hover:text-[#12151C] transition-colors" />
          </div>
          <div className="mt-2.5 text-[26px] font-mono font-semibold tracking-tight text-[#12151C] truncate">
            {activePipelineValue > 0 ? `₹${activePipelineValue.toLocaleString()}` : '0'}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            {activeDealsCount} in active stages
          </div>
        </div>

        {/* Tile 4: Closed Won */}
        <div
          onClick={() => setCurrentView('clients')}
          className="rounded-xl bg-white border border-[#E5E7EB] p-4.5 hover:border-[#12151C]/40 hover:shadow-[0_4px_12px_rgba(18,21,28,0.04)] transition-all cursor-pointer flex flex-col justify-between shadow-[0_1px_3px_rgba(18,21,28,0.02)] group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span className="group-hover:text-[#12151C] transition-colors">Closed Won</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
          </div>
          <div className="mt-2.5 text-[28px] font-mono font-semibold tracking-tight text-[#12151C]">
            {wonDealsCount}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            Customer accounts
          </div>
        </div>
      </div>

      {/* 3. Core Workspace Bento Tiles (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Tile (2 cols): Action List */}
        <div className="lg:col-span-2 rounded-xl bg-white border border-[#E5E7EB] p-4.5 md:p-5 flex flex-col space-y-4 shadow-[0_1px_3px_rgba(18,21,28,0.03)]">
          {/* Tile Header with Uniform Subtabs */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
            <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg items-center">
              <button
                onClick={() => setActiveTab('agenda')}
                className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'agenda'
                    ? 'bg-[#12151C] text-white shadow-xs'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                <span>Agenda</span>
                <span className="font-mono text-[10.5px] opacity-75">
                  ({agendaList.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('exceptions')}
                className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center gap-1.5 transition-all ${
                  activeTab === 'exceptions'
                    ? 'bg-[#12151C] text-white shadow-xs'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                <span>Attention Needed</span>
                {exceptionsList.length > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                )}
              </button>
            </div>

            <button
              onClick={() => setCurrentView('followups')}
              className="text-[12px] text-[#3B82F6] hover:underline flex items-center gap-1 font-medium transition-colors"
            >
              <span>Execution Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action List Content */}
          <div className="flex-1">
            {activeTab === 'agenda' ? (
              agendaList.length === 0 ? (
                <div className="py-14 text-center rounded-lg bg-[#F4F6F9]/50 border border-dashed border-[#E5E7EB]">
                  <CheckCircle2 className="w-8 h-8 text-[#12151C]/25 mx-auto mb-2.5" />
                  <h4 className="text-[14px] font-semibold text-[#12151C]">
                    All caught up for today
                  </h4>
                  <p className="text-[12px] text-[#12151C]/50 mt-0.5">
                    No overdue actions or follow-ups scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agendaList.map((lead) => {
                    const isOverdue = lead.next_action_due && lead.next_action_due < todayStr;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleOpenLead(lead.id)}
                        className="rounded-lg border border-[#E5E7EB] p-3.5 hover:bg-[#F4F6F9]/70 hover:border-[#12151C]/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[0_1px_2px_rgba(18,21,28,0.02)]"
                      >
                        <div className="min-w-0 space-y-1.5 flex-1">
                          {/* Top Tag Row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {isOverdue ? (
                              <span className="text-[9.5px] font-mono font-bold bg-[#12151C] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Overdue
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C] font-semibold">
                                Today
                              </span>
                            )}
                            <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]/70">
                              {lead.type}
                            </span>
                            <h4 className="text-[14px] font-semibold text-[#12151C] group-hover:text-[#3B82F6] transition-colors">
                              {lead.business_name}
                            </h4>
                            <span className="text-[12px] text-[#12151C]/55">
                              ({lead.contact_name})
                            </span>
                          </div>

                          {/* Next Action Pill */}
                          <div className="inline-flex items-center gap-1.5 text-[12px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] px-2.5 py-1 rounded-md max-w-full">
                            <span className="text-[#3B82F6] font-bold">→</span>
                            <span className="truncate font-medium">{lead.next_action || 'Follow up call'}</span>
                            {lead.next_action_due && (
                              <span className="text-[10px] font-mono text-[#12151C]/50 shrink-0 ml-1">
                                ({lead.next_action_due})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Uniform Action Buttons: Exact 32px (h-8) height */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-[11px] font-mono text-[#12151C]/50">
                            {lead.assigned_to}
                          </span>
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 rounded-lg border border-[#E5E7EB] hover:border-[#12151C] hover:bg-white flex items-center justify-center text-[#12151C] transition-colors"
                            title={`Call ${lead.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLead(lead.id);
                            }}
                            className="h-8 px-3.5 rounded-lg bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Attention Needed Tab */
              exceptionsList.length === 0 ? (
                <div className="py-14 text-center rounded-lg bg-[#F4F6F9]/50 border border-dashed border-[#E5E7EB]">
                  <CheckCircle2 className="w-8 h-8 text-[#12151C]/25 mx-auto mb-2.5" />
                  <h4 className="text-[14px] font-semibold text-[#12151C]">
                    Zero exceptions
                  </h4>
                  <p className="text-[12px] text-[#12151C]/50 mt-0.5">
                    All leads have active scheduled next steps and are up to date.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exceptionsList.map(({ lead, reasons }) => (
                    <div
                      key={lead.id}
                      onClick={() => handleOpenLead(lead.id)}
                      className="rounded-lg border border-[#E5E7EB] p-3.5 hover:bg-[#F4F6F9]/70 hover:border-[#12151C]/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-[0_1px_2px_rgba(18,21,28,0.02)]"
                    >
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-[14px] font-semibold text-[#12151C] group-hover:text-[#3B82F6] transition-colors">
                            {lead.business_name}
                          </h4>
                          <span className="text-[12px] text-[#12151C]/55">
                            ({lead.contact_name} • {lead.stage})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {reasons.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C] font-semibold"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-[11px] font-mono text-[#12151C]/50">
                          {lead.assigned_to}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLead(lead.id);
                          }}
                          className="h-8 px-3.5 rounded-lg bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-all shadow-xs active:scale-[0.98]"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Tile (1 col): Live Activity & Posture */}
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-4.5 md:p-5 flex flex-col space-y-4 shadow-[0_1px_3px_rgba(18,21,28,0.03)] h-fit">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-3.5 h-3.5 text-[#12151C]" />
              <h3 className="text-[12px] font-mono uppercase tracking-wider font-semibold text-[#12151C]">
                Team Activity
              </h3>
            </div>
            <span className="flex items-center gap-1 text-[10.5px] font-mono text-[#3B82F6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[460px] pr-0.5">
            {recentActivities.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-[#12151C]/40">
                No activity logged yet.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => act.lead && handleOpenLead(act.lead.id)}
                  className="rounded-lg border border-[#E5E7EB] p-3 hover:bg-[#F4F6F9] hover:border-[#12151C]/30 transition-all cursor-pointer text-[12px] space-y-1 group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/50">
                    <span className="uppercase font-semibold text-[#12151C]">
                      {act.type.replace('_', ' ')}
                    </span>
                    <span>{formatRelativeTime(act.created_at)}</span>
                  </div>
                  {act.lead && (
                    <div className="font-semibold text-[#12151C] group-hover:text-[#3B82F6] transition-colors truncate text-[13px]">
                      {act.lead.business_name}
                    </div>
                  )}
                  <div className="text-[#12151C]/75 line-clamp-2 text-[11.5px] leading-relaxed">
                    {act.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
