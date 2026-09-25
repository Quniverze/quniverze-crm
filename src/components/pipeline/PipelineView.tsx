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
  Briefcase
} from 'lucide-react';

export function PipelineView() {
  const {
    leads,
    advanceStage,
    setStage,
    setSelectedLeadId,
    setCurrentView,
    setQuickAddOpen,
    teamMembers
  } = useCRM();

  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [assignedFilter, setAssignedFilter] = useState<'All' | string>('All');

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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F4F6F9]">
      {/* Top Header & Filter Controls */}
      <div className="p-4 md:px-8 bg-white border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#3B82F6]">
              04 Commercial
            </span>
            <span className="text-[#E5E7EB]">/</span>
            <h1 className="text-[20px] font-bold text-[#12151C] tracking-tight">
              Pipeline Flow
            </h1>
          </div>
          <p className="text-[13px] text-[#12151C]/60 mt-0.5">
            Active deal volume: <span className="font-mono font-bold text-[#12151C]">₹{activePipelineValue.toLocaleString()}</span>
            <span className="mx-2 text-[#E5E7EB]">|</span>
            Closed won: <span className="font-mono font-bold text-[#12151C]">₹{wonValue.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] text-[#12151C] focus:outline-none"
          >
            <option value="All">All Team</option>
            {teamMembers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Line of Business Toggle */}
          <div className="inline-flex p-1 bg-[#F4F6F9] border border-[#E5E7EB]">
            {(['All', 'Product', 'Client Work'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-[12px] font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-[#12151C] text-white shadow-sm'
                    : 'text-[#12151C]/70 hover:text-[#12151C]'
                }`}
              >
                {t === 'Product' ? 'Product (NivaOps)' : t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="px-3.5 py-1.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex gap-3 h-full min-w-max pb-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
            const isWon = stage === 'Won';
            const isLost = stage === 'Lost';

            return (
              <div
                key={stage}
                className="w-72 md:w-80 flex flex-col bg-white border border-[#E5E7EB] shrink-0 h-full"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#E5E7EB] bg-[#F4F6F9]/70 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#12151C]/50">
                      0{idx + 1}
                    </span>
                    <h2 className="text-[13px] font-bold text-[#12151C] uppercase tracking-wide">
                      {stage}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {stageValue > 0 && (
                      <span className="text-[11px] font-mono text-[#12151C]/70">
                        ₹{stageValue.toLocaleString()}
                      </span>
                    )}
                    <span className="w-5 h-5 bg-[#E5E7EB] text-[#12151C] text-[11px] font-mono font-bold flex items-center justify-center">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {stageLeads.length === 0 ? (
                    <div className="p-6 text-center text-[#12151C]/40 text-[11.5px] border border-dashed border-[#E5E7EB] mt-2">
                      Empty stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] transition-colors group space-y-2"
                      >
                        {/* Type & Owner */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/60">
                          <span className="uppercase font-semibold text-[#12151C]">
                            {lead.type}
                          </span>
                          <span>{lead.assigned_to}</span>
                        </div>

                        {/* Business Name */}
                        <div
                          onClick={() => handleOpenLead(lead.id)}
                          className="cursor-pointer"
                        >
                          <h4 className="text-[13.5px] font-bold text-[#12151C] group-hover:text-[#3B82F6] transition-colors">
                            {lead.business_name}
                          </h4>
                          <div className="text-[11.5px] text-[#12151C]/70 mt-0.5">
                            {lead.contact_name} {lead.city && `• ${lead.city}`}
                          </div>
                        </div>

                        {/* Angle */}
                        {lead.angle && (
                          <div className="text-[11px] text-[#12151C]/70 italic line-clamp-2">
                            &ldquo;{lead.angle}&rdquo;
                          </div>
                        )}

                        {/* Next Action */}
                        {lead.next_action ? (
                          <div className="text-[11.5px] text-[#12151C] font-medium pt-1 border-t border-[#E5E7EB] flex items-center justify-between gap-1">
                            <div className="truncate flex items-center gap-1">
                              <span className="text-[#3B82F6]">→</span>
                              <span className="truncate">{lead.next_action}</span>
                            </div>
                            {lead.next_action_due && (
                              <span className="text-[10px] font-mono text-[#12151C]/50 shrink-0">
                                {lead.next_action_due}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10.5px] font-mono text-[#12151C]/40 italic pt-1 border-t border-[#E5E7EB]">
                            No next action scheduled
                          </div>
                        )}

                        {/* Value & 1-Click Stage Advance */}
                        <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
                          <span className="text-[12px] font-mono font-bold text-[#12151C]">
                            {lead.value ? `₹${lead.value.toLocaleString()}` : '—'}
                          </span>

                          {!isWon && !isLost && (
                            <button
                              type="button"
                              onClick={() => advanceStage(lead.id)}
                              className="px-2.5 py-1 bg-[#12151C] hover:bg-[#3B82F6] text-white text-[11px] font-medium transition-colors flex items-center gap-1"
                              title="Advance to next stage"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {isWon && (
                            <span className="text-[10px] font-mono uppercase font-bold text-[#12151C] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#3B82F6]" />
                              <span>Closed Won</span>
                            </span>
                          )}

                          {isLost && (
                            <span className="text-[10px] font-mono uppercase text-[#12151C]/50">
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
