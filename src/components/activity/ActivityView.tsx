'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { ActivityType } from '@/types/crm';
import {
  Activity as ActivityIcon,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle2,
  Filter,
  Search
} from 'lucide-react';

export function ActivityView() {
  const { activities, leads, setSelectedLeadId, setCurrentView } = useCRM();
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (filterType !== 'All' && act.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return act.body.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activities, filterType, searchQuery]);

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F4F6F9]">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="section-label">OPERATIONS</span>
            <h1 className="page-title mt-0.5">Activity Stream</h1>
          </div>
          <div className="text-[12px] font-mono text-[#6B7280]">
            {activities.length} total events recorded
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded text-[12px] text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="flex items-center gap-1 text-[11.5px]">
            {['All', 'called', 'outcome', 'note', 'stage_changed', 'converted'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded border transition-colors capitalize ${
                  filterType === t
                    ? 'bg-[#12151C] text-white border-[#12151C] font-semibold'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#12151C]'
                }`}
              >
                {t === 'called' ? 'Calls' : t === 'stage_changed' ? 'Stages' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Stream Container */}
        <div className="bg-white border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB]">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] text-[13px]">
              No activity logs match the selected filter.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const lead = act.lead_id ? leads.find((l) => l.id === act.lead_id) : null;
              return (
                <div key={act.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[#F4F6F9] transition-colors">
                  <div className="space-y-1">
                    <div className="text-[13px] text-[#12151C] font-medium leading-snug">
                      {act.body}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
                      <span className="uppercase font-semibold tracking-wider px-1.5 py-0.2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C] font-mono text-[9.5px]">
                        {act.type}
                      </span>
                      {lead && (
                        <button
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setCurrentView('leads');
                          }}
                          className="font-medium text-[#12151C] hover:underline"
                        >
                          {lead.business_name}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono text-[11px] text-[#6B7280]">
                    <div>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div>{new Date(act.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
