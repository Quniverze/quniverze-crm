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
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header & Filter Controls */}
      <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
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

                        {/* Value & 1-Click Stage Advance */}
                        <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                          <span className="text-[12.5px] font-mono font-bold text-[#111827]">
                            {lead.value ? `₹${lead.value.toLocaleString()}` : '—'}
                          </span>

                          {!isWon && !isLost && (
                            <button
                              type="button"
                              onClick={() => advanceStage(lead.id)}
                              className="px-3 py-1 bg-[#1A5336] hover:bg-[#14422B] text-white text-[11px] font-medium rounded-full transition-colors flex items-center gap-1"
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
