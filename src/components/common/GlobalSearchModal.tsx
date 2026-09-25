'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '@/lib/store';
import { Search, X, ArrowRight, Phone, MapPin } from 'lucide-react';

export function GlobalSearchModal() {
  const { searchOpen, setSearchOpen, leads, setSelectedLeadId, setCurrentView } = useCRM();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  // Search results
  const results = query.trim()
    ? leads.filter((l) => {
        const q = query.toLowerCase();
        return (
          l.business_name.toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelect = (id: string) => {
    setSelectedLeadId(id);
    setCurrentView('leads');
    setSearchOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#12151C]/50 p-4"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#E5E7EB]">
          <Search className="w-4 h-4 text-[#12151C]/40 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business name, contact person, or phone number..."
            className="flex-1 text-[14px] text-[#12151C] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#12151C]/40 hover:text-[#12151C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono text-[#12151C]/50 border border-[#E5E7EB]">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E7EB]">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-[13px] text-[#12151C]/50">
              No matching prospects or contacts found.
            </div>
          )}

          {!query.trim() && (
            <div className="p-6 text-center text-[12px] text-[#12151C]/50">
              Type to search across all leads in Product (NivaOps) and Client Work.
            </div>
          )}

          {results.map((lead) => (
            <div
              key={lead.id}
              onClick={() => handleSelect(lead.id)}
              className="p-3.5 hover:bg-[#F4F6F9] cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1 text-[#12151C]">
                    {lead.type}
                  </span>
                  <span className="text-[10px] font-mono border border-[#E5E7EB] px-1 text-[#12151C]/70">
                    {lead.stage}
                  </span>
                  <span className="text-[13.5px] font-bold text-[#12151C] truncate">
                    {lead.business_name}
                  </span>
                </div>
                <div className="text-[12px] text-[#12151C]/70 mt-0.5 flex items-center gap-2">
                  <span>{lead.contact_name}</span>
                  <span>•</span>
                  <span className="font-mono">{lead.phone}</span>
                  {lead.city && <span>• {lead.city}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-[#12151C]/50">
                  {lead.assigned_to}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#12151C]/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
