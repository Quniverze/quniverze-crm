'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import {
  ArrowUpRight,
  Phone,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react';

export function FounderOverview() {
  const {
    leads,
    opportunities,
    followUps,
    setSelectedLeadId,
    setCurrentView
  } = useCRM();

  // Metrics
  const qualifiedCount = opportunities.filter((o) => o.stage === 'Qualified').length;
  const meetingCount = opportunities.filter((o) => o.stage === 'Meeting').length;
  const proposalCount = opportunities.filter((o) => o.stage === 'Proposal').length;
  const closingCount = opportunities.filter((o) => o.stage === 'Negotiation').length;

  // Delegated counts
  const outreachQueueCount = leads.filter(
    (l) => l.status === 'To Call' || l.status === 'New'
  ).length;
  const outreachFollowUpsCount = followUps.filter(
    (f) => f.assigned_to === 'usr_outreach' && f.status === 'pending'
  ).length;

  // Attention Items: Opportunities/Leads assigned to Founder needing action
  const attentionItems = [
    // 1. ABC Restaurant (Demo Scenario: Interested, founder call required, ₹35,000)
    ...opportunities
      .filter((o) => o.assigned_to === 'usr_founder' && o.stage !== 'Won' && o.stage !== 'Lost')
      .map((opp) => {
        const lead = leads.find((l) => l.id === opp.lead_id);
        const businessName = lead?.business_name || 'Opportunity';
        const contact = lead?.contact_name || '';
        const phone = lead?.phone || '';

        let urgencyLabel = 'Action required';
        let urgencyType: 'danger' | 'warning' | 'info' = 'warning';

        if (opp.stage === 'Negotiation') {
          urgencyLabel = 'Proposal negotiation in progress · Close terms';
          urgencyType = 'danger';
        } else if (opp.stage === 'Proposal') {
          urgencyLabel = 'Proposal delivered · Follow up on terms';
          urgencyType = 'warning';
        } else if (opp.stage === 'Meeting') {
          urgencyLabel = 'Meeting scheduled · Conduct discovery session';
          urgencyType = 'info';
        } else if (opp.stage === 'Qualified') {
          urgencyLabel = 'Interested prospect · Founder call required';
          urgencyType = 'danger';
        }

        return {
          id: opp.id,
          leadId: opp.lead_id,
          businessName,
          contact,
          phone,
          stage: opp.stage,
          value: opp.estimated_value,
          urgencyLabel,
          urgencyType,
          nextAction: opp.next_action || 'Founder review'
        };
      })
  ];

  const handleOpenLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('leads');
  };

  const handleOpenPipeline = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('pipeline');
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
      
      {/* HEADER */}
      <div className="border-b border-[#E5E5E5] pb-5 mb-8">
        <span className="section-label">SALES COMMAND CENTER</span>
        <h1 className="page-title mt-1">Founder Overview</h1>
        <p className="metadata-text mt-1">
          Direct operational view of deals, qualified meetings, proposals, and pipeline velocity.
        </p>
      </div>

      {/* METRIC ROW (Large metrics: 40-56px, tabular nums) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-5 bg-white border border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#111111] transition-colors"
        >
          <div className="big-metric">{qualifiedCount}</div>
          <div className="text-[11.5px] font-bold tracking-wider text-[#6B6B6B] uppercase mt-2">
            QUALIFIED
          </div>
        </div>

        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-5 bg-white border border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#111111] transition-colors"
        >
          <div className="big-metric">{meetingCount}</div>
          <div className="text-[11.5px] font-bold tracking-wider text-[#6B6B6B] uppercase mt-2">
            MEETINGS
          </div>
        </div>

        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-5 bg-white border border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#111111] transition-colors"
        >
          <div className="big-metric">{proposalCount}</div>
          <div className="text-[11.5px] font-bold tracking-wider text-[#6B6B6B] uppercase mt-2">
            PROPOSALS
          </div>
        </div>

        <div
          onClick={() => setCurrentView('pipeline')}
          className="p-5 bg-white border border-[#E5E5E5] rounded-lg cursor-pointer hover:border-[#111111] transition-colors"
        >
          <div className="big-metric">{closingCount}</div>
          <div className="text-[11.5px] font-bold tracking-wider text-[#6B6B6B] uppercase mt-2">
            CLOSING
          </div>
        </div>
      </div>

      {/* SECTION: NEEDS YOUR ATTENTION */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-label text-[#111111]">
            NEEDS YOUR ATTENTION ({attentionItems.length})
          </div>
          <span className="text-[12px] text-[#6B6B6B]">
            Action items requiring Founder decision
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-8 bg-white border border-[#E5E5E5] rounded-lg text-center text-[#6B6B6B] text-[13.5px]">
            No urgent founder deals pending attention right now.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E5] bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-[#FAFAF8] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenPipeline(item.leadId)}
                      className="lead-name hover:underline text-left"
                    >
                      {item.businessName}
                    </button>
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded bg-[#EEEEEC] text-[#111111]">
                      {item.stage}
                    </span>
                  </div>

                  <div className="text-[13px] text-[#111111] font-medium flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.urgencyType === 'danger'
                          ? 'bg-[#C62828]'
                          : item.urgencyType === 'warning'
                          ? 'bg-[#B7791F]'
                          : 'bg-[#111111]'
                      }`}
                    />
                    <span>{item.urgencyLabel}</span>
                  </div>

                  <div className="text-[12px] text-[#6B6B6B]">
                    {item.contact && `Contact: ${item.contact} · `}
                    Next Action: {item.nextAction}
                  </div>
                </div>

                {/* Value & Direct Action */}
                <div className="flex items-center gap-4 self-end sm:self-center flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[16px] font-bold text-[#111111]">
                      ₹{item.value.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[#6B6B6B]">Deal Value</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="p-2 border border-[#E5E5E5] rounded hover:border-[#111111] text-[#111111] hover:bg-[#F7F7F5]"
                        title="Call Prospect"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenPipeline(item.leadId)}
                      className="px-3 py-2 text-[12.5px] font-medium text-white bg-[#111111] hover:bg-black rounded transition-colors"
                    >
                      Review Deal →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: DELEGATED WORK */}
      <div className="space-y-3">
        <div className="section-label text-[#6B6B6B]">DELEGATED TO OUTREACH</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setCurrentView('queue')}
            className="p-5 bg-white border border-[#E5E5E5] rounded-lg hover:border-[#111111] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="text-[28px] font-bold text-[#111111]">
                {outreachQueueCount}
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#6B6B6B]" />
            </div>
            <div className="text-[13.5px] font-medium text-[#111111] mt-1">
              Leads waiting for outreach
            </div>
            <div className="text-[12px] text-[#6B6B6B] mt-0.5">
              Assigned to Adil (Outreach Executive) to research &amp; call.
            </div>
          </div>

          <div
            onClick={() => setCurrentView('leads')}
            className="p-5 bg-white border border-[#E5E5E5] rounded-lg hover:border-[#111111] cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="text-[28px] font-bold text-[#111111]">
                {outreachFollowUpsCount}
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#6B6B6B]" />
            </div>
            <div className="text-[13.5px] font-medium text-[#111111] mt-1">
              Scheduled outreach follow-ups
            </div>
            <div className="text-[12px] text-[#6B6B6B] mt-0.5">
              Pending callbacks and WhatsApp inquiries managed by Outreach.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
