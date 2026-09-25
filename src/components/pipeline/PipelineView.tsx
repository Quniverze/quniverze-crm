'use client';

import React, { useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { OpportunityStage } from '@/types/crm';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  Plus
} from 'lucide-react';

export function PipelineView() {
  const {
    leads,
    opportunities,
    moveOpportunityStage,
    setSelectedLeadId,
    setCurrentView
  } = useCRM();

  const stages: OpportunityStage[] = [
    'New',
    'Qualified',
    'Discovery',
    'Proposal',
    'Negotiation',
    'Won',
    'Lost'
  ];

  // Group opportunities by stage
  const stageData = useMemo(() => {
    return stages.map((stage) => {
      const opps = opportunities.filter((o) => o.stage === stage);
      const totalValue = opps.reduce((sum, o) => sum + (o.estimated_value || 0), 0);
      return {
        stage,
        opps,
        totalValue
      };
    });
  }, [opportunities]);

  const getNextStage = (current: OpportunityStage): OpportunityStage | null => {
    const progression: OpportunityStage[] = [
      'New',
      'Qualified',
      'Discovery',
      'Proposal',
      'Negotiation',
      'Won'
    ];
    const idx = progression.indexOf(current);
    if (idx >= 0 && idx < progression.length - 1) {
      return progression[idx + 1];
    }
    return null;
  };

  const getPrevStage = (current: OpportunityStage): OpportunityStage | null => {
    const progression: OpportunityStage[] = [
      'New',
      'Qualified',
      'Discovery',
      'Proposal',
      'Negotiation',
      'Won'
    ];
    const idx = progression.indexOf(current);
    if (idx > 0) {
      return progression[idx - 1];
    }
    return null;
  };

  const activePipelineValue = opportunities
    .filter((o) => o.stage !== 'Won' && o.stage !== 'Lost')
    .reduce((s, o) => s + (o.estimated_value || 0), 0);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden p-4 md:p-6 bg-[#F4F6F9]">
      
      {/* PIPELINE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[#E5E7EB] pb-4 mb-4 flex-shrink-0 gap-2">
        <div>
          <span className="section-label">STUDIO PIPELINE</span>
          <h1 className="page-title mt-0.5">Opportunities</h1>
        </div>

        <div className="flex items-center gap-4 text-[12.5px] text-[#4B5563]">
          <div>
            Active Pipeline:{' '}
            <strong className="text-[#12151C] font-mono">
              ₹{activePipelineValue.toLocaleString()}
            </strong>
          </div>
          <div>
            Won Value:{' '}
            <strong className="text-[#12151C] font-mono">
              ₹
              {opportunities
                .filter((o) => o.stage === 'Won')
                .reduce((s, o) => s + (o.estimated_value || 0), 0)
                .toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* RESTRAINED KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 h-full min-w-[1300px]">
          {stageData.map(({ stage, opps, totalValue }) => {
            const isWon = stage === 'Won';
            const isLost = stage === 'Lost';

            return (
              <div
                key={stage}
                className="w-[260px] flex flex-col bg-white border border-[#E5E7EB] rounded overflow-hidden flex-shrink-0"
              >
                {/* Stage Header */}
                <div className="p-3 border-b border-[#E5E7EB] bg-[#F4F6F9] flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11.5px] font-bold text-[#12151C] uppercase tracking-wider">
                      {stage}
                    </span>
                    <span className="text-[11px] font-mono text-[#6B7280]">
                      ({opps.length})
                    </span>
                  </div>
                  <span className="text-[11.5px] font-mono font-medium text-[#12151C]">
                    ₹{totalValue.toLocaleString()}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                  {opps.length === 0 ? (
                    <div className="py-12 text-center text-[#6B7280] text-[11.5px]">
                      No deals
                    </div>
                  ) : (
                    opps.map((opp) => {
                      const lead = leads.find((l) => l.id === opp.lead_id);
                      const nextStage = getNextStage(opp.stage);
                      const prevStage = getPrevStage(opp.stage);

                      return (
                        <div
                          key={opp.id}
                          className="p-3 bg-white border border-[#E5E7EB] hover:border-[#12151C] rounded transition-all space-y-2"
                        >
                          {/* Company & Deal Value */}
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedLeadId(opp.lead_id);
                                setCurrentView('leads');
                              }}
                              className="font-bold text-[13.5px] text-[#12151C] hover:underline text-left leading-tight"
                            >
                              {lead?.business_name || 'Opportunity'}
                            </button>
                            <span className="text-[13px] font-bold text-[#12151C] font-mono whitespace-nowrap">
                              ₹{(opp.estimated_value || 0).toLocaleString()}
                            </span>
                          </div>

                          {/* Contact & Industry */}
                          <div className="text-[11.5px] text-[#6B7280]">
                            {lead?.contact_name ? `${lead.contact_name} · ` : ''}{lead?.industry}
                          </div>

                          {/* Next Action Box */}
                          <div className="p-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[11.5px] space-y-0.5">
                            <span className="text-[9.5px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                              NEXT ACTION
                            </span>
                            <span className="text-[#12151C] font-medium line-clamp-2">
                              {opp.next_action || 'Founder review & follow-up'}
                            </span>
                          </div>

                          {/* Last updated & Stage Advancement */}
                          <div className="pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between text-[11px]">
                            <span className="font-mono text-[#6B7280]">
                              {new Date(opp.updated_at || opp.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>

                            <div className="flex items-center gap-1">
                              {prevStage && (
                                <button
                                  type="button"
                                  onClick={() => moveOpportunityStage(opp.id, prevStage)}
                                  title={`Move back to ${prevStage}`}
                                  className="p-1 text-[#6B7280] hover:text-[#12151C] border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                </button>
                              )}

                              {nextStage && (
                                <button
                                  type="button"
                                  onClick={() => moveOpportunityStage(opp.id, nextStage)}
                                  className="px-2 py-0.5 bg-[#12151C] hover:bg-black text-white rounded text-[10.5px] font-medium transition-colors flex items-center gap-1"
                                >
                                  <span>{nextStage}</span>
                                  <ArrowRight className="w-2.5 h-2.5 text-[#3B82F6]" />
                                </button>
                              )}

                              {opp.stage === 'Negotiation' && (
                                <button
                                  type="button"
                                  onClick={() => moveOpportunityStage(opp.id, 'Won')}
                                  className="px-2 py-0.5 bg-[#12151C] hover:bg-black text-white rounded text-[10.5px] font-medium transition-colors"
                                >
                                  Won Deal
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
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
