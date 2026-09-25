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
    setCurrentView('opportunities');
    setSearchModalOpen(false);
  };

  const selectClient = () => {
    setCurrentView('clients');
    setSearchModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#12151C]/40 p-4"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E5E7EB] gap-2.5 bg-[#F4F6F9]">
          <Search className="w-4 h-4 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business, contact, phone, or deal..."
            className="flex-1 text-[13.5px] text-[#12151C] placeholder-[#6B7280] bg-transparent outline-none"
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 text-[#6B7280] hover:text-[#12151C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {matchingLeads.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">
                Leads &amp; Contacts
              </div>
              <div className="space-y-1">
                {matchingLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => selectLead(lead.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F4F6F9] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-[13px] text-[#12151C] truncate">
                          {lead.business_name}
                        </div>
                        <div className="text-[11.5px] text-[#6B7280] truncate">
                          {lead.contact_name ? `${lead.contact_name} · ` : ''}{lead.industry} · {lead.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] flex-shrink-0">
                      {lead.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingOpps.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">
                Opportunities
              </div>
              <div className="space-y-1">
                {matchingOpps.map((opp) => {
                  const lead = leads.find((l) => l.id === opp.lead_id);
                  return (
                    <button
                      key={opp.id}
                      onClick={() => selectOpp(opp.lead_id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F4F6F9] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Briefcase className="w-3.5 h-3.5 text-[#12151C] flex-shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-[13px] text-[#12151C]">
                            {lead?.business_name || 'Opportunity'}
                          </div>
                          <div className="text-[11.5px] text-[#6B7280]">
                            {opp.stage} · {opp.next_action}
                          </div>
                        </div>
                      </div>
                      <span className="text-[12px] font-bold text-[#12151C] font-mono flex-shrink-0">
                        ₹{(opp.estimated_value || 0).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchingClients.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-semibold text-[#6B7280] tracking-wider uppercase">
                Clients
              </div>
              <div className="space-y-1">
                {matchingClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={selectClient}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#F4F6F9] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#12151C] flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-[13px] text-[#12151C]">
                          {c.business_name}
                        </div>
                        <div className="text-[11.5px] text-[#6B7280]">
                          {c.project} · {c.contact_name}
                        </div>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-[#12151C] font-mono flex-shrink-0">
                      ₹{c.value.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && matchingLeads.length === 0 && matchingOpps.length === 0 && matchingClients.length === 0 && (
            <div className="p-8 text-center text-[#6B7280] text-[13px]">
              No records found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#E5E7EB] bg-[#F4F6F9] text-[11px] text-[#6B7280] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="kbd-pill">↑</kbd>
            <kbd className="kbd-pill">↓</kbd>
            <span>Select:</span>
            <kbd className="kbd-pill">↵</kbd>
          </div>
          <div>
            <kbd className="kbd-pill">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
