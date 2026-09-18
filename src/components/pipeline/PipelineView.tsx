'use client';

import React, { useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { OpportunityStage } from '@/types/crm';
import {
  Briefcase,
  ArrowRight,
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
    'Qualified',
    'Meeting',
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
  }, [opportunities, stages]);

  const getNextStage = (current: OpportunityStage): OpportunityStage | null => {
    const order: OpportunityStage[] = [
      'Qualified',
      'Meeting',
      'Proposal',
      'Negotiation',
      'Won'
    ];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden p-4 md:p-6">
      
      {/* PIPELINE HEADER */}
      <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-4 mb-5 flex-shrink-0">
        <div>
          <span className="section-label">DEALS &amp; OPPORTUNITIES</span>
          <h1 className="page-title mt-1">Pipeline</h1>
        </div>

        <div className="flex items-center gap-4 text-[13px] text-[#6B6B6B]">
          <span>
            Active Pipeline:{' '}
            <strong className="text-[#111111]">
              ₹
              {opportunities
                .filter((o) => o.stage !== 'Won' && o.stage !== 'Lost')
                .reduce((s, o) => s + (o.estimated_value || 0), 0)
                .toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-[1200px]">
          {stageData.map(({ stage, opps, totalValue }) => {
            const isWon = stage === 'Won';
            const isLost = stage === 'Lost';

            return (
              <div
                key={stage}
                className="w-[280px] flex flex-col bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden flex-shrink-0"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#E5E5E5] bg-[#F7F7F5] flex items-baseline justify-between">
                  <div>
                    <span className="text-[12px] font-bold text-[#111111] uppercase tracking-wider">
                      {stage}
                    </span>
                    <span className="text-[11.5px] text-[#6B6B6B] ml-2">
                      ({opps.length})
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#111111]">
                    ₹{totalValue.toLocaleString()}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {opps.length === 0 ? (
                    <div className="py-8 text-center text-[#6B6B6B] text-[12px]">
                      No deals in this stage
                    </div>
                  ) : (
                    opps.map((opp) => {
                      const lead = leads.find((l) => l.id === opp.lead_id);
                      const nextStage = getNextStage(opp.stage);

                      return (
                        <div
                          key={opp.id}
                          className="p-3.5 bg-white border border-[#E5E5E5] hover:border-[#111111] rounded-md shadow-xs transition-all space-y-2.5"
                        >
                          {/* Business Name & Value */}
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => {
                                setSelectedLeadId(opp.lead_id);
                                setCurrentView('leads');
                              }}
                              className="font-bold text-[14.5px] text-[#111111] hover:underline text-left leading-snug"
                            >
                              {lead?.business_name || 'Opportunity'}
                            </button>
                            <span className="text-[14px] font-bold text-[#111111] whitespace-nowrap">
                              ₹{opp.estimated_value.toLocaleString()}
                            </span>
                          </div>

                          {/* Contact & Industry */}
                          <div className="text-[12px] text-[#6B6B6B]">
                            {lead?.contact_name || 'Decision Maker'}
                            {lead?.phone && ` · ${lead.phone}`}
                          </div>

                          {/* Next Action */}
                          {opp.next_action && (
                            <div className="p-2 bg-[#F7F7F5] rounded text-[11.5px] text-[#111111] font-medium leading-tight">
                              <span className="text-[#6B6B6B] block text-[10px] uppercase tracking-wider font-semibold">
                                Next Action
                              </span>
                              {opp.next_action}
                            </div>
                          )}

                          {/* Owner */}
                          <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] pt-1 border-t border-[#EEEEEC]">
                            <span>
                              Owner: {opp.assigned_to === 'usr_founder' ? 'Founder' : 'Outreach'}
                            </span>

                            {/* Stage progression shortcuts */}
                            <div className="flex items-center gap-1">
                              {!isWon && !isLost && nextStage && (
                                <button
                                  onClick={() => moveOpportunityStage(opp.id, nextStage)}
                                  className="px-2 py-1 text-[10.5px] font-semibold text-[#111111] bg-[#EEEEEC] hover:bg-[#111111] hover:text-white rounded transition-colors"
                                  title={`Advance to ${nextStage}`}
                                >
                                  {nextStage} →
                                </button>
                              )}

                              {!isWon && !isLost && opp.stage === 'Negotiation' && (
                                <button
                                  onClick={() => moveOpportunityStage(opp.id, 'Won')}
                                  className="px-2 py-1 text-[10.5px] font-bold text-white bg-[#16803C] hover:bg-[#126830] rounded transition-colors"
                                >
                                  Close Won ✓
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
