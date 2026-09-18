'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '@/lib/store';
import { Search, X, Building, Phone, Briefcase, CheckCircle2 } from 'lucide-react';

export function GlobalSearchModal() {
  const {
    searchModalOpen,
    setSearchModalOpen,
    leads,
    opportunities,
    clients,
    setSelectedLeadId,
    setCurrentView
  } = useCRM();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  useEffect(() => {
    if (searchModalOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  if (!searchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingLeads = q
    ? leads.filter(
        (l) =>
          l.business_name.toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.industry.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      )
    : leads.slice(0, 5);

  const matchingOpps = q
    ? opportunities.filter((o) => {
        const lead = leads.find((l) => l.id === o.lead_id);
        return (
          lead?.business_name.toLowerCase().includes(q) ||
          o.stage.toLowerCase().includes(q) ||
          (o.next_action && o.next_action.toLowerCase().includes(q))
        );
      })
    : [];

  const matchingClients = q
    ? clients.filter(
        (c) =>
          c.business_name.toLowerCase().includes(q) ||
          c.contact_name.toLowerCase().includes(q) ||
          c.project.toLowerCase().includes(q)
      )
    : [];

  const selectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('leads');
    setSearchModalOpen(false);
  };

  const selectOpp = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentView('pipeline');
    setSearchModalOpen(false);
  };

  const selectClient = () => {
    setCurrentView('clients');
    setSearchModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#111111]/40 backdrop-blur-none p-4"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E5E5E5] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E5E5] gap-3">
          <Search className="w-5 h-5 text-[#6B6B6B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business, contact, phone, or opportunity..."
            className="flex-1 text-[15px] text-[#111111] placeholder-[#6B6B6B] bg-transparent outline-none"
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 text-[#6B6B6B] hover:text-[#111111] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {matchingLeads.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-[#6B6B6B] tracking-wider uppercase">
                Leads &amp; Contacts
              </div>
              <div className="space-y-1">
                {matchingLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => selectLead(lead.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F7F7F5] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Building className="w-4 h-4 text-[#6B6B6B] flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-[14px] text-[#111111] truncate">
                          {lead.business_name}
                        </div>
                        <div className="text-[12px] text-[#6B6B6B] truncate">
                          {lead.contact_name} · {lead.industry} · {lead.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EEEEEC] text-[#111111] flex-shrink-0">
                      {lead.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingOpps.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-[#6B6B6B] tracking-wider uppercase">
                Pipeline Opportunities
              </div>
              <div className="space-y-1">
                {matchingOpps.map((opp) => {
                  const lead = leads.find((l) => l.id === opp.lead_id);
                  return (
                    <button
                      key={opp.id}
                      onClick={() => selectOpp(opp.lead_id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F7F7F5] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Briefcase className="w-4 h-4 text-[#111111] flex-shrink-0" />
                        <div className="truncate">
                          <div className="font-medium text-[14px] text-[#111111]">
                            {lead?.business_name || 'Opportunity'}
                          </div>
                          <div className="text-[12px] text-[#6B6B6B] truncate">
                            Stage: {opp.stage} · Next: {opp.next_action || 'Review'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[12px] font-semibold text-[#111111]">
                        ₹{opp.estimated_value.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchingClients.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-[#6B6B6B] tracking-wider uppercase">
                Active Clients
              </div>
              <div className="space-y-1">
                {matchingClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={selectClient}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F7F7F5] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-[#16803C] flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-medium text-[14px] text-[#111111]">
                          {client.business_name}
                        </div>
                        <div className="text-[12px] text-[#6B6B6B] truncate">
                          {client.project} · {client.contact_name}
                        </div>
                      </div>
                    </div>
                    <span className="text-[12px] font-semibold text-[#16803C]">
                      ₹{client.value.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && matchingLeads.length === 0 && matchingOpps.length === 0 && matchingClients.length === 0 && (
            <div className="py-10 text-center text-[#6B6B6B] text-[13.5px]">
              No leads, opportunities, or clients found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#F7F7F5] border-t border-[#E5E5E5] flex items-center justify-between text-[11.5px] text-[#6B6B6B]">
          <span>Press <kbd className="kbd-pill">↵ Enter</kbd> to select</span>
          <span><kbd className="kbd-pill">Esc</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
