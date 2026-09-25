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
  Clock,
  ExternalLink,
  FolderGit2
} from 'lucide-react';

export function ClientsView() {
  const { clients, activities, projects, setCurrentView } = useCRM();
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

  // Projects associated with this client
  const clientProjects = projects.filter(
    (p) => p.client_id === activeClient?.id || p.name.toLowerCase().includes(activeClient?.business_name.toLowerCase() || '')
  );

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#F4F6F9]">
      
      {/* CLIENTS LIST */}
      <div className="w-full md:w-[360px] h-full border-r border-[#E5E7EB] bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#E5E7EB]">
          <span className="section-label">RELATIONSHIPS</span>
          <h1 className="text-[18px] font-bold text-[#12151C] tracking-tight mt-0.5">
            Clients ({clients.length})
          </h1>
          <p className="text-[12px] text-[#6B6B6B] mt-0.5">
            Active studio partnerships and retainer accounts.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280] text-[12.5px]">
              No active clients yet. When an opportunity is closed Won, it automatically creates an established client account here.
            </div>
          ) : (
            clients.map((c) => {
              const isSelected = activeClient?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EBF3FE] font-medium border-l-2 border-[#3B82F6]'
                      : 'hover:bg-[#F4F6F9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13.5px] text-[#12151C]">
                      {c.business_name}
                    </span>
                    <span className="text-[12px] font-bold text-[#12151C] font-mono">
                      ₹{c.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#4B5563] mt-0.5 truncate">
                    {c.project}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-2">
                    <span className="uppercase font-semibold tracking-wider text-[10px] px-1.5 py-0.2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C]">
                      {c.status}
                    </span>
                    <span className="font-mono">
                      {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CLIENT DETAIL PANE */}
      <div className="flex-1 h-full bg-[#F4F6F9] overflow-y-auto p-4 md:p-8">
        {activeClient ? (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="p-5 bg-white border border-[#E5E7EB] rounded space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="section-label">CLIENT PROFILE</span>
                  <h2 className="text-[22px] font-bold text-[#12151C] tracking-tight mt-0.5">
                    {activeClient.business_name}
                  </h2>
                  <div className="text-[13px] text-[#6B7280] mt-0.5">
                    Primary Contact: <span className="text-[#12151C] font-medium">{activeClient.contact_name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[20px] font-bold text-[#12151C] font-mono">
                    ₹{activeClient.value.toLocaleString()}
                  </div>
                  <div className="text-[10.5px] text-[#6B7280] uppercase tracking-wider">
                    Contract Value
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                {activeClient.phone && (
                  <a
                    href={`tel:${activeClient.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12151C] hover:bg-black text-white text-[12px] font-medium rounded transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {activeClient.phone}</span>
                  </a>
                )}
                {activeClient.email && (
                  <a
                    href={`mailto:${activeClient.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C] bg-white text-[12px] font-medium rounded transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{activeClient.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Active Deliverable / Project Context */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="section-label">DELIVERABLES &amp; WORK SCOPE</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C]">
                  {activeClient.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[14px] font-semibold text-[#12151C]">
                {activeClient.project}
              </div>
              {activeClient.notes && (
                <p className="text-[12.5px] text-[#4B5563] leading-relaxed pt-2 border-t border-[#E5E7EB]">
                  {activeClient.notes}
                </p>
              )}
            </div>

            {/* Connected Projects */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="section-label">CONNECTED STUDIO PROJECTS</span>
                <button
                  onClick={() => setCurrentView('projects')}
                  className="text-[11.5px] font-medium text-[#4B5563] hover:text-[#12151C] flex items-center gap-1"
                >
                  <span>All Projects</span>
                  <ExternalLink className="w-3 h-3 text-[#3B82F6]" />
                </button>
              </div>

              {clientProjects.length === 0 ? (
                <div className="text-[12px] text-[#6B7280]">
                  Client work tracked under standard studio pipeline.
                </div>
              ) : (
                <div className="space-y-2">
                  {clientProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setCurrentView('projects')}
                      className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] rounded cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[13px] text-[#12151C]">{p.name}</div>
                        <div className="text-[11.5px] text-[#6B7280]">{p.tagline}</div>
                      </div>
                      <span className="text-[11px] font-mono text-[#6B7280]">{p.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historical Activity Stream */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-3">
              <span className="section-label">ACCOUNT HISTORY &amp; AUDIT TRAIL</span>
              <div className="divide-y divide-[#E5E7EB]">
                {clientActivities.length === 0 ? (
                  <div className="text-[12px] text-[#6B7280] py-2">
                    No historical logs recorded.
                  </div>
                ) : (
                  clientActivities.map((act) => (
                    <div key={act.id} className="py-2.5 text-[12.5px] space-y-0.5">
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

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[13px] text-[#6B7280]">
            Select a client account to inspect.
          </div>
        )}
      </div>

    </div>
  );
}
