'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { LeadType, Lead } from '@/types/crm';
import {
  Sparkles,
  Clock,
  Briefcase,
  Send,
  Calendar,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function TodayView() {
  const { leads, setCurrentView, setSelectedLeadId } = useCRM();
  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter leads by type
  const filteredLeads = useMemo(() => {
    if (typeFilter === 'All') return leads;
    return leads.filter((l) => l.type === typeFilter);
  }, [leads, typeFilter]);

  // Metric 1: New leads
  const newLeads = useMemo(() => {
    return filteredLeads.filter((l) => l.stage === 'New');
  }, [filteredLeads]);

  // Metric 2: Follow-ups due today & overdue
  const dueTodayLeads = useMemo(() => {
    return filteredLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due === todayStr
    );
  }, [filteredLeads, todayStr]);

  const overdueLeads = useMemo(() => {
    return filteredLeads.filter(
      (l) =>
        l.stage !== 'Won' &&
        l.stage !== 'Lost' &&
        l.next_action_due &&
        l.next_action_due < todayStr
    );
  }, [filteredLeads, todayStr]);

  // Metric 3: Active deals (Qualified .. Negotiation)
  const activeDeals = useMemo(() => {
    const activeStages = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return filteredLeads.filter((l) => activeStages.includes(l.stage));
  }, [filteredLeads]);

  // Metric 4: Proposals awaiting response
  const proposalsAwaiting = useMemo(() => {
    return filteredLeads.filter((l) => l.stage === 'Proposal');
  }, [filteredLeads]);

  const totalFollowUps = dueTodayLeads.length + overdueLeads.length;

  const handleOpenLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('leads');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Top Header & Type Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#3B82F6]">
              01 Today
            </span>
            <span className="text-[#E5E7EB]">/</span>
            <h1 className="text-[20px] font-bold text-[#12151C] tracking-tight">
              Action Center
            </h1>
          </div>
          <p className="text-[13px] text-[#12151C]/60 mt-0.5">
            Real-time pipeline posture and immediate scheduled actions.
          </p>
        </div>

        {/* Type Filter Pill */}
        <div className="inline-flex p-1 bg-[#F4F6F9] border border-[#E5E7EB] self-start sm:self-auto">
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

      {/* 4 Metric Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* 1. New Leads */}
        <div
          onClick={() => setCurrentView('leads')}
          className="p-4 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#12151C]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider">New Leads</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-[28px] font-mono font-bold text-[#12151C]">
            {newLeads.length}
          </div>
          <div className="text-[11px] text-[#12151C]/60 mt-1">
            Intake awaiting triage
          </div>
        </div>

        {/* 2. Follow-ups Due Today */}
        <div
          onClick={() => setCurrentView('followups')}
          className="p-4 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#12151C]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider">Follow-ups Today</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-mono font-bold text-[#12151C]">
              {dueTodayLeads.length}
            </span>
            {overdueLeads.length > 0 && (
              <span className="px-1.5 py-0.5 bg-[#12151C] text-white text-[11px] font-mono font-bold">
                {overdueLeads.length} overdue
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#12151C]/60 mt-1">
            Scheduled touchpoints
          </div>
        </div>

        {/* 3. Active Deals */}
        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-4 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#12151C]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Deals</span>
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-[28px] font-mono font-bold text-[#12151C]">
            {activeDeals.length}
          </div>
          <div className="text-[11px] text-[#12151C]/60 mt-1">
            Qualified through Negotiation
          </div>
        </div>

        {/* 4. Proposals Awaiting Response */}
        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-4 bg-white border border-[#E5E7EB] hover:border-[#12151C] transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#12151C]/60">
            <span className="text-[11px] font-mono uppercase tracking-wider">Proposals Out</span>
            <Send className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 text-[28px] font-mono font-bold text-[#12151C]">
            {proposalsAwaiting.length}
          </div>
          <div className="text-[11px] text-[#12151C]/60 mt-1">
            Awaiting client review
          </div>
        </div>
      </div>

      {/* Actionable Follow-up Feeds (Overdue & Today) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#12151C] font-semibold flex items-center gap-2">
            <span>Action Agenda</span>
            <span className="text-[#12151C]/40">({totalFollowUps})</span>
          </h2>
          {totalFollowUps > 0 && (
            <button
              onClick={() => setCurrentView('followups')}
              className="text-[12px] font-medium text-[#3B82F6] hover:underline flex items-center gap-1"
            >
              Open Follow-ups Queue <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {totalFollowUps === 0 ? (
          <div className="p-8 text-center bg-white border border-[#E5E7EB]">
            <CheckCircle2 className="w-8 h-8 text-[#12151C]/30 mx-auto mb-2" />
            <h3 className="text-[14px] font-medium text-[#12151C]">All caught up</h3>
            <p className="text-[12px] text-[#12151C]/60 mt-1 max-w-sm mx-auto">
              There are no pending actions or overdue follow-ups for {typeFilter === 'All' ? 'any line of business' : typeFilter}.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Overdue items */}
            {overdueLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleOpenLead(lead.id)}
                className="p-3.5 bg-white border-2 border-[#12151C] hover:border-[#3B82F6] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold bg-[#12151C] text-white px-1.5 py-0.5 uppercase">
                      Overdue
                    </span>
                    <span className="text-[11px] font-mono text-[#12151C]/60">
                      {lead.next_action_due}
                    </span>
                    <span className="text-[11px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                      {lead.type}
                    </span>
                    <span className="text-[13px] font-bold text-[#12151C]">
                      {lead.business_name}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-[#12151C] mt-1 font-medium flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{lead.next_action || 'Follow up with contact'}</span>
                  </div>
                  {lead.angle && (
                    <div className="text-[11px] text-[#12151C]/60 mt-0.5 truncate">
                      Angle: {lead.angle}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-mono text-[#12151C]/60">
                    {lead.assigned_to}
                  </span>
                  <button className="px-3 py-1 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] transition-colors">
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
                    <span className="text-[11px] font-mono text-[#12151C]/60">
                      {lead.type}
                    </span>
                    <span className="text-[13px] font-bold text-[#12151C]">
                      {lead.business_name}
                    </span>
                  </div>
                  <div className="text-[12.5px] text-[#12151C] mt-1 flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{lead.next_action || 'Follow up'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-mono text-[#12151C]/60">
                    {lead.assigned_to}
                  </span>
                  <button className="px-3 py-1 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] text-[11px] font-medium hover:bg-[#12151C] hover:text-white transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
