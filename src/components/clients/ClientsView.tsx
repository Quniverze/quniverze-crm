'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import {
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  FileText,
  Clock
} from 'lucide-react';

export function ClientsView() {
  const { clients, activities, leads } = useCRM();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id || null
  );

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Activities for this client or its originating lead
  const clientActivities = activities.filter(
    (a) =>
      a.client_id === activeClient?.id ||
      (activeClient?.lead_id && a.lead_id === activeClient.lead_id)
  );

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden">
      
      {/* CLIENTS LIST */}
      <div className="w-full md:w-[380px] h-full border-r border-[#E5E5E5] bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#E5E5E5]">
          <span className="section-label">ACTIVE ACCOUNTS</span>
          <h1 className="text-[22px] font-bold text-[#111111] tracking-tight mt-0.5">
            Clients ({clients.length})
          </h1>
          <p className="text-[12px] text-[#6B6B6B] mt-0.5">
            Converted won accounts preserving handoff context &amp; history.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5]">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-[#6B6B6B] text-[13px]">
              No clients yet. When an opportunity is marked as Won in Pipeline, it automatically appears here.
            </div>
          ) : (
            clients.map((c) => {
              const isSelected = activeClient?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F4F4F1]' : 'hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[14.5px] text-[#111111]">
                      {c.business_name}
                    </span>
                    <span className="text-[12px] font-bold text-[#16803C]">
                      ₹{c.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#6B6B6B] mt-1">
                    {c.project} · {c.contact_name}
                  </div>
                  <div className="text-[11px] text-[#6B6B6B] mt-1 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#16803C]" />
                    <span className="uppercase font-semibold tracking-wider text-[10px] text-[#16803C]">
                      {c.status}
                    </span>
                    <span>· Closed {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CLIENT DETAIL PANE */}
      <div className="flex-1 h-full bg-[#F7F7F5] overflow-y-auto p-6 md:p-8">
        {activeClient ? (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="pb-5 border-b border-[#E5E5E5]">
              <span className="section-label">CLIENT RECORD</span>
              <h2 className="text-[26px] font-bold text-[#111111] tracking-tight mt-1">
                {activeClient.business_name}
              </h2>
              <div className="text-[14px] text-[#6B6B6B] mt-0.5">
                Primary Contact: {activeClient.contact_name}
              </div>
            </div>

            {/* Engagement Details */}
            <div className="p-5 bg-white border border-[#E5E5E5] rounded-lg space-y-3">
              <div className="section-label">ENGAGEMENT &amp; VALUE</div>
              
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Contracted Project</span>
                  <span className="font-semibold text-[#111111]">{activeClient.project}</span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Closed Contract Value</span>
                  <span className="text-[16px] font-bold text-[#16803C]">
                    ₹{activeClient.value.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Phone Number</span>
                  <span className="font-mono font-medium text-[#111111]">{activeClient.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Email</span>
                  <span className="text-[#111111]">{activeClient.email || '—'}</span>
                </div>
              </div>

              {activeClient.notes && (
                <div className="pt-3 border-t border-[#EEEEEC] text-[13px] text-[#111111] leading-relaxed">
                  <span className="text-[#6B6B6B] block text-[11px] font-semibold uppercase mb-0.5">
                    Handoff Notes
                  </span>
                  {activeClient.notes}
                </div>
              )}
            </div>

            {/* Complete Historical Activity Timeline */}
            <div className="space-y-3">
              <div className="section-label">ORIGINATING SALES TIMELINE</div>
              
              <div className="p-5 bg-white border border-[#E5E5E5] rounded-lg space-y-4">
                {clientActivities.length === 0 ? (
                  <div className="text-[13px] text-[#6B6B6B]">
                    No historical logs recorded.
                  </div>
                ) : (
                  clientActivities.map((act) => (
                    <div key={act.id} className="text-[13px] border-l-2 border-[#111111] pl-3 py-0.5">
                      <div className="text-[#111111] leading-relaxed">{act.body}</div>
                      <div className="text-[11px] text-[#6B6B6B] mt-0.5">
                        {new Date(act.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[#6B6B6B] text-[13.5px]">
            Select a client account to inspect contract details.
          </div>
        )}
      </div>

    </div>
  );
}
