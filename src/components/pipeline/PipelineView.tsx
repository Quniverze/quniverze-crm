'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, LeadStage, LeadType, PIPELINE_STAGES } from '@/types/crm';
import {
  ArrowRight,
  Plus,
  CheckCircle2,
  DollarSign,
  User as UserIcon,
  MapPin,
  Clock,
  Briefcase,
  Edit2,
  Trash2,
  TrendingUp
} from 'lucide-react';

export function PipelineView() {
  const {
    leads,
    advanceStage,
    setStage,
    setSelectedLeadId,
    setCurrentView,
    setQuickAddOpen,
    setEditingLead,
    setLeadModalOpen,
    deleteLead,
    teamMembers
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [assignedFilter, setAssignedFilter] = useState<'All' | string>('All');
  const [financeTimeframe, setFinanceTimeframe] = useState<'Monthly' | 'Yearly'>('Monthly');

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (typeFilter !== 'All' && l.type !== typeFilter) return false;
      if (assignedFilter !== 'All' && l.assigned_to !== assignedFilter) return false;
      return true;
    });
  }, [leads, typeFilter, assignedFilter]);

  // Total Pipeline Value (active deals: Qualified .. Negotiation)
  const activePipelineValue = useMemo(() => {
    const active = ['Qualified', 'Discovery', 'Proposal', 'Negotiation'];
    return filteredLeads
      .filter((l) => active.includes(l.stage))
      .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [filteredLeads]);

  // Won Deals Value
  const wonValue = useMemo(() => {
    return filteredLeads
      .filter((l) => l.stage === 'Won')
      .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [filteredLeads]);

  const handleOpenLead = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('leads');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Pipeline Analytics
          </h1>
          <p className="text-[13.5px] text-[#6B7280] mt-0.5">
            Active deal volume: <span className="font-mono font-bold text-[#111827]">₹{activePipelineValue.toLocaleString()}</span>
            <span className="mx-2 text-gray-300">|</span>
            Closed won: <span className="font-mono font-bold text-[#1A5336]">₹{wonValue.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-[12.5px] text-gray-700 focus:outline-none shadow-xs"
          >
            <option value="All">All Team</option>
            {teamMembers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Line of Business Toggle */}
          <div className="inline-flex p-1 bg-white border border-gray-200 rounded-full shadow-xs">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1 text-[12px] font-medium rounded-full transition-colors ${
                  typeFilter === t
                    ? 'bg-[#1A5336] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t === 'Product' ? 'Product' : t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="btn-pill-primary py-2 px-4 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          FINANCE OVERVIEW CARDS (Exact match to reference)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
        {/* Card 1: Monthly Revenue Bars */}
        <div className="md:col-span-6 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-[#111827]">Pipeline Revenue</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFinanceTimeframe('Monthly')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  financeTimeframe === 'Monthly' ? 'bg-[#1A5336] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setFinanceTimeframe('Yearly')}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  financeTimeframe === 'Yearly' ? 'bg-[#1A5336] text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="my-2">
            <span className="text-[32px] font-bold text-[#111827] tracking-tight">
              {activePipelineValue > 0 ? `₹${activePipelineValue.toLocaleString()}` : '$2,598'}
            </span>
          </div>

          {/* Monthly Bars */}
          <div className="space-y-2 mt-2">
            {/* April */}
            <div className="p-2.5 rounded-xl bg-[#AAB89F]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-gray-700 block">April</span>
                <span className="text-[13px] font-bold text-gray-900">$605</span>
              </div>
            </div>

            {/* May (Neon Lime active) */}
            <div className="p-2.5 rounded-xl bg-[#D8F231] text-[#132A1C] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold opacity-80 block">May Revenue</span>
                <span className="text-[14px] font-bold">$1,026</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10.5px] font-bold">
                Overdue 20%
              </span>
            </div>

            {/* June */}
            <div className="p-2.5 rounded-xl bg-[#AAB89F]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-gray-700 block">June</span>
                <span className="text-[13px] font-bold text-gray-900">$967</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Yearly Revenue Goal */}
        <div className="md:col-span-6 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-[#111827]">Yearly Revenue Goal</span>
            <span className="text-[11px] font-mono text-gray-400">&lt;&gt;</span>
          </div>

          <div className="my-2">
            <span className="text-[32px] font-bold text-[#111827] tracking-tight">
              {wonValue > 0 ? `₹${(wonValue + activePipelineValue).toLocaleString()}` : '$8,367'}
            </span>
          </div>

          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between text-[11.5px] text-gray-600">
              <span>Revenue goal not Achieved 69%</span>
              <span className="font-semibold text-[#1A5336]">Earned 31%</span>
            </div>

            {/* Vertical tick lines capsule progress bar matching screenshot */}
            <div className="h-6 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center px-1 relative">
              <div
                className="h-4 bg-[#184D34] rounded-full flex items-center overflow-hidden"
                style={{ width: '31%' }}
              >
                {/* Dotted pattern overlay */}
                <div className="w-full h-full opacity-30 flex items-center justify-around">
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-around opacity-40 px-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="w-[1.5px] h-3 bg-gray-400 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Stage Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max pb-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
            const isWon = stage === 'Won';
            const isLost = stage === 'Lost';

            return (
              <div
                key={stage}
                className="w-72 md:w-80 flex flex-col bg-white border border-[#EAECEF] rounded-[22px] shadow-xs shrink-0 h-full overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#EAECEF] bg-[#FAFAFB] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400">
                      0{idx + 1}
                    </span>
                    <h2 className="text-[13px] font-bold text-[#111827] uppercase tracking-wide">
                      {stage}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {stageValue > 0 && (
                      <span className="text-[11px] font-mono text-gray-500">
                        ₹{stageValue.toLocaleString()}
                      </span>
                    )}
                    <span className="w-5 h-5 bg-[#E8F5EE] text-[#1A5336] text-[11px] font-mono font-bold rounded-full flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-[12px] border border-dashed border-gray-200 rounded-xl mt-2">
                      Empty stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3.5 bg-[#F8FAFC] border border-gray-200/70 rounded-2xl hover:border-[#1A5336] transition-colors group space-y-2"
                      >
                        {/* Type & Owner */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span className="uppercase font-semibold text-[#1A5336] bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                            {lead.type}
                          </span>
                          <span>{lead.assigned_to}</span>
                        </div>

                        {/* Business Name */}
                        <div
                          onClick={() => handleOpenLead(lead.id)}
                          className="cursor-pointer"
                        >
                          <h4 className="text-[14px] font-bold text-[#111827] group-hover:text-[#1A5336] transition-colors">
                            {lead.business_name}
                          </h4>
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {lead.contact_name} {lead.city && `• ${lead.city}`}
                          </div>
                        </div>

                        {/* Angle */}
                        {lead.angle && (
                          <div className="text-[11.5px] text-gray-600 italic line-clamp-2">
                            &ldquo;{lead.angle}&rdquo;
                          </div>
                        )}

                        {/* Next Action */}
                        {lead.next_action ? (
                          <div className="text-[12px] text-[#111827] font-medium pt-1.5 border-t border-gray-200 flex items-center justify-between gap-1">
                            <div className="truncate flex items-center gap-1">
                              <span className="text-[#1A5336]">→</span>
                              <span className="truncate">{lead.next_action}</span>
                            </div>
                            {lead.next_action_due && (
                              <span className="text-[10px] font-mono text-gray-400 shrink-0">
                                {lead.next_action_due}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-gray-400 italic pt-1.5 border-t border-gray-200">
                            No next action scheduled
                          </div>
                        )}

                        {/* Value, Actions & 1-Click Stage Advance */}
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-mono font-bold text-[#111827]">
                              {lead.value ? `₹${lead.value.toLocaleString()}` : '—'}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLead(lead);
                                  setLeadModalOpen(true);
                                }}
                                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
                                title="Edit Lead"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete ${lead.business_name}?`)) {
                                    deleteLead(lead.id);
                                  }
                                }}
                                className="p-1 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {!isWon && !isLost && (
                            <button
                              type="button"
                              onClick={() => advanceStage(lead.id)}
                              className="px-3 py-1 bg-[#1A5336] hover:bg-[#14422B] text-white text-[11px] font-medium rounded-full transition-colors flex items-center gap-1 shadow-xs"
                              title="Advance to next stage"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {isWon && (
                            <span className="text-[10.5px] font-mono uppercase font-bold text-[#1A5336] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#1A5336]" />
                              <span>Closed Won</span>
                            </span>
                          )}

                          {isLost && (
                            <span className="text-[10.5px] font-mono uppercase text-gray-400">
                              Lost
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
