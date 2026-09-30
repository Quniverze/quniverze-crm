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
  Edit2,
  Check,
  Clock,
  AlertTriangle,
  Copy
} from 'lucide-react';

function getDueStatus(dueDate?: string) {
  if (!dueDate) return { label: 'No due date', type: 'none' };
  const today = new Date().toISOString().split('T')[0];
  if (dueDate < today) {
    const diffDays = Math.max(
      1,
      Math.ceil((new Date(today).getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    return { label: `Overdue (${diffDays}d)`, type: 'overdue' };
  }
  if (dueDate === today) return { label: 'Due Today', type: 'today' };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (dueDate === tomorrowStr) return { label: 'Due Tomorrow', type: 'tomorrow' };

  return { label: `Due ${dueDate}`, type: 'future' };
}

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
    teamMembers,
    showToast
  } = useCRM();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [assignedFilter, setAssignedFilter] = useState<'All' | string>('All');
  const [attentionFilter, setAttentionFilter] = useState<'All' | 'Overdue' | 'MissingAction'>('All');

  // Inline note text
  const [noteText, setNoteText] = useState('');

  // Editing next action inline
  const [editingNextAction, setEditingNextAction] = useState(false);
  const [nextActionInput, setNextActionInput] = useState('');
  const [nextActionDueInput, setNextActionDueInput] = useState('');

  // Editing lead details inline
  const [editingDetails, setEditingDetails] = useState(false);
  const [editValue, setEditValue] = useState<number | undefined>(undefined);
  const [editAngle, setEditAngle] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (typeFilter !== 'All' && lead.type !== typeFilter) return false;
      if (stageFilter !== 'All' && lead.stage !== stageFilter) return false;
      if (assignedFilter !== 'All' && lead.assigned_to !== assignedFilter) return false;

      if (attentionFilter === 'Overdue') {
        if (!lead.next_action_due || lead.next_action_due >= todayStr) return false;
      } else if (attentionFilter === 'MissingAction') {
        if (lead.next_action && lead.next_action_due) return false;
      }

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
  }, [leads, typeFilter, stageFilter, assignedFilter, attentionFilter, searchQuery, todayStr]);

  const activeLead = leads.find((l) => l.id === selectedLeadId);
  const activeActivities = activeLead ? getLeadActivities(activeLead.id) : [];

  const handleSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setEditingNextAction(false);
    setEditingDetails(false);
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

  const handleStartEditDetails = () => {
    if (!activeLead) return;
    setEditValue(activeLead.value);
    setEditAngle(activeLead.angle || '');
    setEditingDetails(true);
  };

  const handleSaveDetails = () => {
    if (!activeLead) return;
    updateLead(activeLead.id, {
      value: editValue,
      angle: editAngle.trim()
    });
    setEditingDetails(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !noteText.trim()) return;
    addActivity(activeLead.id, 'note', noteText.trim());
    setNoteText('');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* ========================================================
          Left / Main: High-Density Table of Leads
          ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white border border-[#EAECEF] rounded-[22px] shadow-xs mr-0 md:mr-3">
        {/* Filter & Control Bar */}
        <div className="p-4 border-b border-[#EAECEF] space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, contact person, phone..."
                className="w-full pl-10 pr-4 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-full focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="btn-pill-primary shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px]">
            {/* Line of Business */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#F8F9FA] border border-gray-200 rounded-full text-gray-700 focus:outline-none"
            >
              <option value="All">All Lines</option>
              <option value="Product">Product (NivaOps)</option>
              <option value="Client Work">Client Work</option>
            </select>

            {/* Stage */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#F8F9FA] border border-gray-200 rounded-full text-gray-700 focus:outline-none"
            >
              <option value="All">All Stages</option>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Assigned Member */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F8F9FA] border border-gray-200 rounded-full text-gray-700 focus:outline-none"
            >
              <option value="All">All Team</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Attention Filter */}
            <select
              value={attentionFilter}
              onChange={(e) => setAttentionFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-[#F8F9FA] border border-gray-200 rounded-full text-gray-700 focus:outline-none"
            >
              <option value="All">All Health</option>
              <option value="Overdue">Overdue Actions Only</option>
              <option value="MissingAction">Missing Next Step</option>
            </select>

            <span className="ml-auto text-[11px] font-mono text-gray-400 shrink-0">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>
        </div>

        {/* Lead Table Header (Desktop) */}
        <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 bg-[#FAFAFB] border-b border-[#EAECEF] text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
          <div className="col-span-4">Lead / Contact</div>
          <div className="col-span-2">Line &amp; Stage</div>
          <div className="col-span-4">Next Action</div>
          <div className="col-span-2 text-right">Value / Owner</div>
        </div>

        {/* Lead Table / List Body */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#1A5336] mb-3">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-[#111827]">No leads found</h3>
              <p className="text-[12.5px] text-gray-500 mt-1 max-w-sm">
                {leads.length === 0
                  ? 'Your database is currently empty. Click "+ New Lead" to add your first product or client lead.'
                  : 'No leads match the selected filters or search terms.'}
              </p>
              {leads.length === 0 && (
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="mt-4 btn-pill-primary"
                >
                  Create First Lead
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#EAECEF] bg-white">
              {filteredLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                const dueStatus = getDueStatus(lead.next_action_due);

                return (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`p-4 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#E8F5EE]/40 border-l-4 border-l-[#1A5336]' : ''
                    }`}
                  >
                    {/* Desktop Tabular Grid Layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                      {/* Business & Contact */}
                      <div className="col-span-4 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[14px] font-bold text-[#111827] truncate">
                            {lead.business_name}
                          </h4>
                          {lead.city && (
                            <span className="text-[11px] font-mono text-gray-400 truncate">
                              • {lead.city}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-gray-500 truncate flex items-center gap-2 mt-0.5">
                          <span>{lead.contact_name}</span>
                          <span className="font-mono text-gray-400">{lead.phone}</span>
                        </div>
                      </div>

                      {/* Line & Stage */}
                      <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono uppercase bg-[#F0FDF4] text-[#166534] border border-green-200 px-2 py-0.5 rounded-md">
                          {lead.type === 'Product' ? 'Product' : 'Client'}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-md">
                          {lead.stage}
                        </span>
                      </div>

                      {/* Next Action + Due Status */}
                      <div className="col-span-4 min-w-0 pr-2">
                        {lead.next_action ? (
                          <div>
                            <div className="text-[13px] text-[#111827] font-medium truncate flex items-center gap-1.5">
                              <span className="text-[#1A5336]">→</span>
                              <span className="truncate">{lead.next_action}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md ${
                                  dueStatus.type === 'overdue'
                                    ? 'bg-rose-100 text-rose-700'
                                    : dueStatus.type === 'today'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'text-gray-500'
                                }`}
                              >
                                {dueStatus.label}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-gray-400 italic flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>No next action scheduled</span>
                          </div>
                        )}
                      </div>

                      {/* Value / Owner */}
                      <div className="col-span-2 text-right">
                        <span className="text-[13px] font-mono font-bold text-[#111827] block">
                          {lead.value ? `₹${lead.value.toLocaleString()}` : '—'}
                        </span>
                        <span className="text-[11px] font-mono text-gray-500 block mt-0.5">
                          {lead.assigned_to}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="lg:hidden space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9.5px] font-mono uppercase bg-[#F0FDF4] text-[#166534] px-1.5 py-0.5 rounded">
                              {lead.type}
                            </span>
                            <span className="text-[9.5px] font-mono uppercase bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">
                              {lead.stage}
                            </span>
                            <h4 className="text-[14px] font-bold text-[#111827]">
                              {lead.business_name}
                            </h4>
                          </div>
                          <div className="text-[12px] text-gray-500 mt-0.5">
                            {lead.contact_name} • <span className="font-mono">{lead.phone}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {lead.value && (
                            <span className="text-[12.5px] font-mono font-bold text-[#111827] block">
                              ₹{lead.value.toLocaleString()}
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-gray-500 block">
                            {lead.assigned_to}
                          </span>
                        </div>
                      </div>

                      {lead.next_action && (
                        <div className="text-[12px] text-[#111827] font-medium pt-1.5 border-t border-gray-100 flex items-center justify-between gap-2">
                          <div className="truncate flex items-center gap-1">
                            <span className="text-[#1A5336]">→</span>
                            <span className="truncate">{lead.next_action}</span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">
                            {lead.next_action_due}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          Right / Detail Pane: Active Lead Info & Inline Activity
          ======================================================== */}
      {activeLead ? (
        <div className="w-full md:w-[440px] lg:w-[480px] bg-white border border-[#EAECEF] rounded-[22px] shadow-xs flex flex-col h-full overflow-y-auto shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-[#EAECEF] flex items-center justify-between bg-[#FAFAFB] rounded-t-[22px] shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#1A5336] text-white px-2 py-0.5 rounded-full">
                  {activeLead.type}
                </span>
                <span className="text-[11px] font-mono text-gray-500">
                  Assigned: {activeLead.assigned_to}
                </span>
              </div>
              <h2 className="text-[17px] font-bold text-[#111827] truncate mt-1">
                {activeLead.business_name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedLeadId(null)}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1">
            {/* 1. DOMINANT NEXT ACTION PINNED AT TOP */}
            <div className="p-4 bg-[#F8FAF9] border border-[#1A5336]/20 rounded-2xl">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#1A5336] font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1A5336]" />
                  <span>Next Action</span>
                </span>
                <button
                  onClick={handleStartEditNextAction}
                  className="text-[11px] text-[#1A5336] hover:underline flex items-center gap-1"
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
                    className="w-full px-3 py-1.5 text-[12.5px] bg-white border border-gray-200 rounded-xl focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={nextActionDueInput}
                      onChange={(e) => setNextActionDueInput(e.target.value)}
                      className="px-2.5 py-1 text-[11.5px] font-mono bg-white border border-gray-200 rounded-xl focus:outline-none"
                    />
                    <button
                      onClick={handleSaveNextAction}
                      className="px-3.5 py-1.5 bg-[#1A5336] text-white text-[11px] font-medium rounded-full hover:bg-[#14422B]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNextAction(false)}
                      className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[13.5px] font-semibold text-[#111827] flex items-center gap-1.5 mt-1">
                    <span className="text-[#1A5336]">→</span>
                    <span>{activeLead.next_action || 'No action scheduled — click edit'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                        getDueStatus(activeLead.next_action_due).type === 'overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : getDueStatus(activeLead.next_action_due).type === 'today'
                          ? 'bg-amber-100 text-amber-800'
                          : 'text-gray-500'
                      }`}
                    >
                      {getDueStatus(activeLead.next_action_due).label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Rapid Contact Actions (Call / WhatsApp) */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                Direct Contact
              </label>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${activeLead.phone}`}
                  className="py-2.5 bg-[#1A5336] text-white text-[12.5px] font-medium rounded-full hover:bg-[#14422B] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activeLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-white border border-gray-300 text-gray-800 text-[12.5px] font-medium rounded-full hover:border-gray-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div className="flex items-center justify-between text-[12px] text-gray-600 pt-1">
                <span>
                  <strong>{activeLead.contact_name}</strong>
                  {activeLead.city && <span> • {activeLead.city}</span>}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeLead.phone, 'phone')}
                  className="text-[11px] font-mono text-[#1A5336] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* 3. Stage & Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Pipeline Stage
                </label>
                <select
                  value={activeLead.stage}
                  onChange={(e) => setStage(activeLead.id, e.target.value as LeadStage)}
                  className="w-full px-3 py-2 text-[12.5px] font-medium bg-[#F8F9FA] border border-gray-200 rounded-xl text-[#111827] focus:outline-none"
                >
                  {PIPELINE_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
                  Est. Deal Value (₹)
                </label>
                <input
                  type="number"
                  value={activeLead.value || ''}
                  onChange={(e) =>
                    updateLead(activeLead.id, {
                      value: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 text-[12.5px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl text-[#111827] focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Strategic Angle / Pitch */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-gray-400">
                <span>Strategic Angle / Pitch</span>
                {!editingDetails ? (
                  <button
                    onClick={handleStartEditDetails}
                    className="text-[10px] text-[#1A5336] hover:underline"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              {editingDetails ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={editAngle}
                    onChange={(e) => setEditAngle(e.target.value)}
                    placeholder="Specific pitch angle..."
                    className="w-full p-2.5 text-[12px] bg-white border border-gray-200 rounded-xl text-[#111827] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDetails}
                      className="px-3 py-1 bg-[#1A5336] text-white text-[11px] font-medium rounded-full hover:bg-[#14422B]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDetails(false)}
                      className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-[12.5px] text-gray-700 italic">
                  {activeLead.angle || 'No angle specified. Click edit to add pitch rationale.'}
                </div>
              )}
            </div>

            {/* 5. Inline Activity Timeline */}
            <div className="space-y-3 pt-3 border-t border-[#EAECEF]">
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
                Activity History ({activeActivities.length})
              </label>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log quick observation..."
                  className="flex-1 px-3 py-2 text-[12px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none text-[#111827]"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-[#1A5336] text-white text-[12px] font-medium rounded-full hover:bg-[#14422B] disabled:opacity-40 transition-colors"
                >
                  Log
                </button>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {activeActivities.length === 0 ? (
                  <div className="text-[11.5px] text-gray-400 italic">
                    No activity recorded yet.
                  </div>
                ) : (
                  activeActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-[#F8F9FA] border border-gray-200 rounded-xl text-[12px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                        <span className="uppercase font-semibold text-[#111827]">
                          {act.type.replace('_', ' ')}
                        </span>
                        <span>
                          {new Date(act.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="text-gray-800">{act.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Delete Lead */}
            <div className="pt-4 border-t border-[#EAECEF] flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete ${activeLead.business_name}?`)) {
                    deleteLead(activeLead.id);
                  }
                }}
                className="text-[11.5px] text-gray-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
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
