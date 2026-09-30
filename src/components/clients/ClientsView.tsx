'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { DeliveryStatus, LeadType } from '@/types/crm';
import { CheckCircle2, Briefcase, Calendar, Edit2, ArrowRight } from 'lucide-react';

export function ClientsView() {
  const { clients, updateClient, setCurrentView } = useCRM();
  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const filteredClients = clients.filter((c) => {
    if (typeFilter === 'All') return true;
    return c.type === typeFilter;
  });

  const totalContractValue = filteredClients.reduce(
    (sum, c) => sum + (c.contract_value || 0),
    0
  );

  const deliveryStatuses: DeliveryStatus[] = [
    'Not Started',
    'In Progress',
    'Delivered',
    'Active'
  ];

  const handleStartEditNotes = (id: string, currentNotes: string) => {
    setEditingNotesId(id);
    setNotesInput(currentNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateClient(id, { notes: notesInput.trim() });
    setEditingNotesId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-4">
      {/* 1. Header Tile */}
      <div className="rounded-lg bg-white border border-[#E5E7EB] p-4 md:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-[#12151C] tracking-tight">
              Customer Accounts
            </h1>
            <span className="text-[#E5E7EB]">/</span>
            <span className="text-[12px] font-mono text-[#12151C]/60">
              Total: <strong className="text-[#12151C]">₹{totalContractValue.toLocaleString()}</strong>
            </span>
          </div>
          <p className="text-[12.5px] text-[#12151C]/50 mt-0.5">
            Won opportunities converted to active customer accounts.
          </p>
        </div>

        {/* Uniform Controls (Height: 32px / h-8) */}
        <div className="inline-flex h-8 p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-md items-center self-start sm:self-auto">
          {(['All', 'Product', 'Client Work'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-7 px-2.5 text-[12px] font-medium rounded flex items-center justify-center transition-colors ${
                typeFilter === t
                  ? 'bg-[#12151C] text-white shadow-xs'
                  : 'text-[#12151C]/70 hover:text-[#12151C]'
              }`}
            >
              {t === 'Product' ? 'Product' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Clients List */}
      {filteredClients.length === 0 ? (
        <div className="rounded-lg bg-white border border-[#E5E7EB] p-12 text-center">
          <Briefcase className="w-9 h-9 text-[#12151C]/20 mx-auto mb-2" />
          <h3 className="text-[14px] font-semibold text-[#12151C]">No active clients yet</h3>
          <p className="text-[12px] text-[#12151C]/60 mt-0.5 max-w-sm mx-auto">
            Leads moved to the <span className="font-semibold text-[#12151C]">Won</span> stage in the Pipeline automatically convert into customer records here.
          </p>
          <button
            onClick={() => setCurrentView('pipeline')}
            className="mt-4 h-8 px-4 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors rounded-md inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>Go to Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="rounded-lg bg-white border border-[#E5E7EB] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#12151C]/40 transition-all shadow-2xs"
            >
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9.5px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5 rounded">
                    {client.type}
                  </span>
                  <h3 className="text-[15px] font-semibold text-[#12151C]">
                    {client.business_name}
                  </h3>
                  <span className="text-[11px] font-mono text-[#12151C]/50">
                    Won on {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>

                {editingNotesId === client.id ? (
                  <div className="flex items-center gap-2 max-w-md mt-1">
                    <input
                      type="text"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Onboarding or delivery notes..."
                      className="flex-1 h-8 px-2.5 text-[12px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveNotes(client.id)}
                      className="h-8 px-3 bg-[#12151C] text-white text-[11px] font-medium rounded-md hover:bg-[#3B82F6]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="h-8 px-2.5 text-[11px] text-[#12151C]/60 hover:text-[#12151C] rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[12px] text-[#12151C]/75">
                    <span className="italic">
                      {client.notes || 'No onboarding notes recorded.'}
                    </span>
                    <button
                      onClick={() => handleStartEditNotes(client.id, client.notes)}
                      className="text-[11px] text-[#3B82F6] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Status and Value */}
              <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#12151C]/40 uppercase block">
                    Booked Value
                  </span>
                  <span className="text-[14.5px] font-mono font-semibold text-[#12151C]">
                    {client.contract_value ? `₹${client.contract_value.toLocaleString()}` : '—'}
                  </span>
                </div>

                {/* Delivery Status Dropdown - Uniform 32px (h-8) */}
                <select
                  value={client.delivery_status}
                  onChange={(e) =>
                    updateClient(client.id, {
                      delivery_status: e.target.value as DeliveryStatus
                    })
                  }
                  className="h-8 px-2.5 text-[11.5px] font-mono font-medium bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] rounded-md focus:outline-none focus:border-[#3B82F6]"
                >
                  {deliveryStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
