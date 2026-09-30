'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { LeadType, Lead, CallOutcome, CALL_OUTCOMES } from '@/types/crm';
import {
  Clock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  Zap,
  Activity as ActivityIcon,
  MessageSquare,
  X,
  Plus,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  Flame
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
    logCall,
    currentUser
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [scope, setScope] = useState<'my' | 'all'>(
    currentUser?.role === 'member' ? 'my' : 'all'
  );
  const [activeTab, setActiveTab] = useState<'agenda' | 'exceptions'>('agenda');
  const [priorityIndex, setPriorityIndex] = useState(0);

  // Fast Call Logger Modal state inside TodayView
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('Interested');
  const [callNotes, setCallNotes] = useState('');
  const [nextActionText, setNextActionText] = useState('Follow up call');
  const [nextActionDate, setNextActionDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

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

  // Overdue leads (highest priority)
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

  // Calculate calls logged today for daily momentum tracking
  const callsLoggedToday = useMemo(() => {
    return activities.filter((act) => {
      if (act.type !== 'call') return false;
      if (!act.created_at.startsWith(todayStr)) return false;
      if (scope === 'my' && currentUser) {
        const lead = leads.find((l) => l.id === act.lead_id);
        return lead?.assigned_to.toLowerCase() === currentUser.name.toLowerCase();
      }
      return true;
    }).length;
  }, [activities, todayStr, scope, currentUser, leads]);

  // Daily target calculation
  const totalTargetToday = agendaList.length + callsLoggedToday;
  const velocityPercent =
    totalTargetToday > 0
      ? Math.min(100, Math.round((callsLoggedToday / totalTargetToday) * 100))
      : 100;

  // Current Priority Lead
  const priorityLead = useMemo(() => {
    if (agendaList.length === 0) return null;
    const safeIndex = priorityIndex % agendaList.length;
    return agendaList[safeIndex];
  }, [agendaList, priorityIndex]);

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

  const handleStartCall = (lead: Lead) => {
    setCallingLead(lead);
    setCallOutcome('Interested');
    setCallNotes('');
    setNextActionText(lead.next_action || 'Follow up with contact');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNextActionDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleSaveCall = (advanceToNext: boolean) => {
    if (!callingLead) return;
    const currentLeadId = callingLead.id;

    logCall(
      currentLeadId,
      callOutcome,
      callNotes.trim(),
      nextActionText.trim(),
      nextActionDate
    );

    if (advanceToNext) {
      const remainingAgenda = agendaList.filter((l) => l.id !== currentLeadId);
      if (remainingAgenda.length > 0) {
        handleStartCall(remainingAgenda[0]);
        return;
      }
    }

    setCallingLead(null);
  };

  const handleQuickPresetDays = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    setNextActionDate(target.toISOString().split('T')[0]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-4">
      {/* 1. Header Tile with Controls */}
      <div className="rounded-lg bg-white border border-[#E5E7EB] p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-[#12151C] tracking-tight">
              Today
            </h1>
            <span className="text-[#E5E7EB]">/</span>
            <span className="text-[12px] font-mono text-[#12151C]/50">
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
          <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-md items-center">
            <button
              onClick={() => setScope('my')}
              className={`h-7 px-3 text-[12px] font-medium rounded flex items-center justify-center transition-colors ${
                scope === 'my'
                  ? 'bg-[#12151C] text-white shadow-xs'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setScope('all')}
              className={`h-7 px-3 text-[12px] font-medium rounded flex items-center justify-center transition-colors ${
                scope === 'all'
                  ? 'bg-[#12151C] text-white shadow-xs'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              All Team
            </button>
          </div>

          {/* Line Segmented Control */}
          <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-md items-center">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`h-7 px-2.5 text-[12px] font-medium rounded flex items-center justify-center transition-colors ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white shadow-xs'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product' : t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="h-8 px-3.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shrink-0 rounded-md shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. Daily Sales Momentum / Velocity Tracker */}
      <div className="rounded-lg bg-white border border-[#E5E7EB] p-4 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#12151C] text-white flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#12151C]">
                  Daily Execution Momentum
                </span>
                {callsLoggedToday > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] font-semibold">
                    <Flame className="w-3 h-3 text-[#3B82F6]" />
                    {callsLoggedToday} {callsLoggedToday === 1 ? 'Touchpoint' : 'Touchpoints'} Done
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[#12151C]/60">
                {agendaList.length === 0
                  ? callsLoggedToday > 0
                    ? 'Target accomplished for today. All scheduled queue items cleared!'
                    : 'Queue is clear. Add new prospects or advance existing pipeline opportunities.'
                  : `${agendaList.length} action${agendaList.length === 1 ? '' : 's'} remaining in today’s queue.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-[13px] font-mono font-bold text-[#12151C]">
              {velocityPercent}% Velocity
            </span>
            <button
              onClick={() => setCurrentView('followups')}
              className="h-8 px-3 rounded-md border border-[#E5E7EB] hover:border-[#12151C] text-[12px] font-medium text-[#12151C] hover:bg-[#F4F6F9] transition-colors flex items-center gap-1.5"
            >
              <span>Execution Queue</span>
              <ArrowRight className="w-3 h-3 text-[#3B82F6]" />
            </button>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2 rounded-full bg-[#F4F6F9] border border-[#E5E7EB] overflow-hidden">
          <div
            className="h-full bg-[#3B82F6] transition-all duration-500 rounded-full"
            style={{ width: `${velocityPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Top 4 Metric Tiles (Bento Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Tile 1: Overdue */}
        <div
          onClick={() => setActiveTab('exceptions')}
          className="rounded-lg bg-white border border-[#E5E7EB] p-4 hover:border-[#12151C]/40 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span>Overdue</span>
            <Clock className="w-3.5 h-3.5 text-[#12151C]/40" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold tracking-tight text-[#12151C]">
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
          className="rounded-lg bg-white border border-[#E5E7EB] p-4 hover:border-[#12151C]/40 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span>Due Today</span>
            <Sparkles className="w-3.5 h-3.5 text-[#12151C]/40" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold tracking-tight text-[#12151C]">
            {dueTodayLeads.length}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            Scheduled touchpoints
          </div>
        </div>

        {/* Tile 3: Active Deals */}
        <div
          onClick={() => setCurrentView('pipeline')}
          className="rounded-lg bg-white border border-[#E5E7EB] p-4 hover:border-[#12151C]/40 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span>Active Deals</span>
            <Briefcase className="w-3.5 h-3.5 text-[#12151C]/40" />
          </div>
          <div className="mt-2 text-[24px] font-mono font-semibold tracking-tight text-[#12151C] truncate">
            {activePipelineValue > 0 ? `₹${activePipelineValue.toLocaleString()}` : '0'}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            {activeDealsCount} in active stages
          </div>
        </div>

        {/* Tile 4: Closed Won */}
        <div
          onClick={() => setCurrentView('clients')}
          className="rounded-lg bg-white border border-[#E5E7EB] p-4 hover:border-[#12151C]/40 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
            <span>Closed Won</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
          </div>
          <div className="mt-2 text-[26px] font-mono font-semibold tracking-tight text-[#12151C]">
            {wonDealsCount}
          </div>
          <div className="text-[11.5px] text-[#12151C]/60 mt-1">
            Customer accounts
          </div>
        </div>
      </div>

      {/* 4. Core Workspace Bento Tiles (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Priority Mission + Action List */}
        <div className="lg:col-span-2 space-y-4">
          {/* A. PRIORITY FOCUS HERO TILE (When leads need action) */}
          {priorityLead ? (
            <div className="rounded-lg bg-white border border-[#E5E7EB] p-4.5 space-y-3 shadow-2xs relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#12151C] text-white font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                    Priority Focus
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C]">
                    {priorityLead.type}
                  </span>
                  {priorityLead.next_action_due && priorityLead.next_action_due < todayStr && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#12151C] text-white font-bold">
                      Overdue ({priorityLead.next_action_due})
                    </span>
                  )}
                </div>

                {agendaList.length > 1 && (
                  <button
                    onClick={() => setPriorityIndex((prev) => (prev + 1) % agendaList.length)}
                    className="text-[11px] font-mono text-[#3B82F6] hover:underline flex items-center gap-1"
                  >
                    <span>Next ({((priorityIndex % agendaList.length) + 1)} of {agendaList.length})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Lead Info & Pitch Angle */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div
                    onClick={() => handleOpenLead(priorityLead.id)}
                    className="cursor-pointer group"
                  >
                    <h3 className="text-[16px] font-bold text-[#12151C] group-hover:text-[#3B82F6] transition-colors">
                      {priorityLead.business_name}
                    </h3>
                    <p className="text-[12px] text-[#12151C]/65">
                      {priorityLead.contact_name} {priorityLead.city && `• ${priorityLead.city}`} • Assigned to <span className="font-semibold text-[#12151C]">{priorityLead.assigned_to}</span>
                    </p>
                  </div>

                  {priorityLead.value && (
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-[#12151C]/50 block">Est. Deal Value</span>
                      <span className="text-[15px] font-mono font-bold text-[#12151C]">
                        ₹{priorityLead.value.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pitch Angle Box */}
                {priorityLead.angle && (
                  <div className="p-3 rounded-md bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] text-[#12151C] space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#12151C]/50 block font-semibold">
                      Strategic Pitch Angle
                    </span>
                    <p className="italic font-medium text-[#12151C]/90">
                      &ldquo;{priorityLead.angle}&rdquo;
                    </p>
                  </div>
                )}

                {/* Next Action Scheduled */}
                <div className="text-[12.5px] text-[#12151C] flex items-center gap-2 py-1">
                  <span className="text-[11px] font-mono uppercase text-[#12151C]/50">Next Step:</span>
                  <span className="font-semibold text-[#3B82F6]">→</span>
                  <span className="font-medium text-[#12151C]">{priorityLead.next_action || 'Follow up with contact'}</span>
                </div>
              </div>

              {/* Action Buttons: Exact 32px (h-8) Uniform Controls */}
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {/* Start Call & Log */}
                  <button
                    onClick={() => handleStartCall(priorityLead)}
                    className="h-8 px-4 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call &amp; Log Outcome</span>
                  </button>

                  {/* Direct Tel */}
                  <a
                    href={`tel:${priorityLead.phone}`}
                    className="h-8 w-8 rounded-md border border-[#E5E7EB] hover:border-[#12151C] flex items-center justify-center text-[#12151C] transition-colors bg-[#F4F6F9]"
                    title={`Call ${priorityLead.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {/* WhatsApp Link */}
                  {priorityLead.phone && (
                    <a
                      href={`https://wa.me/${priorityLead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-md border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C] text-[12px] font-medium flex items-center gap-1.5 transition-colors bg-[#F4F6F9]"
                      title="Open WhatsApp chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleOpenLead(priorityLead.id)}
                  className="text-[12px] text-[#3B82F6] hover:underline font-medium"
                >
                  View Lead Details →
                </button>
              </div>
            </div>
          ) : null}

          {/* B. AGENDA / EXCEPTIONS TILE */}
          <div className="rounded-lg bg-white border border-[#E5E7EB] p-4.5 flex flex-col space-y-3.5 shadow-2xs">
            {/* Tile Header with Uniform Subtabs */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-md items-center">
                <button
                  onClick={() => setActiveTab('agenda')}
                  className={`h-7 px-3 text-[12px] font-medium rounded flex items-center gap-1.5 transition-colors ${
                    activeTab === 'agenda'
                      ? 'bg-[#12151C] text-white shadow-xs'
                      : 'text-[#12151C]/70 hover:text-[#12151C]'
                  }`}
                >
                  <span>Agenda Queue</span>
                  <span className="font-mono text-[10.5px] opacity-75">
                    ({agendaList.length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('exceptions')}
                  className={`h-7 px-3 text-[12px] font-medium rounded flex items-center gap-1.5 transition-colors ${
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

              <span className="text-[11.5px] font-mono text-[#12151C]/50">
                {activeTab === 'agenda' ? `${agendaList.length} items` : `${exceptionsList.length} items`}
              </span>
            </div>

            {/* List Content */}
            <div className="flex-1">
              {activeTab === 'agenda' ? (
                agendaList.length === 0 ? (
                  /* TRIUMPH STATE */
                  <div className="py-12 px-4 text-center rounded-lg bg-[#F4F6F9] border border-dashed border-[#E5E7EB] space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#12151C] text-white flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#12151C]">
                        🎯 Daily Touchpoints Cleared
                      </h4>
                      <p className="text-[12px] text-[#12151C]/60 mt-0.5 max-w-md mx-auto">
                        Zero overdue items or pending follow-ups for today. Excellent execution discipline.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setQuickAddOpen(true)}
                        className="h-8 px-3.5 bg-[#12151C] text-white text-[12px] font-medium rounded-md hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Lead</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('pipeline')}
                        className="h-8 px-3.5 bg-white border border-[#E5E7EB] hover:border-[#12151C] text-[12px] font-medium text-[#12151C] rounded-md transition-colors flex items-center gap-1.5"
                      >
                        <span>Pipeline Flow</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agendaList.map((lead) => {
                      const isOverdue = lead.next_action_due && lead.next_action_due < todayStr;
                      return (
                        <div
                          key={lead.id}
                          className="rounded-md border border-[#E5E7EB] p-3 hover:bg-[#F4F6F9] hover:border-[#12151C]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div
                            onClick={() => handleOpenLead(lead.id)}
                            className="min-w-0 space-y-1 cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              {isOverdue ? (
                                <span className="text-[9.5px] font-mono font-bold bg-[#12151C] text-white px-1.5 py-0.5 rounded uppercase">
                                  Overdue
                                </span>
                              ) : (
                                <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                                  Today
                                </span>
                              )}
                              <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]/70">
                                {lead.type}
                              </span>
                              <h4 className="text-[13.5px] font-semibold text-[#12151C] hover:text-[#3B82F6] transition-colors">
                                {lead.business_name}
                              </h4>
                              <span className="text-[12px] text-[#12151C]/60">
                                ({lead.contact_name})
                              </span>
                            </div>

                            <div className="text-[12px] text-[#12151C] flex items-center gap-1.5 font-medium">
                              <span className="text-[#3B82F6]">→</span>
                              <span className="truncate">{lead.next_action || 'Follow up call'}</span>
                            </div>
                          </div>

                          {/* Uniform Action Buttons: Exact 32px (h-8) height */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <span className="text-[11px] font-mono text-[#12151C]/60">
                              {lead.assigned_to}
                            </span>
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 rounded-md border border-[#E5E7EB] hover:border-[#12151C] flex items-center justify-center text-[#12151C] transition-colors bg-white"
                              title={`Call ${lead.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleStartCall(lead)}
                              className="h-8 px-3.5 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <span>Take Action</span>
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
                  <div className="py-12 text-center">
                    <CheckCircle2 className="w-8 h-8 text-[#12151C]/20 mx-auto mb-2" />
                    <h4 className="text-[13.5px] font-semibold text-[#12151C]">
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
                        className="rounded-md border border-[#E5E7EB] p-3 hover:bg-[#F4F6F9] hover:border-[#12151C]/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                                className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C]"
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
                          <button className="h-8 px-3.5 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors shadow-xs">
                            Fix Lead
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Live Activity & Operational Log */}
        <div className="rounded-lg bg-white border border-[#E5E7EB] p-4.5 flex flex-col space-y-4 shadow-2xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-3.5 h-3.5 text-[#12151C]" />
              <h3 className="text-[12px] font-mono uppercase tracking-wider font-semibold text-[#12151C]">
                Team Activity
              </h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-mono text-[#3B82F6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[500px] pr-0.5">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-[#12151C]/50">
                No activity logged yet.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => act.lead && handleOpenLead(act.lead.id)}
                  className="rounded-md border border-[#E5E7EB] p-2.5 hover:bg-[#F4F6F9] transition-colors cursor-pointer text-[12px] space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/50">
                    <span className="uppercase font-semibold text-[#12151C]">
                      {act.type.replace('_', ' ')}
                    </span>
                    <span>{formatRelativeTime(act.created_at)}</span>
                  </div>
                  {act.lead && (
                    <div className="font-semibold text-[#12151C] truncate text-[12.5px]">
                      {act.lead.business_name}
                    </div>
                  )}
                  <div className="text-[#12151C]/75 line-clamp-2 text-[11.5px]">
                    {act.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Fast Call Logger Modal (Integrated within TodayView for frictionless execution) */}
      {callingLead && (
        <div className="fixed inset-0 z-50 bg-[#12151C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#E5E7EB] shadow-2xl p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5 rounded">
                  {callingLead.type}
                </span>
                <h3 className="text-[16px] font-bold text-[#12151C] mt-1">
                  {callingLead.business_name}
                </h3>
                <p className="text-[12px] text-[#12151C]/60">
                  {callingLead.contact_name} • {callingLead.phone}
                </p>
              </div>
              <button
                onClick={() => setCallingLead(null)}
                className="w-7 h-7 rounded-md border border-[#E5E7EB] hover:bg-[#F4F6F9] flex items-center justify-center text-[#12151C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex gap-2">
              <a
                href={`tel:${callingLead.phone}`}
                className="flex-1 h-8 bg-[#12151C] text-white text-[12px] font-medium rounded-md hover:bg-[#3B82F6] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {callingLead.phone}</span>
              </a>
              {callingLead.phone && (
                <a
                  href={`https://wa.me/${callingLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3.5 rounded-md border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C] text-[12px] font-medium flex items-center gap-1.5 transition-colors bg-[#F4F6F9]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            {/* Outcome Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60 block">
                Call Outcome
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CALL_OUTCOMES.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setCallOutcome(o)}
                    className={`h-7 px-2 text-[11px] font-medium rounded border transition-colors ${
                      callOutcome === o
                        ? 'bg-[#12151C] text-white border-[#12151C]'
                        : 'bg-[#F4F6F9] text-[#12151C]/80 border-[#E5E7EB] hover:border-[#12151C]/50'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Action Description & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60 block">
                  Next Action
                </label>
                <input
                  type="text"
                  value={nextActionText}
                  onChange={(e) => setNextActionText(e.target.value)}
                  placeholder="Next action description..."
                  className="w-full h-8.5 px-3 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60 block">
                  Due Date
                </label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="flex-1 h-8.5 px-2 text-[12px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDays(1)}
                    className="h-8.5 px-2 text-[11px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded hover:border-[#12151C]"
                  >
                    +1d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDays(3)}
                    className="h-8.5 px-2 text-[11px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded hover:border-[#12151C]"
                  >
                    +3d
                  </button>
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60 block">
                Call Notes &amp; Observations
              </label>
              <input
                type="text"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Call notes & observations..."
                className="w-full h-8.5 px-3 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCallingLead(null)}
                className="h-8 px-3 text-[12px] text-[#12151C]/60 hover:text-[#12151C] rounded-md"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCall(false)}
                  className="h-8 px-4 rounded-md border border-[#E5E7EB] hover:border-[#12151C] text-[12px] font-medium text-[#12151C]"
                >
                  Log &amp; Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(true)}
                  className="h-8 px-4 rounded-md bg-[#12151C] hover:bg-[#3B82F6] text-white text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Log &amp; Next Lead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
