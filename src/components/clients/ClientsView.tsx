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
    <div className="space-y-6 pt-2 max-w-5xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Accounts &amp; Clients
          </h1>
          <p className="text-[13.5px] text-[#6B7280] mt-0.5">
            Won opportunities converted to active customer accounts. Total booked value: <span className="font-mono font-bold text-[#1A5336]">₹{totalContractValue.toLocaleString()}</span>
          </p>
        </div>

        {/* Type Filter */}
        <div className="inline-flex p-1 bg-white border border-[#EAECEF] rounded-full shadow-xs">
          {(['All', 'Product', 'Client Work'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                typeFilter === t
                  ? 'bg-[#1A5336] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'Product' ? 'Product' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#EAECEF] rounded-[22px] shadow-xs">
          <Briefcase className="w-10 h-10 text-[#1A5336]/40 mx-auto mb-3" />
          <h3 className="text-[16px] font-bold text-[#111827]">No active clients yet</h3>
          <p className="text-[13px] text-gray-500 mt-1 max-w-sm mx-auto">
            Leads moved to the <span className="font-bold text-[#1A5336]">Won</span> stage in the Pipeline automatically convert into customer records here.
          </p>
          <button
            onClick={() => setCurrentView('pipeline')}
            className="mt-4 btn-pill-primary inline-flex items-center gap-1.5"
          >
            <span>Go to Pipeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-5 bg-white border border-[#EAECEF] rounded-[20px] shadow-xs hover:border-[#1A5336] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2.5 py-0.5 rounded-full font-bold">
                    {client.type}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#111827]">
                    {client.business_name}
                  </h3>
                  <span className="text-[11.5px] font-mono text-gray-400">
                    Won on {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>

                {editingNotesId === client.id ? (
                  <div className="flex items-center gap-2 max-w-lg mt-1">
                    <input
                      type="text"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Onboarding or contract notes..."
                      className="flex-1 px-3 py-1.5 text-[12.5px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveNotes(client.id)}
                      className="px-3.5 py-1.5 bg-[#1A5336] text-white text-[11px] font-medium rounded-full hover:bg-[#14422B]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNotesId(null)}
                      className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[12.5px] text-gray-600">
                    <span className="italic">
                      {client.notes || 'No onboarding notes recorded.'}
                    </span>
                    <button
                      onClick={() => handleStartEditNotes(client.id, client.notes)}
                      className="text-[11px] font-mono text-[#1A5336] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Status and Value */}
              <div className="flex items-center gap-5 self-end md:self-center shrink-0">
                <div className="text-right">
                  <span className="text-[10.5px] font-mono text-gray-400 uppercase block">
                    Booked Value
                  </span>
                  <span className="text-[16px] font-mono font-bold text-[#111827]">
                    {client.contract_value ? `₹${client.contract_value.toLocaleString()}` : '—'}
                  </span>
                </div>

                {/* Delivery Status Dropdown */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-mono text-gray-400 uppercase block">
                    Delivery Status
                  </span>
                  <select
                    value={client.delivery_status}
                    onChange={(e) =>
                      updateClient(client.id, {
                        delivery_status: e.target.value as DeliveryStatus
                      })
                    }
                    className="px-3 py-1.5 text-[12px] font-medium bg-[#F8F9FA] border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#1A5336]"
                  >
                    {deliveryStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
