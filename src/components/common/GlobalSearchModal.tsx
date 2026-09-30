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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#EAECEF]">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search business name, contact person, or phone number..."
            className="flex-1 text-[14.5px] text-[#111827] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 px-2 py-0.5 text-[10.5px] font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded-md">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#EAECEF]">
          {query.trim() && results.length === 0 && (
            <div className="p-8 text-center text-[13px] text-gray-400">
              No matching prospects or contacts found.
            </div>
          )}

          {!query.trim() && (
            <div className="p-6 text-center text-[12.5px] text-gray-400">
              Type to search across all leads in Product (NivaOps) and Client Work.
            </div>
          )}

          {results.map((lead) => (
            <div
              key={lead.id}
              onClick={() => handleSelect(lead.id)}
              className="p-4 hover:bg-[#F8FAF9] cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-[#E8F5EE] text-[#1A5336] px-2 py-0.5 rounded-full font-bold">
                    {lead.type}
                  </span>
                  <span className="text-[10px] font-mono bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                    {lead.stage}
                  </span>
                  <span className="text-[14px] font-bold text-[#111827] truncate">
                    {lead.business_name}
                  </span>
                </div>
                <div className="text-[12px] text-gray-500 mt-1 flex items-center gap-2">
                  <span>{lead.contact_name}</span>
                  <span>•</span>
                  <span className="font-mono">{lead.phone}</span>
                  {lead.city && <span>• {lead.city}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-gray-400">
                  {lead.assigned_to}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
