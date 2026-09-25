'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, LeadType, LeadStage, PIPELINE_STAGES } from '@/types/crm';
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  X,
  Calendar,
  User as UserIcon,
  MapPin,
  ChevronRight,
  ArrowRight,
  Trash2,
  Send,
  Edit2
} from 'lucide-react';

export function LeadsView() {
  const {
    leads,
    selectedLeadId,
    setSelectedLeadId,
    setQuickAddOpen,
    updateLead,
    setStage,
    deleteLead,
    getLeadActivities,
    addActivity,
    teamMembers
  } = useCRM();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [assignedFilter, setAssignedFilter] = useState<'All' | string>('All');

  // Inline note text
  const [noteText, setNoteText] = useState('');

  // Editing next action inline
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextActionInput, setNextActionInput] = useState('');
  const [nextActionDueInput, setNextActionDueInput] = useState('');

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (typeFilter !== 'All' && lead.type !== typeFilter) return false;
      if (stageFilter !== 'All' && lead.stage !== stageFilter) return false;
      if (assignedFilter !== 'All' && lead.assigned_to !== assignedFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesBusiness = lead.business_name.toLowerCase().includes(q);
        const matchesContact = lead.contact_name.toLowerCase().includes(q);
        const matchesPhone = lead.phone.toLowerCase().includes(q);
        const matchesCity = lead.city.toLowerCase().includes(q);
        if (!matchesBusiness && !matchesContact && !matchesPhone && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [leads, typeFilter, stageFilter, assignedFilter, searchQuery]);

  const activeLead = leads.find((l) => l.id === selectedLeadId);
  const activeActivities = activeLead ? getLeadActivities(activeLead.id) : [];

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setEditingNextAction(false);
  };

  const handleStartEditNextAction = () => {
    if (!activeLead) return;
    setNextActionInput(activeLead.next_action || '');
    setNextActionDueInput(activeLead.next_action_due || '');
    setEditingNextAction(true);
  };

  const handleSaveNextAction = () => {
    if (!activeLead) return;
    updateLead(activeLead.id, {
      next_action: nextActionInput.trim(),
      next_action_due: nextActionDueInput
    });
    addActivity(
      activeLead.id,
      'note',
      `Updated next action: "${nextActionInput.trim()}" due ${nextActionDueInput}`
    );
    setEditingNextAction(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !noteText.trim()) return;
    addActivity(activeLead.id, 'note', noteText.trim());
    setNoteText('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F4F6F9]">
      {/* Left / Main: Table of Leads */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#E5E7EB]">
        {/* Filter & Control Bar */}
        <div className="p-4 bg-white border-b border-[#E5E7EB] space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#12151C]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, contact, phone, city..."
                className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] text-[#12151C]"
              />
            </div>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-3.5 py-1.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px]">
            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] focus:outline-none"
            >
              <option value="All">All Lines</option>
              <option value="Product">Product (NivaOps)</option>
              <option value="Client Work">Client Work</option>
            </select>

            {/* Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] focus:outline-none"
            >
              <option value="All">All Stages</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Assigned filter */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] focus:outline-none"
            >
              <option value="All">All Team</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <span className="ml-auto text-[11px] font-mono text-[#12151C]/60 shrink-0">
              {filteredLeads.length} leads
            </span>
          </div>
        </div>

        {/* Lead Table / List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-10 h-10 border border-[#E5E7EB] flex items-center justify-center mb-3">
                <Search className="w-4 h-4 text-[#12151C]/40" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#12151C]">No leads found</h3>
              <p className="text-[12px] text-[#12151C]/60 mt-1 max-w-sm">
                {leads.length === 0
                  ? 'Your database is currently empty. Click "+ New Lead" to add your first product or client lead.'
                  : 'No leads match the selected filters or search terms.'}
              </p>
              {leads.length === 0 && (
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors"
                >
                  Create First Lead
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] bg-white">
              {filteredLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`p-3.5 hover:bg-[#F4F6F9] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F4F6F9] border-l-2 border-l-[#12151C]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]">
                            {lead.type}
                          </span>
                          <span className="text-[10px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 text-[#12151C]/80">
                            {lead.stage}
                          </span>
                          <h4 className="text-[13.5px] font-bold text-[#12151C] truncate">
                            {lead.business_name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 text-[12px] text-[#12151C]/70 mt-1 flex-wrap">
                          <span>{lead.contact_name}</span>
                          <span>•</span>
                          <span className="font-mono">{lead.phone}</span>
                          {lead.city && (
                            <>
                              <span>•</span>
                              <span>{lead.city}</span>
                            </>
                          )}
                        </div>

                        {lead.next_action && (
                          <div className="text-[11.5px] text-[#12151C] font-medium mt-1.5 flex items-center gap-1.5">
                            <span className="text-[#3B82F6]">→</span>
                            <span className="truncate">{lead.next_action}</span>
                            {lead.next_action_due && (
                              <span className="text-[10px] font-mono text-[#12151C]/60 shrink-0">
                                ({lead.next_action_due})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-[#12151C]/60 block">
                          {lead.assigned_to}
                        </span>
                        {lead.value ? (
                          <span className="text-[11.5px] font-mono font-semibold text-[#12151C] block mt-0.5">
                            ₹{lead.value.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right / Detail Pane: Active Lead Info & Inline Activity */}
      {activeLead ? (
        <div className="w-full md:w-[420px] lg:w-[480px] bg-white flex flex-col h-full overflow-y-auto shrink-0 border-l border-[#E5E7EB]">
          {/* Header */}
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F4F6F9]/60 shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5">
                  {activeLead.type}
                </span>
                <span className="text-[11px] font-mono text-[#12151C]/60">
                  Assigned: {activeLead.assigned_to}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-[#12151C] truncate mt-1">
                {activeLead.business_name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedLeadId(null)}
              className="p-1 text-[#12151C]/60 hover:text-[#12151C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5 flex-1">
            {/* 1. DOMINANT NEXT ACTION PINNED AT TOP */}
            <div className="p-3.5 bg-[#F4F6F9] border-2 border-[#12151C]">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C] font-bold mb-1">
                <span>Next Action</span>
                <button
                  onClick={handleStartEditNextAction}
                  className="text-[10px] text-[#3B82F6] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {editingNextAction ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={nextActionInput}
                    onChange={(e) => setNextActionInput(e.target.value)}
                    placeholder="Action description..."
                    className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#E5E7EB] focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={nextActionDueInput}
                      onChange={(e) => setNextActionDueInput(e.target.value)}
                      className="px-2 py-1 text-[11.5px] font-mono bg-white border border-[#E5E7EB] focus:outline-none"
                    />
                    <button
                      onClick={handleSaveNextAction}
                      className="px-3 py-1 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNextAction(false)}
                      className="px-2 py-1 text-[11px] text-[#12151C]/60 hover:text-[#12151C]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[13px] font-semibold text-[#12151C] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{activeLead.next_action || 'No action scheduled'}</span>
                  </div>
                  {activeLead.next_action_due && (
                    <div className="text-[11px] font-mono text-[#12151C]/70 mt-1">
                      Due: {activeLead.next_action_due}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Contact Actions (Call / WhatsApp) */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60">
                Contact &amp; Fast Actions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${activeLead.phone}`}
                  className="px-3 py-2 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activeLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-white border border-[#E5E7EB] text-[#12151C] text-[12px] font-medium hover:border-[#12151C] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div className="text-[12px] text-[#12151C]/80 mt-1">
                <span className="font-semibold">{activeLead.contact_name}</span>
                {activeLead.city && <span> • {activeLead.city}</span>}
              </div>
            </div>

            {/* 3. Stage Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60">
                Pipeline Stage
              </label>
              <select
                value={activeLead.stage}
                onChange={(e) => setStage(activeLead.id, e.target.value as LeadStage)}
                className="w-full px-3 py-2 text-[12.5px] font-medium bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] focus:outline-none"
              >
                {PIPELINE_STAGES.map((stg) => (
                  <option key={stg} value={stg}>
                    {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Angle (Pitch / Reason to Pursue) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60">
                Strategic Angle / Pitch
              </label>
              <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] text-[12.5px] text-[#12151C]">
                {activeLead.angle || 'No angle specified. Edit lead to add pitch notes.'}
              </div>
            </div>

            {/* 5. Inline Activity Log (calls, notes, stage changes) */}
            <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/60 block">
                Activity History ({activeActivities.length})
              </label>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log quick call note or observation..."
                  className="flex-1 px-3 py-1.5 text-[12px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none text-[#12151C]"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-3 py-1.5 bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] disabled:opacity-40 transition-colors"
                >
                  Log
                </button>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-2 mt-2">
                {activeActivities.length === 0 ? (
                  <div className="text-[11.5px] text-[#12151C]/50 italic">
                    No activity recorded yet.
                  </div>
                ) : (
                  activeActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/60">
                        <span className="uppercase font-semibold text-[#12151C]">
                          {act.type.replace('_', ' ')}
                        </span>
                        <span>{new Date(act.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                      <div className="text-[#12151C]">{act.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Delete Lead */}
            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete ${activeLead.business_name}?`)) {
                    deleteLead(activeLead.id);
                  }
                }}
                className="text-[11.5px] text-[#12151C]/50 hover:text-[#12151C] flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
