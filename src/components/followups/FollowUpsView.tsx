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
  Sparkles,
  HelpCircle
} from 'lucide-react';

export function FollowUpsView() {
  const {
    leads,
    logCall,
    setSelectedLeadId,
    setCurrentView,
    currentUser,
    updateLead
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#3B82F6]">
              03 Execution
            </span>
            <span className="text-[#E5E7EB]">/</span>
            <h1 className="text-[20px] font-bold text-[#12151C] tracking-tight">
              Action Queue
            </h1>
          </div>
          <p className="text-[13px] text-[#12151C]/60 mt-0.5">
            Rapid touchpoint execution: overdue items, today&apos;s calls, and unassigned steps.
          </p>
        </div>

        {/* Filters Group: Scope + Type */}
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

          {/* Type Filter */}
          <div className="inline-flex p-1 bg-[#F4F6F9] border border-[#E5E7EB]">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product (NivaOps)' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Queues */}
      {fullDialQueue.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E5E7EB]">
          <CheckCircle2 className="w-10 h-10 text-[#12151C]/30 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-[#12151C]">Queue is clear</h3>
          <p className="text-[12.5px] text-[#12151C]/60 mt-1 max-w-sm mx-auto">
            No active follow-ups due. Leads with scheduled next actions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. OVERDUE SECTION */}
          {overdueLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#12151C] text-white text-[11px] font-mono font-bold uppercase">
                  Overdue
                </span>
                <span className="text-[12px] font-mono text-[#12151C]/60">
                  ({overdueLeads.length} touchpoints needing immediate intervention)
                </span>
              </div>

              <div className="space-y-2">
                {overdueLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border-2 border-[#12151C] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                          {lead.type}
                        </span>
                        <span className="text-[10px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                          {lead.stage}
                        </span>
                        <h3 className="text-[14.5px] font-bold text-[#12151C]">
                          {lead.business_name}
                        </h3>
                        <span className="text-[12px] text-[#12151C]/70">
                          ({lead.contact_name})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#12151C] font-semibold mt-1.5 flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#12151C]/60 font-mono mt-1 flex-wrap">
                        <span className="text-[#12151C] font-bold">
                          Missed Date: {lead.next_action_due}
                        </span>
                        <span>•</span>
                        <span>Owner: {lead.assigned_to}</span>
                        {lead.city && (
                          <>
                            <span>•</span>
                            <span>{lead.city}</span>
                          </>
                        )}
                        {lead.angle && (
                          <>
                            <span>•</span>
                            <span className="italic text-[#12151C]/80">Angle: {lead.angle}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C]"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="px-4 py-2 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5"
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

          {/* 2. DUE TODAY SECTION */}
          {dueTodayLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] text-[11px] font-mono font-bold uppercase">
                  Due Today
                </span>
                <span className="text-[12px] font-mono text-[#12151C]/60">
                  ({dueTodayLeads.length} touchpoints)
                </span>
              </div>

              <div className="space-y-2">
                {dueTodayLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                          {lead.type}
                        </span>
                        <span className="text-[10px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                          {lead.stage}
                        </span>
                        <h3 className="text-[14px] font-bold text-[#12151C]">
                          {lead.business_name}
                        </h3>
                        <span className="text-[12px] text-[#12151C]/70">
                          ({lead.contact_name} • {lead.phone})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#12151C] font-medium mt-1.5 flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="text-[11px] text-[#12151C]/60 font-mono mt-1">
                        Assigned to: {lead.assigned_to}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C]"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="px-4 py-2 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5"
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

          {/* 3. MISSING NEXT ACTION SECTION */}
          {missingActionLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#12151C] text-[#12151C] text-[11px] font-mono font-bold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#3B82F6]" />
                  <span>Missing Next Step</span>
                </span>
                <span className="text-[12px] font-mono text-[#12151C]/60">
                  ({missingActionLeads.length} leads with no scheduled follow-up)
                </span>
              </div>

              <div className="space-y-2">
                {missingActionLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 bg-white border border-[#E5E7EB] hover:border-[#12151C] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] px-1.5 py-0.5 border border-[#E5E7EB]">
                          {lead.type}
                        </span>
                        <span className="font-bold text-[#12151C]">
                          {lead.business_name}
                        </span>
                        <span className="text-[11.5px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[11.5px] text-[#12151C]/50 mt-1 italic">
                        No follow-up action scheduled yet. Assign a step to keep this deal alive.
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="px-3.5 py-1.5 bg-[#12151C] text-white text-[11.5px] font-medium hover:bg-[#3B82F6] self-end md:self-center shrink-0 flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Assign Next Step</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. UPCOMING SECTION */}
          {upcomingLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] text-[11px] font-mono font-medium uppercase">
                  Upcoming Schedule
                </span>
                <span className="text-[12px] font-mono text-[#12151C]/60">
                  ({upcomingLeads.length})
                </span>
              </div>

              <div className="space-y-2">
                {upcomingLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 bg-white border border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] px-1.5 py-0.5 border border-[#E5E7EB]">
                          {lead.type}
                        </span>
                        <span className="font-bold text-[#12151C]">
                          {lead.business_name}
                        </span>
                        <span className="text-[11.5px] text-[#12151C]/60">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[12px] text-[#12151C]/80 mt-1 flex items-center gap-1.5">
                        <span className="text-[#3B82F6]">→</span>
                        <span>{lead.next_action}</span>
                        {lead.next_action_due && (
                          <span className="font-mono text-[10.5px] text-[#12151C]/60">
                            (Due {lead.next_action_due})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="px-3 py-1.5 border border-[#E5E7EB] text-[#12151C] text-[11.5px] font-medium hover:border-[#12151C] self-end md:self-center shrink-0"
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

      {/* ONE-CLICK CALL & OUTCOME MODAL */}
      {callingLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 p-4"
          onClick={() => setCallingLead(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E5E7EB] bg-[#F4F6F9] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5">
                    {callingLead.type}
                  </span>
                  <span className="text-[11px] font-mono text-[#12151C]/60">
                    Assigned: {callingLead.assigned_to}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-[#12151C] mt-1">
                  {callingLead.business_name}
                </h3>
              </div>
              <button
                onClick={() => setCallingLead(null)}
                className="p-1 text-[#12151C]/60 hover:text-[#12151C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Dial Button */}
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${callingLead.phone}`}
                  className="flex-1 py-2.5 bg-[#12151C] text-white text-[13px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {callingLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${callingLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#12151C] text-[13px] font-medium hover:border-[#12151C] flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {callingLead.angle && (
                <div className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[11.5px] text-[#12151C]">
                  <span className="font-mono uppercase font-bold text-[#12151C]/60 mr-1.5">Angle:</span>
                  {callingLead.angle}
                </div>
              )}

              {/* 8 Standardized Outcomes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70">
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
                        className={`p-2 text-[11.5px] font-medium text-left border transition-colors ${
                          isSelected
                            ? 'bg-[#12151C] text-white border-[#12151C]'
                            : 'bg-white text-[#12151C] border-[#E5E7EB] hover:border-[#12151C]'
                        }`}
                      >
                        {out}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Action Text & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70">
                    Next Action Description
                  </label>
                  <input
                    type="text"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    placeholder="e.g. Follow up on proposal"
                    className="w-full px-3 py-1.5 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick timing shortcuts */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-[#12151C]/50">Quick timing:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(1)}
                  className="px-2 py-0.5 border border-[#E5E7EB] hover:border-[#12151C]"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(3)}
                  className="px-2 py-0.5 border border-[#E5E7EB] hover:border-[#12151C]"
                >
                  3 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(7)}
                  className="px-2 py-0.5 border border-[#E5E7EB] hover:border-[#12151C]"
                >
                  1 Week
                </button>
              </div>

              {/* Call Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70">
                  Call Notes (Optional)
                </label>
                <input
                  type="text"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Wants demo of hostel management module on Thursday..."
                  className="w-full px-3 py-1.5 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
                />
              </div>

              {/* Actions: Save & Save & Next */}
              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallingLead(null)}
                  className="px-3.5 py-2 text-[12px] border border-[#E5E7EB] text-[#12151C]/70 hover:text-[#12151C]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(false)}
                  className="px-4 py-2 border border-[#12151C] text-[#12151C] text-[12px] font-medium hover:bg-[#F4F6F9] transition-colors"
                >
                  Save Call
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(true)}
                  className="px-4 py-2 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5"
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
