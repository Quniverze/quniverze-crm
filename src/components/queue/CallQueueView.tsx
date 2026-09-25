'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, CallOutcome, FollowUpTimingOption } from '@/types/crm';
import {
  Phone,
  ArrowRight,
  Globe,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  MessageSquare,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react';

export function CallQueueView() {
  const {
    leads,
    processCallOutcome,
    followUps,
    completeFollowUp,
    setSelectedLeadId,
    setCurrentView,
    setQuickAddOpen,
    setImportModalOpen
  } = useCRM();

  // Active call modal state
  const [activeLeadIndex, setActiveLeadIndex] = useState<number | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [followUpTiming, setFollowUpTiming] = useState<FollowUpTimingOption>('Tomorrow');
  const [customFollowUpDate, setCustomFollowUpDate] = useState<string>('');
  const [callNote, setCallNote] = useState<string>('');
  const [assignToFounder, setAssignToFounder] = useState<boolean>(false);
  const [estimatedValue, setEstimatedValue] = useState<number>(35000);

  const nowMs = Date.now();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndMs = todayEnd.getTime();

  // Overdue follow-ups
  const overdueItems = useMemo(() => {
    return followUps.filter((f) => f.status === 'pending' && new Date(f.due_at).getTime() < nowMs);
  }, [followUps, nowMs]);

  // Today's pending follow-ups
  const todayItems = useMemo(() => {
    return followUps.filter((f) => {
      if (f.status !== 'pending') return false;
      const t = new Date(f.due_at).getTime();
      return t >= nowMs && t <= todayEndMs;
    });
  }, [followUps, nowMs, todayEndMs]);

  // Filter leads to work: Status in 'To Call', 'New', 'Contacted' or with pending follow-up
  const queueLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        l.status === 'To Call' ||
        l.status === 'New' ||
        (l.status === 'Contacted' && l.next_follow_up_at)
    );
  }, [leads]);

  const activeLead = activeLeadIndex !== null ? queueLeads[activeLeadIndex] : null;

  const openCallFlow = (index: number) => {
    setActiveLeadIndex(index);
    setSelectedOutcome(null);
    setFollowUpTiming('Tomorrow');
    setCallNote('');
    setAssignToFounder(false);
    setEstimatedValue(35000);
  };

  const closeCallFlow = () => {
    setActiveLeadIndex(null);
  };

  const handleSaveAndNext = () => {
    if (!activeLead) return;

    const outcome = selectedOutcome || 'Interested';

    processCallOutcome({
      leadId: activeLead.id,
      outcome,
      followUpTiming,
      customDate: customFollowUpDate,
      note: callNote,
      assignToFounder,
      estimatedValue
    });

    if (activeLeadIndex !== null && activeLeadIndex < queueLeads.length - 1) {
      setActiveLeadIndex(activeLeadIndex);
      setSelectedOutcome(null);
      setCallNote('');
      setAssignToFounder(false);
    } else {
      closeCallFlow();
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F4F6F9]">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20 space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-[#E5E7EB] pb-4 flex items-baseline justify-between">
          <div>
            <span className="section-label">EXECUTION SYSTEM</span>
            <h1 className="page-title mt-1">Follow-ups &amp; Call Queue</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-[#6B7280]">
              {queueLeads.length} leads in queue
            </span>
          </div>
        </div>

        {/* 1. OVERDUE FOLLOW-UPS (IMMEDIATELY VISIBLE) */}
        {overdueItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="section-label text-[#12151C]">OVERDUE ACTIONS</span>
              <span className="text-[10.5px] font-bold px-1.5 py-0.2 rounded bg-[#12151C] text-white font-mono">
                {overdueItems.length}
              </span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {overdueItems.map((fu) => {
                const lead = leads.find((l) => l.id === fu.lead_id);
                return (
                  <div key={fu.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (fu.lead_id) {
                              setSelectedLeadId(fu.lead_id);
                              setCurrentView('leads');
                            }
                          }}
                          className="font-semibold text-[13.5px] text-[#12151C] hover:underline text-left"
                        >
                          {lead?.business_name || 'Prospect'}
                        </button>
                        <span className="text-[10px] font-mono text-[#6B7280]">
                          Due {new Date(fu.due_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#4B5563]">
                        {fu.action}
                        {lead?.phone && ` · ${lead.phone}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {lead?.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="px-2.5 py-1 text-[11.5px] font-medium bg-[#12151C] text-white hover:bg-black rounded transition-colors flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => completeFollowUp(fu.id)}
                        className="px-2.5 py-1 text-[11.5px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#3B82F6]" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. TODAY'S SCHEDULED FOLLOW-UPS */}
        {todayItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="section-label">TODAY&apos;S SCHEDULED TOUCHES</span>
              <span className="text-[11px] font-mono text-[#6B7280]">({todayItems.length})</span>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {todayItems.map((fu) => {
                const lead = leads.find((l) => l.id === fu.lead_id);
                return (
                  <div key={fu.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[13.5px] text-[#12151C]">
                        {lead?.business_name || 'Prospect'}
                      </div>
                      <div className="text-[12px] text-[#4B5563]">
                        {fu.action}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {lead?.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="px-2.5 py-1 text-[11.5px] font-medium bg-[#12151C] text-white rounded flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => completeFollowUp(fu.id)}
                        className="px-2.5 py-1 text-[11.5px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-[#3B82F6]" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ACTIVE CALL QUEUE (Who to Call Next) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-label">CALL WORKLIST</span>
            <span className="text-[11px] font-mono text-[#6B7280]">{queueLeads.length} leads</span>
          </div>

          {queueLeads.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E5E7EB] rounded space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#12151C] mx-auto" />
              <h2 className="text-[16px] font-semibold text-[#12151C]">All calls completed</h2>
              <p className="text-[12.5px] text-[#6B7280] max-w-sm mx-auto">
                No leads currently awaiting calls. Add new prospects to begin your next outreach sprint.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#12151C] hover:bg-black rounded transition-colors"
                >
                  Add Lead
                </button>
                <button
                  onClick={() => setCurrentView('leads')}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded transition-colors"
                >
                  View All Leads
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {queueLeads.map((lead, idx) => (
                <div
                  key={lead.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F4F6F9] transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <span className="text-[14px] font-mono text-[#6B7280] pt-0.5 w-6 flex-shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="font-bold text-[15px] text-[#12151C] hover:underline text-left truncate"
                        >
                          {lead.business_name}
                        </button>
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-[#F4F6F9] text-[#12151C] border border-[#E5E7EB]">
                          {lead.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        {lead.contact_name ? `${lead.contact_name} · ` : ''}{lead.industry} · {lead.location}
                      </div>
                      {lead.observation && (
                        <div className="text-[12px] text-[#4B5563] line-clamp-1 italic">
                          &ldquo;{lead.observation}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-2 border border-[#E5E7EB] hover:border-[#12151C] rounded text-[#12151C] bg-white transition-colors"
                        title="Direct Dial"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openCallFlow(idx)}
                      className="px-3.5 py-1.5 bg-[#12151C] hover:bg-black text-white text-[12px] font-medium rounded transition-colors flex items-center gap-1.5"
                    >
                      <span>Start Call</span>
                      <ArrowRight className="w-3 h-3 text-[#3B82F6]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ACTIVE CALL FLOW MODAL */}
      {activeLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/40 p-4"
          onClick={closeCallFlow}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E5E7EB] flex items-baseline justify-between bg-[#F4F6F9]">
              <div>
                <span className="section-label">LOG CALL OUTCOME</span>
                <h3 className="text-[17px] font-bold text-[#12151C] mt-0.5">
                  {activeLead.business_name}
                </h3>
                <div className="text-[12px] text-[#6B7280]">
                  {activeLead.contact_name} · {activeLead.phone}
                </div>
              </div>
              <button
                type="button"
                onClick={closeCallFlow}
                className="p-1 text-[#6B7280] hover:text-[#12151C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              
              {/* Outcome Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Select Call Outcome
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      'Interested',
                      'Meeting Requested',
                      'WhatsApp Sent',
                      'Call Later',
                      'Busy',
                      'No Answer',
                      'Wrong Number',
                      'Not Interested'
                    ] as CallOutcome[]
                  ).map((outcome) => {
                    const isSelected = selectedOutcome === outcome;
                    const isPositive = outcome === 'Interested' || outcome === 'Meeting Requested';
                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedOutcome(outcome)}
                        className={`p-2 text-[11.5px] font-medium rounded border text-center transition-all ${
                          isSelected
                            ? 'bg-[#12151C] text-white border-[#12151C]'
                            : isPositive
                            ? 'bg-white text-[#12151C] border-[#3B82F6]/60 hover:border-[#3B82F6]'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#12151C]'
                        }`}
                      >
                        {outcome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Follow-up Timing */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Schedule Follow-up
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Tomorrow', '3 Days', '7 Days', 'Custom'] as FollowUpTimingOption[]).map((timing) => (
                    <button
                      key={timing}
                      type="button"
                      onClick={() => setFollowUpTiming(timing)}
                      className={`p-2 text-[11.5px] font-medium rounded border transition-colors ${
                        followUpTiming === timing
                          ? 'bg-[#12151C] text-white border-[#12151C]'
                          : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#12151C]'
                      }`}
                    >
                      {timing}
                    </button>
                  ))}
                </div>
                {followUpTiming === 'Custom' && (
                  <input
                    type="date"
                    value={customFollowUpDate}
                    onChange={(e) => setCustomFollowUpDate(e.target.value)}
                    className="w-full mt-2 p-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
                  />
                )}
              </div>

              {/* Founder Handoff */}
              {(selectedOutcome === 'Interested' || selectedOutcome === 'Meeting Requested') && (
                <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[12.5px] font-semibold text-[#12151C]">
                    <input
                      type="checkbox"
                      checked={assignToFounder}
                      onChange={(e) => setAssignToFounder(e.target.checked)}
                      className="accent-[#3B82F6]"
                    />
                    <span>Hand off qualified opportunity to Founder (Faslu)</span>
                  </label>
                  {assignToFounder && (
                    <div className="pt-1 flex items-center justify-between text-[12px]">
                      <span className="text-[#6B7280]">Est. Opportunity Value:</span>
                      <input
                        type="number"
                        step="5000"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(Number(e.target.value))}
                        className="w-32 p-1 bg-white border border-[#E5E7EB] rounded font-mono text-[12px] text-right focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Call Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Call Notes / Prospect Reaction
                </label>
                <textarea
                  rows={2}
                  placeholder="Record brief note about customer response..."
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              {/* Save & Advance Action Button */}
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="w-full py-2.5 bg-[#12151C] hover:bg-black text-white text-[13px] font-medium rounded transition-colors flex items-center justify-center gap-2"
              >
                <span>Save Outcome &amp; Advance</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#3B82F6]" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
