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
  MessageSquare
} from 'lucide-react';

export function CallQueueView() {
  const {
    leads,
    processCallOutcome,
    followUps,
    completeFollowUp,
    setSelectedLeadId,
    setCurrentView
  } = useCRM();

  // Active call modal state
  const [activeLeadIndex, setActiveLeadIndex] = useState<number | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [followUpTiming, setFollowUpTiming] = useState<FollowUpTimingOption>('Tomorrow');
  const [customFollowUpDate, setCustomFollowUpDate] = useState<string>('');
  const [callNote, setCallNote] = useState<string>('');
  const [assignToFounder, setAssignToFounder] = useState<boolean>(false);
  const [estimatedValue, setEstimatedValue] = useState<number>(35000);

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

    // Advance to next lead in queue or close if done
    if (activeLeadIndex !== null && activeLeadIndex < queueLeads.length - 1) {
      setActiveLeadIndex(activeLeadIndex); // will re-render with next lead as list updates
      setSelectedOutcome(null);
      setCallNote('');
      setAssignToFounder(false);
    } else {
      closeCallFlow();
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
      
      {/* QUEUE HEADER */}
      <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4 mb-6">
        <div>
          <span className="section-label">OUTREACH EXECUTION</span>
          <h1 className="page-title mt-1">Call Queue</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold tracking-wider text-[#111111] uppercase">
            {queueLeads.length} TO WORK
          </span>
        </div>
      </div>

      {/* QUEUE LIST */}
      {queueLeads.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E5E5E5] rounded-lg p-8">
          <CheckCircle2 className="w-10 h-10 text-[#16803C] mx-auto mb-3" />
          <h2 className="text-[18px] font-semibold text-[#111111] mb-1">NO CALLS LEFT</h2>
          <p className="text-[13.5px] text-[#6B6B6B] mb-6">
            You&apos;re completely clear for now. Great work on outreach!
          </p>
          <button
            onClick={() => setCurrentView('leads')}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#111111] hover:bg-black rounded transition-colors"
          >
            Find &amp; Research More Leads
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">
            NEXT UP
          </div>

          <div className="divide-y divide-[#E5E5E5] bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            {queueLeads.map((lead, idx) => {
              const queueNum = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={lead.id}
                  className="p-5 hover:bg-[#FAFAF8] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                    {/* Index Number */}
                    <span className="text-[17px] font-mono font-semibold text-[#6B6B6B] pt-0.5 w-7 flex-shrink-0">
                      {queueNum}
                    </span>

                    {/* Business & Angle */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="lead-name hover:underline text-left truncate max-w-full"
                        >
                          {lead.business_name}
                        </button>
                      </div>

                      <div className="metadata-text">
                        {lead.industry} · {lead.location}
                        {lead.contact_name && ` · ${lead.contact_name}`}
                      </div>

                      {/* Observations / Sales angle */}
                      {lead.observation && (
                        <div className="text-[13px] text-[#111111] font-normal leading-relaxed pt-1 max-w-2xl">
                          {lead.observation}
                        </div>
                      )}

                      {/* Phone Number Display */}
                      <div className="text-[13.5px] font-mono font-medium text-[#111111] pt-0.5">
                        {lead.phone || 'No phone recorded'}
                      </div>
                    </div>
                  </div>

                  {/* Primary Call Action */}
                  <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openCallFlow(idx)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white rounded font-medium text-[13.5px] tracking-wide transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>CALL →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* FOCUSED CALL FLOW MODAL (Section 7 & 8) */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 backdrop-blur-none p-4 overflow-y-auto">
          <div
            className="w-full max-w-xl bg-white border border-[#E5E5E5] rounded-lg shadow-2xl overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Call Flow Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#F7F7F5]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] font-bold text-[#6B6B6B]">
                  {String((activeLeadIndex || 0) + 1).padStart(2, '0')} / {queueLeads.length}
                </span>
                <span className="text-[#6B6B6B]">·</span>
                <span className="text-[12px] font-semibold tracking-wider text-[#111111] uppercase">
                  ACTIVE CALL WORKFLOW
                </span>
              </div>
              <button
                onClick={closeCallFlow}
                className="p-1 text-[#6B6B6B] hover:text-[#111111] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Lead Headline */}
              <div>
                <h2 className="text-[24px] font-bold text-[#111111] tracking-tight">
                  {activeLead.business_name}
                </h2>
                <div className="text-[13.5px] text-[#6B6B6B] mt-0.5">
                  {activeLead.industry} · {activeLead.location}
                  {activeLead.contact_name && ` · Contact: ${activeLead.contact_name}`}
                </div>
              </div>

              {/* Research & Observations Box */}
              <div className="p-3.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded space-y-2 text-[13px]">
                {activeLead.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#6B6B6B]" />
                    <span className="font-semibold text-[#6B6B6B] uppercase text-[10.5px]">Website:</span>
                    <a
                      href={`https://${activeLead.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#111111] underline hover:text-[#6B6B6B] flex items-center gap-1"
                    >
                      {activeLead.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {activeLead.observation && (
                  <div>
                    <div className="font-semibold text-[#6B6B6B] uppercase text-[10.5px] mb-0.5">
                      Observation &amp; Pitch Angle:
                    </div>
                    <div className="text-[#111111] leading-relaxed">
                      {activeLead.observation}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Phone & Dominant Call Trigger */}
              <div className="p-4 border border-[#E5E5E5] rounded-lg flex items-center justify-between bg-white">
                <div>
                  <div className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider">
                    CONTACT NUMBER
                  </div>
                  <div className="text-[18px] font-mono font-bold text-[#111111] mt-0.5">
                    {activeLead.phone || 'No phone recorded'}
                  </div>
                </div>

                <a
                  href={`tel:${activeLead.phone}`}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#111111] hover:bg-black text-white rounded font-semibold text-[14px] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>CALL NOW</span>
                </a>
              </div>

              {/* Structured Outcome Selector */}
              <div>
                <div className="text-[11.5px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2.5">
                  AFTER CALL: How did it go?
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      'No Answer',
                      'Busy',
                      'Wrong Number',
                      'Not Interested',
                      'Interested',
                      'Call Later',
                      'WhatsApp Sent',
                      'Meeting Requested'
                    ] as CallOutcome[]
                  ).map((outcome) => {
                    const isSelected = selectedOutcome === outcome;
                    let styleClass = 'border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F5]';

                    if (isSelected) {
                      if (outcome === 'Interested' || outcome === 'Meeting Requested') {
                        styleClass = 'border-[#16803C] bg-[#16803C] text-white font-semibold';
                      } else if (outcome === 'Not Interested' || outcome === 'Wrong Number') {
                        styleClass = 'border-[#C62828] bg-[#C62828] text-white font-semibold';
                      } else {
                        styleClass = 'border-[#111111] bg-[#111111] text-white font-semibold';
                      }
                    }

                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => {
                          setSelectedOutcome(outcome);
                          if (outcome === 'Interested' || outcome === 'Meeting Requested') {
                            setAssignToFounder(true);
                          }
                        }}
                        className={`px-3 py-2 text-[12.5px] border rounded text-center transition-all ${styleClass}`}
                      >
                        {outcome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contextual actions if Interested or Meeting */}
              {(selectedOutcome === 'Interested' || selectedOutcome === 'Meeting Requested') && (
                <div className="p-3.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignToFounder}
                        onChange={(e) => setAssignToFounder(e.target.checked)}
                        className="w-4 h-4 rounded text-[#16803C] focus:ring-0"
                      />
                      <span className="text-[13px] font-semibold text-[#16803C]">
                        Assign Qualified Opportunity to Founder (Faslu)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#16803C] uppercase tracking-wider mb-1">
                      Estimated Deal Value (₹)
                    </label>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-[13px] font-medium border border-[#BBF7D0] rounded bg-white text-[#111111] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Next Follow-Up Timing */}
              <div>
                <div className="text-[11.5px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">
                  NEXT FOLLOW-UP
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(['Tomorrow', '3 Days', '7 Days', 'Custom'] as FollowUpTimingOption[]).map(
                    (timing) => (
                      <button
                        key={timing}
                        type="button"
                        onClick={() => setFollowUpTiming(timing)}
                        className={`py-1.5 text-[12.5px] border rounded font-medium transition-all ${
                          followUpTiming === timing
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F5]'
                        }`}
                      >
                        {timing}
                      </button>
                    )
                  )}
                </div>

                {followUpTiming === 'Custom' && (
                  <input
                    type="date"
                    value={customFollowUpDate}
                    onChange={(e) => setCustomFollowUpDate(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded focus:outline-none bg-white text-[#111111]"
                  />
                )}
              </div>

              {/* Short Note */}
              <div>
                <label className="block text-[11.5px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">
                  Short Call Note (Optional)
                </label>
                <input
                  type="text"
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                  placeholder="e.g. Owner asked to call back after 4 PM with price options..."
                  className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded focus:outline-none bg-white text-[#111111]"
                />
              </div>

              {/* Save & Advance Button */}
              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={closeCallFlow}
                  className="px-4 py-2 text-[13px] text-[#6B6B6B] hover:text-[#111111]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#111111] hover:bg-black text-white rounded font-semibold text-[14px] transition-colors shadow-xs"
                >
                  <span>SAVE &amp; NEXT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
