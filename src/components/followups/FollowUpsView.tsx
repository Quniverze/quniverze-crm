'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, LeadType, CallOutcome, CALL_OUTCOMES } from '@/types/crm';
import {
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function FollowUpsView() {
  const {
    leads,
    logCall,
    setSelectedLeadId,
    setCurrentView,
    currentUser
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [scope, setScope] = useState<'my' | 'all'>(
    currentUser?.role === 'member' ? 'my' : 'all'
  );

  // Active call modal lead
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [outcome, setOutcome] = useState<CallOutcome>('Interested');
  const [callNotes, setCallNotes] = useState('');
  const [nextActionText, setNextActionText] = useState('Follow up call');
  const [nextActionDate, setNextActionDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter leads that are not Won/Lost, and match scope
  const activeLeads = useMemo(() => {
    return leads.filter((l) => {
      if (l.stage === 'Won' || l.stage === 'Lost') return false;
      if (typeFilter !== 'All' && l.type !== typeFilter) return false;
      if (scope === 'my' && currentUser) {
        if (l.assigned_to.toLowerCase() !== currentUser.name.toLowerCase()) return false;
      }
      return true;
    });
  }, [leads, typeFilter, scope, currentUser]);

  // 1. Overdue: next_action_due < today
  const overdueLeads = useMemo(() => {
    return activeLeads.filter((l) => l.next_action_due && l.next_action_due < todayStr);
  }, [activeLeads, todayStr]);

  // 2. Due Today: next_action_due === today
  const dueTodayLeads = useMemo(() => {
    return activeLeads.filter((l) => l.next_action_due === todayStr);
  }, [activeLeads, todayStr]);

  // 3. Missing Action: no next action or due date
  const missingActionLeads = useMemo(() => {
    return activeLeads.filter(
      (l) => !l.next_action || !l.next_action.trim() || !l.next_action_due
    );
  }, [activeLeads]);

  // 4. Upcoming: next_action_due > today
  const upcomingLeads = useMemo(() => {
    return activeLeads.filter((l) => l.next_action_due && l.next_action_due > todayStr);
  }, [activeLeads, todayStr]);

  // Ordered queue for sequential dialing
  const fullDialQueue = useMemo(() => {
    return [...overdueLeads, ...dueTodayLeads, ...missingActionLeads, ...upcomingLeads];
  }, [overdueLeads, dueTodayLeads, missingActionLeads, upcomingLeads]);

  // Open call logger
  const handleStartCall = (lead: Lead) => {
    setCallingLead(lead);
    setOutcome('Interested');
    setCallNotes('');
    setNextActionText(lead.next_action || 'Follow up with contact');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNextActionDate(tomorrow.toISOString().split('T')[0]);
  };

  // Save call & optionally advance to next lead
  const handleSaveCall = (advanceToNext: boolean) => {
    if (!callingLead) return;

    const currentLeadId = callingLead.id;
    logCall(
      currentLeadId,
      outcome,
      callNotes.trim(),
      nextActionText.trim(),
      nextActionDate
    );

    if (advanceToNext) {
      const currentIndex = fullDialQueue.findIndex((l) => l.id === currentLeadId);
      if (currentIndex >= 0 && currentIndex < fullDialQueue.length - 1) {
        handleStartCall(fullDialQueue[currentIndex + 1]);
        return;
      }
    }

    setCallingLead(null);
  };

  const handleQuickPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNextActionDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-4">
      {/* 1. Header Tile */}
      <div className="rounded-lg bg-white border border-[#E5E7EB] p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#12151C] tracking-tight">
            Follow-ups Queue
          </h1>
          <p className="text-[12.5px] text-[#12151C]/60 mt-0.5">
            Sequential calling queue for overdue touchpoints, daily agendas, and unassigned steps.
          </p>
        </div>

        {/* Uniform Controls (Height: 32px / h-8) */}
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
        </div>
      </div>

      {/* 2. Main Queues */}
      {fullDialQueue.length === 0 ? (
        <div className="rounded-lg bg-white border border-[#E5E7EB] p-12 text-center">
          <CheckCircle2 className="w-9 h-9 text-[#12151C]/20 mx-auto mb-2" />
          <h3 className="text-[14px] font-semibold text-[#12151C]">Queue is clear</h3>
          <p className="text-[12px] text-[#12151C]/60 mt-0.5 max-w-sm mx-auto">
            No active follow-ups due. Leads with scheduled next actions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overdue Section */}
          {overdueLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 bg-[#12151C] text-white text-[10.5px] font-mono font-bold uppercase rounded">
                  Overdue
                </span>
                <span className="text-[11.5px] font-mono text-[#12151C]/60">
                  ({overdueLeads.length} touchpoints)
                </span>
              </div>

              <div className="space-y-2">
                {overdueLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg bg-white border border-[#12151C]/70 p-3.5 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#12151C] transition-all shadow-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                          {lead.type}
                        </span>
                        <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                          {lead.stage}
                        </span>
                        <h3
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="text-[14.5px] font-semibold text-[#12151C] hover:text-[#3B82F6] cursor-pointer transition-colors"
                        >
                          {lead.business_name}
                        </h3>
                        <span className="text-[12px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#12151C] font-medium flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#12151C]/50 font-mono">
                        <span className="text-[#12151C] font-semibold">Due: {lead.next_action_due}</span>
                        <span>•</span>
                        <span>Owner: {lead.assigned_to}</span>
                        {lead.city && <span>• {lead.city}</span>}
                      </div>
                    </div>

                    {/* Uniform Action Buttons: Height 32px / h-8 */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 w-8 rounded-md border border-[#E5E7EB] hover:border-[#12151C] flex items-center justify-center text-[#12151C] transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="h-8 px-3.5 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Log Call</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Today Section */}
          {dueTodayLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] text-[10.5px] font-mono font-semibold uppercase rounded">
                  Due Today
                </span>
                <span className="text-[11.5px] font-mono text-[#12151C]/60">
                  ({dueTodayLeads.length} touchpoints)
                </span>
              </div>

              <div className="space-y-2">
                {dueTodayLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg bg-white border border-[#E5E7EB] p-3.5 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#12151C]/40 transition-all"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                          {lead.type}
                        </span>
                        <h3
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="text-[14px] font-semibold text-[#12151C] hover:text-[#3B82F6] cursor-pointer transition-colors"
                        >
                          {lead.business_name}
                        </h3>
                        <span className="text-[12px] text-[#12151C]/60">
                          ({lead.contact_name} • {lead.phone})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#12151C] font-medium flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="text-[11px] text-[#12151C]/50 font-mono">
                        Assigned to: {lead.assigned_to}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 w-8 rounded-md border border-[#E5E7EB] hover:border-[#12151C] flex items-center justify-center text-[#12151C] transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="h-8 px-3.5 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Log Call</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Next Action Section */}
          {missingActionLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#12151C] text-[#12151C] text-[10.5px] font-mono font-semibold uppercase rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#3B82F6]" />
                  <span>Missing Next Step</span>
                </span>
                <span className="text-[11.5px] font-mono text-[#12151C]/60">
                  ({missingActionLeads.length})
                </span>
              </div>

              <div className="space-y-2">
                {missingActionLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg bg-white border border-[#E5E7EB] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px] hover:border-[#12151C]/40 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] px-1.5 py-0.5 border border-[#E5E7EB] rounded text-[#12151C]">
                          {lead.type}
                        </span>
                        <span
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="font-semibold text-[#12151C] hover:text-[#3B82F6] cursor-pointer transition-colors"
                        >
                          {lead.business_name}
                        </span>
                        <span className="text-[11.5px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[11.5px] text-[#12151C]/50 mt-1 italic">
                        No scheduled follow-up. Assign a step to keep this prospect active.
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="h-8 px-3.5 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] self-end md:self-center shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Assign Step</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingLeads.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] text-[10.5px] font-mono font-medium uppercase rounded">
                  Upcoming
                </span>
                <span className="text-[11.5px] font-mono text-[#12151C]/60">
                  ({upcomingLeads.length})
                </span>
              </div>

              <div className="space-y-2">
                {upcomingLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg bg-white border border-[#E5E7EB] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px] hover:border-[#12151C]/30 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] px-1.5 py-0.5 border border-[#E5E7EB] rounded text-[#12151C]">
                          {lead.type}
                        </span>
                        <span
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="font-semibold text-[#12151C] hover:text-[#3B82F6] cursor-pointer transition-colors"
                        >
                          {lead.business_name}
                        </span>
                        <span className="text-[11.5px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[12px] text-[#12151C]/80 flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                        {lead.next_action_due && (
                          <span className="font-mono text-[10.5px] text-[#12151C]/50">
                            (Due {lead.next_action_due})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="h-8 px-3 rounded-md border border-[#E5E7EB] text-[#12151C] text-[12px] font-medium hover:border-[#12151C] self-end md:self-center shrink-0 transition-colors"
                    >
                      Call / Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONE-CLICK CALL & OUTCOME MODAL - Strict Uniform Dimensions */}
      {callingLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 p-4"
          onClick={() => setCallingLead(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-[52px] px-5 border-b border-[#E5E7EB] bg-[#F4F6F9] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5 rounded">
                    {callingLead.type}
                  </span>
                  <span className="text-[11px] font-mono text-[#12151C]/60">
                    Assigned: {callingLead.assigned_to}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCallingLead(null)}
                className="h-8 w-8 rounded-md flex items-center justify-center text-[#12151C]/50 hover:text-[#12151C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#12151C]">
                  {callingLead.business_name}
                </h3>
                <div className="text-[12px] text-[#12151C]/60 mt-0.5">
                  {callingLead.contact_name} {callingLead.city && `• ${callingLead.city}`}
                </div>
              </div>

              {/* Dial Buttons - Uniform 34px */}
              <div className="flex items-center gap-2.5">
                <a
                  href={`tel:${callingLead.phone}`}
                  className="flex-1 h-9 rounded-md bg-[#12151C] text-white text-[12.5px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {callingLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${callingLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 h-9 rounded-md bg-white border border-[#E5E7EB] text-[#12151C] text-[12.5px] font-medium hover:border-[#12151C] flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {callingLead.angle && (
                <div className="p-2.5 rounded-md bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] text-[#12151C]/80 italic">
                  <span className="font-mono uppercase font-bold text-[#12151C]/60 not-italic mr-1.5">Angle:</span>
                  {callingLead.angle}
                </div>
              )}

              {/* 8 Standardized Outcomes - Uniform Tile Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                  Select Call Outcome *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CALL_OUTCOMES.map((out) => {
                    const isSelected = outcome === out;
                    return (
                      <button
                        key={out}
                        type="button"
                        onClick={() => {
                          setOutcome(out);
                          if (out === 'Meeting Requested') {
                            setNextActionText('Conduct Discovery Meeting');
                          } else if (out === 'Call Later') {
                            setNextActionText('Call back prospect');
                          } else if (out === 'WhatsApp Sent') {
                            setNextActionText('Check for WhatsApp reply');
                          } else if (out === 'Interested') {
                            setNextActionText('Send proposal or schedule demo');
                          }
                        }}
                        className={`h-8 rounded-md text-[11.5px] font-medium text-center border transition-colors flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#12151C] text-white border-[#12151C] shadow-xs'
                            : 'bg-white text-[#12151C] border-[#E5E7EB] hover:border-[#12151C]'
                        }`}
                      >
                        {out}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Action Text & Due Date - Uniform 34px Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                    Next Action Description
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
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full h-8.5 px-2.5 text-[12px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick timing shortcuts */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-[#12151C]/50">Quick timing:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(1)}
                  className="h-6 px-2 border border-[#E5E7EB] rounded hover:border-[#12151C] transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(3)}
                  className="h-6 px-2 border border-[#E5E7EB] rounded hover:border-[#12151C] transition-colors"
                >
                  3 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(7)}
                  className="h-6 px-2 border border-[#E5E7EB] rounded hover:border-[#12151C] transition-colors"
                >
                  1 Week
                </button>
              </div>

              {/* Call Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                  Call Notes (Optional)
                </label>
                <input
                  type="text"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Call notes & observations..."
                  className="w-full h-8.5 px-3 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
                />
              </div>

              {/* Modal Footer Buttons - Uniform 34px */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallingLead(null)}
                  className="h-8.5 px-3.5 text-[12px] border border-[#E5E7EB] rounded-md text-[#12151C]/70 hover:text-[#12151C] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(false)}
                  className="h-8.5 px-4 border border-[#12151C] rounded-md text-[#12151C] text-[12px] font-medium hover:bg-[#F4F6F9] transition-colors"
                >
                  Save Call
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(true)}
                  className="h-8.5 px-4 bg-[#12151C] rounded-md text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Save &amp; Next</span>
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
