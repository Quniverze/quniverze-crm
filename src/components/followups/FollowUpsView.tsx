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
    <div className="space-y-6 pt-2 max-w-5xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Calendar &amp; Follow-ups
          </h1>
          <p className="text-[13.5px] text-[#6B7280] mt-0.5">
            Rapid touchpoint execution: overdue items, today&apos;s calls, and upcoming schedule.
          </p>
        </div>

        {/* Filters Group: Scope + Type */}
        <div className="flex items-center gap-2">
          {/* Scope Toggle */}
          <div className="inline-flex p-1 bg-white border border-[#EAECEF] rounded-full shadow-xs">
            <button
              onClick={() => setScope('my')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                scope === 'my'
                  ? 'bg-[#1A5336] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Leads
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                scope === 'all'
                  ? 'bg-[#1A5336] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Team
            </button>
          </div>

          {/* Type Filter */}
          <div className="inline-flex p-1 bg-white border border-[#EAECEF] rounded-full shadow-xs">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                  typeFilter === t
                    ? 'bg-[#1A5336] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t === 'Product' ? 'Product' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          Month Calendar & Monthly Tasks (Exact match to reference)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Month Calendar Card */}
        <div className="md:col-span-6 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-bold text-[#111827]">May, 2025</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Weekdays */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="text-[11px] font-semibold text-gray-400 py-1">
                {d}
              </span>
            ))}

            {/* Past month filler in soft sage */}
            {['27', '28', '29', '30'].map((d) => (
              <div
                key={d}
                className="w-8 h-8 mx-auto rounded-full bg-[#AAB89F]/30 text-[#274030] flex items-center justify-center text-[12px] font-medium"
              >
                {d}
              </div>
            ))}

            {/* Current month days */}
            {['01', '02', '03'].map((d) => (
              <div
                key={d}
                className="w-8 h-8 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[12px] font-medium hover:bg-gray-100 cursor-pointer"
              >
                {d}
              </div>
            ))}

            {['04', '05', '06', '07', '08', '09', '10'].map((d) => (
              <div
                key={d}
                className="w-8 h-8 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[12px] font-medium hover:bg-gray-100 cursor-pointer"
              >
                {d}
              </div>
            ))}

            {/* Active Day 16 highlighted in Neon Lime */}
            {['11', '12', '13', '14', '15'].map((d) => (
              <div
                key={d}
                className="w-8 h-8 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[12px] font-medium hover:bg-gray-100 cursor-pointer"
              >
                {d}
              </div>
            ))}

            <div className="w-8 h-8 mx-auto rounded-xl bg-[#D8F231] text-[#132A1C] font-bold flex items-center justify-center text-[12.5px] shadow-xs cursor-pointer ring-2 ring-[#132A1C]">
              16
            </div>

            {['17', '18', '19', '20', '21', '22', '23', '24'].map((d) => (
              <div
                key={d}
                className="w-8 h-8 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[12px] font-medium hover:bg-gray-100 cursor-pointer"
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Tasks Timeline Slots */}
        <div className="md:col-span-6 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-[#111827]">Monthly Tasks</span>
            <button
              onClick={() => {
                const first = activeLeads[0];
                if (first) handleStartCall(first);
              }}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors"
            >
              +
            </button>
          </div>

          <div className="space-y-4">
            {/* 16 May, Friday */}
            <div className="p-3 bg-[#F8FAFC] border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[20px] font-bold text-gray-900 leading-none block">16</span>
                <span className="text-[10.5px] font-medium text-gray-500">May, Friday</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="px-3 py-1.5 bg-gray-200/70 text-gray-800 text-[11px] font-semibold rounded-xl shrink-0">
                  <span className="text-[9px] font-mono opacity-70 block">9 AM</span>
                  <span>Hostel Demo</span>
                </div>
                <div className="px-3 py-1.5 bg-[#D8F231] text-[#132A1C] text-[11px] font-bold rounded-xl shrink-0">
                  <span className="text-[9px] font-mono opacity-70 block">6 PM</span>
                  <span>Design Pitch</span>
                </div>
                <div className="w-8 h-8 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                  +
                </div>
              </div>
            </div>

            {/* 17 May, Saturday */}
            <div className="p-3 bg-[#F8FAFC] border border-gray-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[20px] font-bold text-gray-900 leading-none block">17</span>
                <span className="text-[10.5px] font-medium text-gray-500">May, Saturday</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <div className="px-3 py-1.5 bg-gray-200/70 text-gray-800 text-[11px] font-semibold rounded-xl shrink-0">
                  <span className="text-[9px] font-mono opacity-70 block">10 AM</span>
                  <span>Contract Review</span>
                </div>
                <div className="px-3 py-1.5 bg-[#AAB89F] text-[#132A1C] text-[11px] font-bold rounded-xl shrink-0">
                  <span className="text-[9px] font-mono opacity-70 block">2 PM</span>
                  <span>NivaOps Deploy</span>
                </div>
                <div className="w-8 h-8 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Queues */}
      {fullDialQueue.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#EAECEF] rounded-[22px] shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-[#1A5336]/40 mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[#111827]">Queue is clear</h3>
          <p className="text-[13px] text-gray-500 mt-1 max-w-sm mx-auto">
            No active follow-ups due. Leads with scheduled next actions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. OVERDUE SECTION */}
          {overdueLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full uppercase">
                  Overdue
                </span>
                <span className="text-[12.5px] text-gray-500">
                  ({overdueLeads.length} touchpoints needing immediate intervention)
                </span>
              </div>

              <div className="space-y-2.5">
                {overdueLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-rose-200 rounded-[20px] shadow-xs hover:border-[#1A5336] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2 py-0.5 rounded-full">
                          {lead.type}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {lead.stage}
                        </span>
                        <h3 className="text-[15px] font-bold text-[#111827]">
                          {lead.business_name}
                        </h3>
                        <span className="text-[12.5px] text-gray-500">
                          ({lead.contact_name})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#111827] font-semibold mt-1.5 flex items-center gap-1.5">
                        <span className="text-[#1A5336]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono mt-1 flex-wrap">
                        <span className="text-rose-600 font-bold">
                          Missed Date: {lead.next_action_due}
                        </span>
                        <span>•</span>
                        <span>Owner: {lead.assigned_to}</span>
                        {lead.city && <span>• {lead.city}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full border border-gray-200 hover:border-gray-800 text-gray-700 transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="btn-pill-primary text-[12px] py-2 px-4 shadow-xs"
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
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full uppercase">
                  Due Today
                </span>
                <span className="text-[12.5px] text-gray-500">
                  ({dueTodayLeads.length} touchpoints)
                </span>
              </div>

              <div className="space-y-2.5">
                {dueTodayLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-[#EAECEF] rounded-[20px] shadow-xs hover:border-[#1A5336] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2 py-0.5 rounded-full">
                          {lead.type}
                        </span>
                        <h3 className="text-[15px] font-bold text-[#111827]">
                          {lead.business_name}
                        </h3>
                        <span className="text-[12.5px] text-gray-500">
                          ({lead.contact_name} • {lead.phone})
                        </span>
                      </div>

                      <div className="text-[13px] text-[#111827] font-medium mt-1.5 flex items-center gap-1.5">
                        <span className="text-[#1A5336]">→</span>
                        <span>{lead.next_action}</span>
                      </div>

                      <div className="text-[11px] text-gray-500 font-mono mt-1">
                        Assigned to: {lead.assigned_to}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-full border border-gray-200 hover:border-gray-800 text-gray-700 transition-colors"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleStartCall(lead)}
                        className="btn-pill-primary text-[12px] py-2 px-4 shadow-xs"
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
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-[11px] font-bold rounded-full uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Missing Next Step</span>
                </span>
                <span className="text-[12.5px] text-gray-500">
                  ({missingActionLeads.length} leads with no scheduled follow-up)
                </span>
              </div>

              <div className="space-y-2.5">
                {missingActionLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-[#EAECEF] rounded-[20px] shadow-xs hover:border-[#1A5336] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2 py-0.5 rounded-full">
                          {lead.type}
                        </span>
                        <span className="font-bold text-[14.5px] text-[#111827]">
                          {lead.business_name}
                        </span>
                        <span className="text-[12px] text-gray-500">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[12px] text-gray-500 mt-1 italic">
                        No follow-up action scheduled. Assign a step to keep this deal moving.
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="btn-pill-primary text-[12px] py-2 px-4 shadow-xs self-end md:self-center shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Assign Next Step</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. UPCOMING SCHEDULE */}
          {upcomingLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold rounded-full uppercase">
                  Upcoming Schedule
                </span>
                <span className="text-[12.5px] text-gray-500">
                  ({upcomingLeads.length})
                </span>
              </div>

              <div className="space-y-2.5">
                {upcomingLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-[#EAECEF] rounded-[20px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2 py-0.5 rounded-full">
                          {lead.type}
                        </span>
                        <span className="font-bold text-[14px] text-[#111827]">
                          {lead.business_name}
                        </span>
                        <span className="text-[12px] text-gray-500">
                          ({lead.contact_name})
                        </span>
                      </div>
                      <div className="text-[12.5px] text-gray-700 mt-1 flex items-center gap-1.5">
                        <span className="text-[#1A5336]">→</span>
                        <span>{lead.next_action}</span>
                        {lead.next_action_due && (
                          <span className="font-mono text-[11px] text-gray-500">
                            (Due {lead.next_action_due})
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCall(lead)}
                      className="px-4 py-2 border border-gray-300 text-gray-800 rounded-full text-[12px] font-medium hover:border-gray-900 transition-colors self-end md:self-center shrink-0"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setCallingLead(null)}
        >
          <div
            className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-[#FAFAFB] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#1A5336] text-white px-2 py-0.5 rounded-full">
                    {callingLead.type}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">
                    Assigned: {callingLead.assigned_to}
                  </span>
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mt-1">
                  {callingLead.business_name}
                </h3>
              </div>
              <button
                onClick={() => setCallingLead(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Dial Buttons */}
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${callingLead.phone}`}
                  className="flex-1 py-3 bg-[#1A5336] text-white text-[13px] font-medium rounded-full hover:bg-[#14422B] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {callingLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${callingLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-white border border-gray-300 text-gray-800 text-[13px] font-medium rounded-full hover:border-gray-900 flex items-center gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {callingLead.angle && (
                <div className="p-3 bg-[#F8FAF9] border border-[#1A5336]/20 rounded-xl text-[12px] text-gray-800">
                  <span className="font-bold text-[#1A5336] mr-1.5">Angle:</span>
                  {callingLead.angle}
                </div>
              )}

              {/* 8 Standardized Outcomes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
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
                        className={`p-2.5 text-[11.5px] font-medium text-center rounded-xl border transition-colors ${
                          isSelected
                            ? 'bg-[#1A5336] text-white border-[#1A5336] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'
                        }`}
                      >
                        {out}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Action Text & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                    Next Action Description
                  </label>
                  <input
                    type="text"
                    value={nextActionText}
                    onChange={(e) => setNextActionText(e.target.value)}
                    placeholder="e.g. Follow up on proposal"
                    className="w-full px-3 py-2 text-[12.5px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full px-3 py-2 text-[12px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick timing shortcuts */}
              <div className="flex items-center gap-2 text-[11.5px] font-medium">
                <span className="text-gray-400">Quick timing:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(1)}
                  className="px-3 py-1 border border-gray-200 rounded-full hover:border-gray-900"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(3)}
                  className="px-3 py-1 border border-gray-200 rounded-full hover:border-gray-900"
                >
                  3 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPresetDays(7)}
                  className="px-3 py-1 border border-gray-200 rounded-full hover:border-gray-900"
                >
                  1 Week
                </button>
              </div>

              {/* Call Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Call Notes (Optional)
                </label>
                <input
                  type="text"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Wants demo of hostel management module on Thursday..."
                  className="w-full px-3 py-2 text-[12.5px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              {/* Actions: Save & Save & Next */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCallingLead(null)}
                  className="px-4 py-2 text-[12.5px] border border-gray-200 text-gray-600 rounded-full hover:border-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(false)}
                  className="px-5 py-2 border border-[#1A5336] text-[#1A5336] rounded-full text-[12.5px] font-medium hover:bg-[#E8F5EE] transition-colors"
                >
                  Save Call
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCall(true)}
                  className="px-5 py-2 bg-[#1A5336] text-white rounded-full text-[12.5px] font-medium hover:bg-[#14422B] transition-colors flex items-center gap-1.5 shadow-xs"
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
