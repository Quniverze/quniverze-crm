'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { LeadType, Lead, PIPELINE_STAGES } from '@/types/crm';
import {
  Clock,
  Briefcase,
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  UserX,
  Hourglass,
  Activity as ActivityIcon,
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
    currentUser,
    usersList
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [scope, setScope] = useState<'my' | 'all'>(
    currentUser?.role === 'member' ? 'my' : 'all'
  );
  const [attentionFilter, setAttentionFilter] = useState<
    'all' | 'overdue' | 'uncontacted' | 'missing_action' | 'neglected'
  >('all');

  // Today's date YYYY-MM-DD
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

  // Lead Activity Lookup Map
  const leadActivityStats = useMemo(() => {
    const stats: Record<string, { lastActivityDate: string; callCount: number }> = {};
    for (const act of activities) {
      if (!stats[act.lead_id]) {
        stats[act.lead_id] = { lastActivityDate: act.created_at, callCount: 0 };
      }
      if (act.type === 'call') {
        stats[act.lead_id].callCount += 1;
      }
      if (new Date(act.created_at) > new Date(stats[act.lead_id].lastActivityDate)) {
        stats[act.lead_id].lastActivityDate = act.created_at;
      }
    }
    return stats;
  }, [activities]);

  // 1. WHAT NEEDS ATTENTION? (Exception Calculations)
  // Overdue follow-ups
  const overdueLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due &&
        l.next_action_due < todayStr
    );
  }, [scopedLeads, todayStr]);

  // Uncontacted new leads (stage = 'New' with 0 calls logged)
  const uncontactedNewLeads = useMemo(() => {
    return scopedLeads.filter((l) => {
      if (l.stage !== 'New') return false;
      const stat = leadActivityStats[l.id];
      return !stat || stat.callCount === 0;
    });
  }, [scopedLeads, leadActivityStats]);

  // Leads with NO next action scheduled
  const missingActionLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        (!l.next_action || !l.next_action.trim() || !l.next_action_due)
    );
  }, [scopedLeads]);

  // Neglected leads: active stages (Qualified, Discovery, Proposal, Negotiation) untouched in 4+ days
  const neglectedLeads = useMemo(() => {
    const activeStages = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

    return scopedLeads.filter((l) => {
      if (!activeStages.includes(l.stage)) return false;
      const stat = leadActivityStats[l.id];
      const lastActive = stat ? stat.lastActivityDate : l.updated_at || l.created_at;
      return lastActive < fourDaysAgo;
    });
  }, [scopedLeads, leadActivityStats]);

  // 2. WHAT SHOULD HAPPEN NEXT? (Today's Scheduled Actions)
  const dueTodayLeads = useMemo(() => {
    return scopedLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due === todayStr
    );
  }, [scopedLeads, todayStr]);

  // 3. PIPELINE VELOCITY DISTRIBUTION
  const stageStats = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageLeads = scopedLeads.filter((l) => l.stage === stage);
      const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
      return {
        stage,
        count: stageLeads.length,
        value: stageValue
      };
    });
  }, [scopedLeads]);

  const activePipelineValue = useMemo(() => {
    const active = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return scopedLeads
      .filter((l) => active.includes(l.stage))
      .reduce((acc, l) => acc + (l.value || 0), 0);
  }, [scopedLeads]);

  // 4. RECENT REAL-TIME ACTIVITY STREAM
  const recentActivities = useMemo(() => {
    // Lead name lookup
    const leadMap = new Map<string, Lead>();
    leads.forEach((l) => leadMap.set(l.id, l));

    return activities.slice(0, 10).map((act) => ({
      ...act,
      lead: leadMap.get(act.lead_id)
    }));
  }, [activities, leads]);

  const handleOpenLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('leads');
  };

  const totalExceptions =
    overdueLeads.length +
    uncontactedNewLeads.length +
    missingActionLeads.length +
    neglectedLeads.length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Top Header & Context Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#3B82F6]">
              01 Action Center
            </span>
            <span className="text-[#E5E7EB]">/</span>
            <h1 className="text-[20px] font-bold text-[#12151C] tracking-tight">
              Command Post
            </h1>
          </div>
          <p className="text-[13px] text-[#12151C]/60 mt-0.5">
            {scope === 'my' && currentUser
              ? `Operational visibility & immediate execution for ${currentUser.name}.`
              : 'Holistic pipeline posture, operational exceptions, and team momentum.'}
          </p>
        </div>

        {/* Filters Group: Scope + Line of Business */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Scope Toggle */}
          <div className="inline-flex p-1 bg-[#F4F6F9] border border-[#E5E7EB]">
            <button
              onClick={() => setScope('my')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                scope === 'my'
                  ? 'bg-[#12151C] text-white shadow-sm'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                scope === 'all'
                  ? 'bg-[#12151C] text-white shadow-sm'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              All Team
            </button>
          </div>

          {/* Line of Business Pill */}
          <div className="inline-flex p-1 bg-[#F4F6F9] border border-[#E5E7EB]">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white shadow-sm'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product (NivaOps)' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          QUESTION 1: WHAT NEEDS ATTENTION? (Exception Grid)
          ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#12151C]" />
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#12151C] font-bold">
              What Needs Attention?
            </h2>
            <span
              className={`px-2 py-0.5 text-[10.5px] font-mono font-bold ${
                totalExceptions > 0
                  ? 'bg-[#12151C] text-white'
                  : 'bg-[#F4F6F9] text-[#12151C]/60 border border-[#E5E7EB]'
              }`}
            >
              {totalExceptions} {totalExceptions === 1 ? 'exception' : 'exceptions'}
            </span>
          </div>

          {totalExceptions > 0 && attentionFilter !== 'all' && (
            <button
              onClick={() => setAttentionFilter('all')}
              className="text-[11px] font-mono text-[#3B82F6] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Overdue Follow-ups */}
          <div
            onClick={() =>
              setAttentionFilter(attentionFilter === 'overdue' ? 'all' : 'overdue')
            }
            className={`p-4 bg-white border cursor-pointer transition-all ${
              attentionFilter === 'overdue'
                ? 'border-[#12151C] bg-[#F4F6F9] ring-2 ring-[#12151C]'
                : overdueLeads.length > 0
                ? 'border-[#12151C] hover:border-[#3B82F6]'
                : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[#12151C]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Overdue Actions
              </span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-[26px] font-mono font-bold text-[#12151C]">
              {overdueLeads.length}
            </div>
            <div className="text-[11px] text-[#12151C]/60 mt-1">
              Missed scheduled dates
            </div>
          </div>

          {/* 2. Uncontacted New Leads */}
          <div
            onClick={() =>
              setAttentionFilter(
                attentionFilter === 'uncontacted' ? 'all' : 'uncontacted'
              )
            }
            className={`p-4 bg-white border cursor-pointer transition-all ${
              attentionFilter === 'uncontacted'
                ? 'border-[#12151C] bg-[#F4F6F9] ring-2 ring-[#12151C]'
                : uncontactedNewLeads.length > 0
                ? 'border-[#12151C] hover:border-[#3B82F6]'
                : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[#12151C]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Uncontacted
              </span>
              <UserX className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-[26px] font-mono font-bold text-[#12151C]">
              {uncontactedNewLeads.length}
            </div>
            <div className="text-[11px] text-[#12151C]/60 mt-1">
              New leads with 0 calls
            </div>
          </div>

          {/* 3. Missing Next Action */}
          <div
            onClick={() =>
              setAttentionFilter(
                attentionFilter === 'missing_action' ? 'all' : 'missing_action'
              )
            }
            className={`p-4 bg-white border cursor-pointer transition-all ${
              attentionFilter === 'missing_action'
                ? 'border-[#12151C] bg-[#F4F6F9] ring-2 ring-[#12151C]'
                : missingActionLeads.length > 0
                ? 'border-[#12151C] hover:border-[#3B82F6]'
                : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[#12151C]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                No Next Step
              </span>
              <FileQuestion className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-[26px] font-mono font-bold text-[#12151C]">
              {missingActionLeads.length}
            </div>
            <div className="text-[11px] text-[#12151C]/60 mt-1">
              Leads lacking action/date
            </div>
          </div>

          {/* 4. Neglected Active Deals */}
          <div
            onClick={() =>
              setAttentionFilter(
                attentionFilter === 'neglected' ? 'all' : 'neglected'
              )
            }
            className={`p-4 bg-white border cursor-pointer transition-all ${
              attentionFilter === 'neglected'
                ? 'border-[#12151C] bg-[#F4F6F9] ring-2 ring-[#12151C]'
                : neglectedLeads.length > 0
                ? 'border-[#12151C] hover:border-[#3B82F6]'
                : 'border-[#E5E7EB] opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between text-[#12151C]/60">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                Neglected Deals
              </span>
              <Hourglass className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2 text-[26px] font-mono font-bold text-[#12151C]">
              {neglectedLeads.length}
            </div>
            <div className="text-[11px] text-[#12151C]/60 mt-1">
              No activity in &gt; 4 days
            </div>
          </div>
        </div>

        {/* Filtered Exception List (if any filter is selected or if there are exceptions) */}
        {attentionFilter !== 'all' && (
          <div className="p-4 bg-white border border-[#12151C] space-y-2 mt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] text-[12px]">
              <span className="font-semibold text-[#12151C]">
                Filtered Exceptions:{' '}
                {attentionFilter === 'overdue' && 'Overdue Actions'}
                {attentionFilter === 'uncontacted' && 'Uncontacted New Leads'}
                {attentionFilter === 'missing_action' && 'Leads Missing Next Step'}
                {attentionFilter === 'neglected' && 'Neglected Active Deals'}
              </span>
              <button
                onClick={() => setAttentionFilter('all')}
                className="text-[11px] font-mono text-[#12151C]/60 hover:text-[#12151C]"
              >
                Close
              </button>
            </div>

            {(() => {
              const list =
                attentionFilter === 'overdue'
                  ? overdueLeads
                  : attentionFilter === 'uncontacted'
                  ? uncontactedNewLeads
                  : attentionFilter === 'missing_action'
                  ? missingActionLeads
                  : neglectedLeads;

              if (list.length === 0) {
                return (
                  <div className="py-4 text-center text-[12px] text-[#12151C]/60">
                    No leads in this exception category.
                  </div>
                );
              }

              return (
                <div className="divide-y divide-[#E5E7EB]">
                  {list.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => handleOpenLead(lead.id)}
                      className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F4F6F9] px-2 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5">
                            {lead.type}
                          </span>
                          <span className="text-[13px] font-bold text-[#12151C]">
                            {lead.business_name}
                          </span>
                          <span className="text-[11px] text-[#12151C]/60">
                            ({lead.contact_name})
                          </span>
                        </div>
                        <div className="text-[12px] text-[#12151C] mt-0.5 flex items-center gap-1.5">
                          <span className="text-[#3B82F6]">→</span>
                          <span>{lead.next_action || 'Action missing — Click to assign'}</span>
                          {lead.next_action_due && (
                            <span className="text-[10px] font-mono text-[#12151C]/60">
                              (Due: {lead.next_action_due})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-[#12151C]/60">
                          {lead.assigned_to}
                        </span>
                        <span className="px-2 py-1 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6]">
                          Take Action
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* ========================================================
          QUESTION 2: WHAT IS HAPPENING WITH MY LEADS?
          (Pipeline Velocity & Live Employee Activity Stream)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-[#12151C]" />
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#12151C] font-bold">
              What Is Happening?
            </h2>
          </div>
          <div className="text-[12px] font-mono text-[#12151C]/70">
            Active Deal Volume:{' '}
            <span className="font-bold text-[#12151C]">
              ₹{activePipelineValue.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pipeline Velocity Breakdown */}
          <div className="lg:col-span-2 p-4 bg-white border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 font-semibold">
                Pipeline Distribution (7 Stages)
              </span>
              <button
                onClick={() => setCurrentView('pipeline')}
                className="text-[11px] text-[#3B82F6] font-mono hover:underline flex items-center gap-1"
              >
                <span>View Full Pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Horizontal Distribution Stage Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {stageStats.map((st, idx) => (
                <div
                  key={st.stage}
                  onClick={() => setCurrentView('pipeline')}
                  className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/50">
                    <span>0{idx + 1}</span>
                    <span className="font-bold text-[#12151C]">{st.count}</span>
                  </div>
                  <div className="text-[11.5px] font-bold text-[#12151C] uppercase mt-1 truncate">
                    {st.stage}
                  </div>
                  <div className="text-[10px] font-mono text-[#12151C]/60 mt-0.5 truncate">
                    {st.value > 0 ? `₹${st.value.toLocaleString()}` : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Stage conversion summary line */}
            <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11.5px] text-[#12151C]/70">
              <span>
                Total tracked leads:{' '}
                <strong className="text-[#12151C] font-mono">{scopedLeads.length}</strong>
              </span>
              <span>
                Won deals:{' '}
                <strong className="text-[#12151C] font-mono">
                  {scopedLeads.filter((l) => l.stage === 'Won').length}
                </strong>
              </span>
            </div>
          </div>

          {/* Real-time Team Activity Stream */}
          <div className="p-4 bg-white border border-[#E5E7EB] space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 font-semibold">
                Live Activity Stream
              </span>
              <span className="text-[10px] font-mono text-[#3B82F6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                Live
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-56 pr-1">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-[#12151C]/50">
                  No activity recorded yet. Calls, notes, and stage changes will appear here.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => act.lead && handleOpenLead(act.lead.id)}
                    className="p-2 bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] text-[11.5px] cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/60">
                      <span className="font-semibold text-[#12151C] uppercase">
                        {act.type.replace('_', ' ')}
                      </span>
                      <span>{formatRelativeTime(act.created_at)}</span>
                    </div>
                    {act.lead && (
                      <div className="font-bold text-[#12151C] text-[12px] truncate">
                        {act.lead.business_name}
                      </div>
                    )}
                    <div className="text-[#12151C]/80 line-clamp-2">
                      {act.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          QUESTION 3: WHAT SHOULD HAPPEN NEXT? (Action Agenda)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#12151C]" />
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#12151C] font-bold">
              What Should Happen Next?
            </h2>
            <span className="text-[11px] font-mono text-[#12151C]/60">
              ({dueTodayLeads.length + overdueLeads.length} touchpoints)
            </span>
          </div>

          <button
            onClick={() => setCurrentView('followups')}
            className="text-[12px] font-medium text-[#3B82F6] hover:underline flex items-center gap-1"
          >
            <span>Open Execution Cockpit</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {dueTodayLeads.length === 0 && overdueLeads.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E5E7EB]">
            <CheckCircle2 className="w-8 h-8 text-[#12151C]/30 mx-auto mb-2" />
            <h3 className="text-[14px] font-medium text-[#12151C]">
              All caught up for today
            </h3>
            <p className="text-[12px] text-[#12151C]/60 mt-1 max-w-sm mx-auto">
              There are no pending actions or overdue follow-ups due right now.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Overdue items first */}
            {overdueLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleOpenLead(lead.id)}
                className="p-3.5 bg-white border-2 border-[#12151C] hover:border-[#3B82F6] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold bg-[#12151C] text-white px-1.5 py-0.5 uppercase">
                      Overdue ({lead.next_action_due})
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                      {lead.type}
                    </span>
                    <span className="text-[10px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                      {lead.stage}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#12151C]">
                      {lead.business_name}
                    </span>
                    <span className="text-[12px] text-[#12151C]/70">
                      ({lead.contact_name})
                    </span>
                  </div>

                  <div className="text-[13px] text-[#12151C] mt-1 font-medium flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{lead.next_action || 'Follow up with contact'}</span>
                  </div>

                  {lead.angle && (
                    <div className="text-[11px] text-[#12151C]/60 mt-0.5 truncate">
                      Angle: {lead.angle}
                    </div>
                  )}
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
                  <button className="px-3 py-1.5 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            ))}

            {/* Today's items */}
            {dueTodayLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleOpenLead(lead.id)}
                className="p-3.5 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                      Today
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                      {lead.type}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#12151C]">
                      {lead.business_name}
                    </span>
                    <span className="text-[12px] text-[#12151C]/70">
                      ({lead.contact_name} • {lead.phone})
                    </span>
                  </div>

                  <div className="text-[12.5px] text-[#12151C] mt-1 flex items-center gap-1.5 font-medium">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{lead.next_action || 'Follow up'}</span>
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
                  <button className="px-3 py-1.5 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
