'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import {
  ArrowRight,
  Phone,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export function FounderOverview() {
  const {
    leads,
    opportunities,
    followUps,
    activities,
    setSelectedLeadId,
    setCurrentView
  } = useCRM();

  const nowMs = Date.now();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const todayEndMs = todayEnd.getTime();

  // Top-level "TODAY" metrics
  const newLeadsToday = leads.filter(
    (l) => l.status === 'New' || l.status === 'To Call'
  ).length;

  const followUpsDueToday = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at).getTime() <= todayEndMs
  ).length;

  const overdueFollowUps = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at).getTime() < nowMs
  ).length;

  const activeOpportunities = opportunities.filter(
    (o) => o.stage !== 'Won' && o.stage !== 'Lost'
  );

  const proposalsAwaiting = opportunities.filter(
    (o) => o.stage === 'Proposal' || o.stage === 'Negotiation'
  ).length;

  // Pipeline stage breakdown
  const stages = [
    { key: 'New', label: 'New', count: opportunities.filter(o => o.stage === 'New').length },
    { key: 'Qualified', label: 'Qualified', count: opportunities.filter(o => o.stage === 'Qualified').length },
    { key: 'Discovery', label: 'Discovery', count: opportunities.filter(o => o.stage === 'Discovery').length },
    { key: 'Proposal', label: 'Proposal', count: opportunities.filter(o => o.stage === 'Proposal').length },
    { key: 'Negotiation', label: 'Negotiation', count: opportunities.filter(o => o.stage === 'Negotiation').length },
    { key: 'Won', label: 'Won', count: opportunities.filter(o => o.stage === 'Won').length }
  ];

  const totalPipelineValue = activeOpportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0);

  // Urgent attention items (Founder opportunities needing action)
  const attentionItems = opportunities
    .filter((o) => o.stage !== 'Won' && o.stage !== 'Lost')
    .slice(0, 5)
    .map((opp) => {
      const lead = leads.find((l) => l.id === opp.lead_id);
      return {
        id: opp.id,
        leadId: opp.lead_id,
        businessName: lead?.business_name || 'Opportunity Deal',
        contact: lead?.contact_name || '',
        phone: lead?.phone || '',
        stage: opp.stage,
        value: opp.estimated_value,
        nextAction: opp.next_action || 'Review and progress deal'
      };
    });

  // Recent activity stream
  const recentActivities = activities.slice(0, 5);

  // Upcoming scheduled actions
  const upcomingFollowUps = followUps
    .filter((f) => f.status === 'pending' && new Date(f.due_at).getTime() > todayEndMs)
    .slice(0, 4);

  const handleOpenLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('leads');
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20 space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-[#E5E7EB] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="section-label">STUDIO COMMAND CENTER</span>
            <h1 className="page-title mt-1">Overview</h1>
          </div>
          <div className="text-[12px] font-mono text-[#6B7280]">
            Quniverze Operating System
          </div>
        </div>

        {/* 1. TODAY COMMAND STRIP (Action-Oriented Topline) */}
        <div>
          <div className="section-label mb-2.5">TODAY</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* New Leads */}
            <div
              onClick={() => setCurrentView('leads')}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
            >
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                New Leads
              </div>
              <div className="text-[26px] font-bold text-[#12151C] mt-1 font-mono">
                {newLeadsToday}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                To research / call
              </div>
            </div>

            {/* Follow-ups Due */}
            <div
              onClick={() => setCurrentView('followups')}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
            >
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                Follow-ups Due
              </div>
              <div className="text-[26px] font-bold text-[#12151C] mt-1 font-mono flex items-baseline gap-1.5">
                <span>{followUpsDueToday}</span>
                {overdueFollowUps > 0 && (
                  <span className="text-[12px] font-bold text-[#12151C] bg-[#E5E7EB] px-1.5 py-0.5 rounded">
                    {overdueFollowUps} overdue
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Action required today
              </div>
            </div>

            {/* Calls / Actions */}
            <div
              onClick={() => setCurrentView('followups')}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
            >
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                Calls Scheduled
              </div>
              <div className="text-[26px] font-bold text-[#12151C] mt-1 font-mono">
                {followUpsDueToday}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Scheduled client touches
              </div>
            </div>

            {/* Active Opportunities */}
            <div
              onClick={() => setCurrentView('opportunities')}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
            >
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                Active Deals
              </div>
              <div className="text-[26px] font-bold text-[#12151C] mt-1 font-mono">
                {activeOpportunities.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                ₹{totalPipelineValue.toLocaleString()} in pipeline
              </div>
            </div>

            {/* Proposals Pending */}
            <div
              onClick={() => setCurrentView('opportunities')}
              className="p-3.5 bg-white border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
            >
              <div className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                Proposals
              </div>
              <div className="text-[26px] font-bold text-[#12151C] mt-1 font-mono">
                {proposalsAwaiting}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">
                Awaiting response
              </div>
            </div>
          </div>
        </div>

        {/* 2. PIPELINE SUMMARY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-label">PIPELINE VELOCITY</span>
            <button
              onClick={() => setCurrentView('opportunities')}
              className="text-[12px] font-medium text-[#4B5563] hover:text-[#12151C] flex items-center gap-1"
            >
              <span>View full pipeline</span>
              <ArrowRight className="w-3 h-3 text-[#3B82F6]" />
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {stages.map((st) => (
                <div
                  key={st.key}
                  onClick={() => setCurrentView('opportunities')}
                  className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded cursor-pointer hover:border-[#12151C] transition-colors"
                >
                  <div className="text-[10.5px] font-medium text-[#6B7280] uppercase tracking-wider">
                    {st.label}
                  </div>
                  <div className="text-[18px] font-bold text-[#12151C] font-mono mt-0.5">
                    {st.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. NEEDS YOUR ATTENTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="section-label">NEEDS ATTENTION</span>
              <span className="text-[11px] font-mono text-[#6B7280]">
                ({attentionItems.length})
              </span>
            </div>
            <span className="text-[11.5px] text-[#6B7280]">
              Active deals requiring immediate execution
            </span>
          </div>

          {attentionItems.length === 0 ? (
            <div className="p-8 bg-white border border-[#E5E7EB] rounded text-center text-[#6B7280] text-[13px]">
              No active deals requiring urgent attention. All follow-ups are on schedule.
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F6F9] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleOpenLead(item.leadId)}
                        className="text-[14px] font-semibold text-[#12151C] hover:underline text-left"
                      >
                        {item.businessName}
                      </button>
                      <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#F4F6F9] text-[#12151C] border border-[#E5E7EB]">
                        {item.stage}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#4B5563]">
                      Next action: <span className="font-medium text-[#12151C]">{item.nextAction}</span>
                      {item.contact && ` · Contact: ${item.contact}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[#12151C] font-mono">
                        ₹{(item.value || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">
                        Est. Value
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenLead(item.leadId)}
                      className="px-3 py-1.5 rounded text-[11.5px] font-medium bg-[#12151C] text-white hover:bg-black transition-colors"
                    >
                      Open Record
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. TWO COLUMN: RECENT ACTIVITY & UPCOMING ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-label">RECENT ACTIVITY</span>
              <button
                onClick={() => setCurrentView('activity')}
                className="text-[11.5px] font-medium text-[#4B5563] hover:text-[#12151C]"
              >
                View all
              </button>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {recentActivities.length === 0 ? (
                <div className="p-6 text-center text-[#6B7280] text-[12.5px]">
                  No recent CRM events recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="p-3 text-[12.5px] space-y-0.5">
                    <div className="text-[#12151C] font-medium leading-snug">
                      {act.body}
                    </div>
                    <div className="text-[11px] text-[#6B7280] font-mono">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-label">UPCOMING ACTIONS</span>
              <button
                onClick={() => setCurrentView('followups')}
                className="text-[11.5px] font-medium text-[#4B5563] hover:text-[#12151C]"
              >
                View agenda
              </button>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
              {upcomingFollowUps.length === 0 ? (
                <div className="p-6 text-center text-[#6B7280] text-[12.5px]">
                  No upcoming actions scheduled past today.
                </div>
              ) : (
                upcomingFollowUps.map((fu) => {
                  const lead = leads.find((l) => l.id === fu.lead_id);
                  return (
                    <div key={fu.id} className="p-3 text-[12.5px] flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#12151C]">
                          {lead?.business_name || 'Scheduled Touchpoint'}
                        </div>
                        <div className="text-[11.5px] text-[#4B5563]">
                          {fu.action}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[11px] font-mono text-[#12151C] font-medium">
                          {new Date(fu.due_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {fu.assigned_to === 'usr_founder' ? 'Founder' : 'Outreach'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
