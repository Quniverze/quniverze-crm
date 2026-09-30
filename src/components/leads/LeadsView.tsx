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
  Copy,
  ChevronLeft,
  UserCheck
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
    currentUser,
    showToast
  } = useCRM();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | LeadType>('All');
  const [stageFilter, setStageFilter] = useState<'All' | LeadStage>('All');
  const [assignedFilter, setAssignedFilter] = useState<'All' | string>(() => {
    return currentUser?.role === 'member' ? currentUser.name : 'All';
  });
  const [attentionFilter, setAttentionFilter] = useState<'All' | 'Overdue' | 'MissingAction' | 'NewAssigned'>('All');

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
      } else if (attentionFilter === 'NewAssigned') {
        if (lead.stage !== 'New') return false;
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

  const assigneeOptions = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach((m) => set.add(m));
    if (activeLead?.assigned_to) set.add(activeLead.assigned_to);
    if (currentUser?.name) set.add(currentUser.name);
    return Array.from(set).filter(Boolean);
  }, [teamMembers, activeLead?.assigned_to, currentUser?.name]);

  const isAdmin = currentUser?.role === 'admin';

  const handleReassign = (newAssignee: string) => {
    if (!isAdmin) {
      showToast('Only admins can reassign leads');
      return;
    }
    if (!activeLead || !newAssignee || activeLead.assigned_to === newAssignee) return;
    const oldAssignee = activeLead.assigned_to || 'Unassigned';
    updateLead(activeLead.id, { assigned_to: newAssignee });
    addActivity(
      activeLead.id,
      'note',
      `Reassigned lead from ${oldAssignee} to ${newAssignee}${currentUser ? ` by ${currentUser.name}` : ''}`
    );
    showToast(`Lead reassigned to ${newAssignee}`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F4F6F9] p-2.5 sm:p-3 md:p-4 gap-2.5 md:gap-3">
      {/* ========================================================
          Left / Main: High-Density Table Tile
          ======================================================== */}
      <div
        className={`flex-1 flex-col h-full overflow-hidden rounded-lg bg-white border border-[#E5E7EB] ${
          activeLead ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Filter & Control Bar - Uniform 32px (h-8) Controls */}
        <div className="p-3 md:p-4 border-b border-[#E5E7EB] space-y-2.5 shrink-0 bg-white">
          <div className="flex items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#12151C]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, contact, phone, city..."
                className="w-full h-8 pl-8 pr-3 text-[12.5px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] text-[#12151C] rounded-md transition-colors"
              />
            </div>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="h-8 px-3.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5 shrink-0 rounded-md shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </button>
          </div>

          {/* Filter Dropdowns - Uniform 32px (h-8) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 text-[12px]">
            {/* Line of Business */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-8 px-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] rounded-md focus:outline-none text-[12px]"
            >
              <option value="All">All Lines</option>
              <option value="Product">Product (NivaOps)</option>
              <option value="Client Work">Client Work</option>
            </select>

            {/* Stage */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="h-8 px-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] rounded-md focus:outline-none text-[12px]"
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
              className="h-8 px-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] rounded-md focus:outline-none text-[12px]"
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
              className="h-8 px-2.5 bg-[#F4F6F9] border border-[#E5E7EB] text-[#12151C] rounded-md focus:outline-none text-[12px]"
            >
              <option value="All">All Health</option>
              <option value="NewAssigned">New Assigned (Needs Contact)</option>
              <option value="Overdue">Overdue Actions Only</option>
              <option value="MissingAction">Missing Next Step</option>
            </select>

            <span className="ml-auto text-[11px] font-mono text-[#12151C]/50 shrink-0">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>
        </div>

        {/* Lead Table Header (Desktop) */}
        <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-[#F4F6F9] border-b border-[#E5E7EB] text-[10.5px] font-mono uppercase tracking-wider text-[#12151C]/50 shrink-0">
          <div className="col-span-4">Lead / Contact</div>
          <div className="col-span-2">Line &amp; Stage</div>
          <div className="col-span-4">Next Action</div>
          <div className="col-span-2 text-right">Value / Owner</div>
        </div>

        {/* Lead Table / List Body */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
              <div className="w-10 h-10 border border-[#E5E7EB] rounded-lg flex items-center justify-center mb-3">
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
                  className="mt-4 h-8 px-4 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors rounded-md shadow-xs"
                >
                  Create First Lead
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB] bg-white">
              {filteredLeads.map((lead) => {
                const isSelected = lead.id === selectedLeadId;
                const dueStatus = getDueStatus(lead.next_action_due);

                return (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`p-3.5 hover:bg-[#F4F6F9] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F4F6F9] border-l-2 border-l-[#12151C]' : ''
                    }`}
                  >
                    {/* Desktop Tabular Grid Layout */}
                    <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                      {/* Business & Contact */}
                      <div className="col-span-4 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13.5px] font-semibold text-[#12151C] truncate">
                            {lead.business_name}
                          </h4>
                          {lead.city && (
                            <span className="text-[11px] font-mono text-[#12151C]/50 truncate">
                              • {lead.city}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#12151C]/60 truncate flex items-center gap-2 mt-0.5">
                          <span>{lead.contact_name}</span>
                          <span className="font-mono text-[#12151C]/40">{lead.phone}</span>
                        </div>
                      </div>

                      {/* Line & Stage */}
                      <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                        {lead.stage === 'New' ? (
                          <span className="text-[9.5px] font-mono font-bold bg-[#3B82F6] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                            New Lead
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                            {lead.stage}
                          </span>
                        )}
                        <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]/70">
                          {lead.type === 'Product' ? 'Product' : 'Client'}
                        </span>
                      </div>

                      {/* Next Action + Due Status */}
                      <div className="col-span-4 min-w-0 pr-2">
                        {lead.next_action ? (
                          <div>
                            <div className="text-[12.5px] text-[#12151C] font-medium truncate flex items-center gap-1.5">
                              <span className="text-[#3B82F6]">→</span>
                              <span className="truncate">{lead.next_action}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.2 rounded ${
                                  dueStatus.type === 'overdue'
                                    ? 'bg-[#12151C] text-white'
                                    : dueStatus.type === 'today'
                                    ? 'bg-[#E5E7EB] text-[#12151C]'
                                    : 'text-[#12151C]/60'
                                }`}
                              >
                                {dueStatus.label}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-[#12151C]/40 italic flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-[#12151C]/40" />
                            <span>No action scheduled</span>
                          </div>
                        )}
                      </div>

                      {/* Value / Owner */}
                      <div className="col-span-2 text-right">
                        <span className="text-[12.5px] font-mono font-semibold text-[#12151C] block">
                          {lead.value ? `₹${lead.value.toLocaleString()}` : '—'}
                        </span>
                        <span className="text-[11px] font-mono text-[#12151C]/50 block mt-0.5">
                          {lead.assigned_to}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="lg:hidden space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {lead.stage === 'New' ? (
                              <span className="text-[9.5px] font-mono font-bold bg-[#3B82F6] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                                New Lead
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]">
                                {lead.stage}
                              </span>
                            )}
                            <span className="text-[9.5px] font-mono uppercase border border-[#E5E7EB] px-1.5 py-0.5 rounded text-[#12151C]/70">
                              {lead.type === 'Product' ? 'Product' : 'Client'}
                            </span>
                          </div>
                          <h4 className="text-[14px] font-semibold text-[#12151C] mt-1 truncate">
                            {lead.business_name}
                          </h4>
                          <div className="text-[12px] text-[#12151C]/70 mt-0.5">
                            {lead.contact_name} {lead.city && `• ${lead.city}`}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {lead.value ? (
                            <span className="text-[13px] font-mono font-semibold text-[#12151C] block">
                              ₹{lead.value.toLocaleString()}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-[#12151C]/60 bg-[#F4F6F9] border border-[#E5E7EB] px-1.5 py-0.5 rounded mt-1">
                            <UserIcon className="w-3 h-3 text-[#12151C]/40" />
                            <span>{lead.assigned_to}</span>
                          </span>
                        </div>
                      </div>

                      {/* Next Action pill */}
                      {lead.next_action ? (
                        <div className="text-[12px] text-[#12151C] font-medium pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                          <div className="truncate flex items-center gap-1">
                            <span className="text-[#3B82F6] font-bold">→</span>
                            <span className="truncate">{lead.next_action}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                              dueStatus.type === 'overdue'
                                ? 'bg-[#12151C] text-white'
                                : dueStatus.type === 'today'
                                ? 'bg-[#E5E7EB] text-[#12151C]'
                                : 'text-[#12151C]/60'
                            }`}
                          >
                            {dueStatus.label}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-[#12151C]/40 italic pt-1.5 border-t border-[#E5E7EB] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#12151C]/40" />
                          <span>No action scheduled</span>
                        </div>
                      )}

                      {/* Quick Mobile Action Bar */}
                      <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                        <span className="text-[11.5px] font-mono text-[#12151C]/50 truncate">
                          {lead.phone}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${lead.phone}`}
                            className="h-7 w-7 rounded border border-[#E5E7EB] bg-white flex items-center justify-center text-[#12151C] hover:border-[#12151C] active:scale-95 transition-all"
                            title={`Call ${lead.phone}`}
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-7 w-7 rounded border border-[#E5E7EB] bg-white flex items-center justify-center text-[#12151C] hover:border-[#12151C] active:scale-95 transition-all"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleSelectLead(lead)}
                            className="h-7 px-2.5 rounded bg-[#12151C] text-white text-[11px] font-medium hover:bg-[#3B82F6] active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          Right / Detail Tile Pane: Active Lead Info
          ======================================================== */}
      {activeLead ? (
        <div className="w-full md:w-[420px] lg:w-[460px] rounded-lg bg-white border border-[#E5E7EB] flex flex-col h-full overflow-y-auto shrink-0 shadow-xs">
          {/* Header */}
          <div className="h-[52px] px-3 md:px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F4F6F9]/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile Back Button: Returns to Leads List */}
              <button
                onClick={() => setSelectedLeadId(null)}
                className="md:hidden flex items-center gap-1 text-[12px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] px-2.5 py-1.5 rounded-md hover:bg-[#F4F6F9] active:scale-95 transition-all shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Leads</span>
              </button>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9.5px] font-mono uppercase bg-[#12151C] text-white px-1.5 py-0.5 rounded shrink-0">
                  {activeLead.type}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#12151C]/70 truncate bg-white border border-[#E5E7EB] px-2 py-0.5 rounded">
                  <UserIcon className="w-3 h-3 text-[#3B82F6]" />
                  <span className="truncate font-medium text-[#12151C]">{activeLead.assigned_to}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedLeadId(null)}
              className="h-8 w-8 rounded-md flex items-center justify-center text-[#12151C]/50 hover:text-[#12151C] hover:bg-[#F4F6F9] transition-colors shrink-0"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div>
              <h2 className="text-[17px] font-semibold text-[#12151C] tracking-tight">
                {activeLead.business_name}
              </h2>
              <div className="text-[12px] text-[#12151C]/60 mt-0.5">
                {activeLead.contact_name} {activeLead.city && `• ${activeLead.city}`}
              </div>
            </div>

            {/* 1. DOMINANT NEXT ACTION PINNED TILE */}
            <div className="rounded-lg bg-[#F4F6F9] border border-[#12151C]/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Next Action</span>
                </span>
                <button
                  onClick={handleStartEditNextAction}
                  className="text-[11px] text-[#3B82F6] hover:underline flex items-center gap-1 font-sans"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {editingNextAction ? (
                <div className="space-y-2 mt-1">
                  <input
                    type="text"
                    value={nextActionInput}
                    onChange={(e) => setNextActionInput(e.target.value)}
                    placeholder="Action description..."
                    className="w-full h-8 px-2.5 text-[12px] bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={nextActionDueInput}
                      onChange={(e) => setNextActionDueInput(e.target.value)}
                      className="h-8 px-2 text-[11.5px] font-mono bg-white border border-[#E5E7EB] rounded-md focus:outline-none flex-1"
                    />
                    <button
                      onClick={handleSaveNextAction}
                      className="h-8 px-3 bg-[#12151C] text-white text-[11px] font-medium rounded-md hover:bg-[#3B82F6]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNextAction(false)}
                      className="h-8 px-2.5 text-[11px] text-[#12151C]/60 hover:text-[#12151C] rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[13px] font-medium text-[#12151C] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">→</span>
                    <span>{activeLead.next_action || 'No action scheduled'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded ${
                        getDueStatus(activeLead.next_action_due).type === 'overdue'
                          ? 'bg-[#12151C] text-white'
                          : getDueStatus(activeLead.next_action_due).type === 'today'
                          ? 'bg-[#E5E7EB] text-[#12151C]'
                          : 'text-[#12151C]/70'
                      }`}
                    >
                      {getDueStatus(activeLead.next_action_due).label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Direct Contact Buttons - Uniform 32px (h-8) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                Direct Contact
              </label>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${activeLead.phone}`}
                  className="h-8 rounded-md bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activeLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 rounded-md bg-white border border-[#E5E7EB] text-[#12151C] text-[12px] font-medium hover:border-[#12151C] transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 3. Pipeline Stage & Reassign Rep - Uniform 32px (h-8) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                  Pipeline Stage
                </label>
                <select
                  value={activeLead.stage}
                  onChange={(e) => setStage(activeLead.id, e.target.value as LeadStage)}
                  className="w-full h-8 px-2 text-[12px] font-medium bg-[#F4F6F9] border border-[#E5E7EB] rounded-md text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
                >
                  {PIPELINE_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {isAdmin ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block flex items-center justify-between">
                    <span>Assigned Rep</span>
                    <span className="text-[10px] text-[#3B82F6] font-sans font-medium">Reassign</span>
                  </label>
                  <div className="relative">
                    <select
                      value={activeLead.assigned_to}
                      onChange={(e) => handleReassign(e.target.value)}
                      className="w-full h-8 pl-7 pr-2 text-[12px] font-medium bg-[#F4F6F9] border border-[#E5E7EB] rounded-md text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
                    >
                      {assigneeOptions.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                    <UserCheck className="w-3.5 h-3.5 text-[#3B82F6] absolute left-2 top-2.5 pointer-events-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                    Assigned Rep
                  </label>
                  <div className="h-8 px-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-md flex items-center gap-1.5 text-[12px] font-mono text-[#12151C]/80">
                    <UserIcon className="w-3.5 h-3.5 text-[#12151C]/40" />
                    <span className="truncate">{activeLead.assigned_to}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Est. Value & Category - Uniform 32px (h-8) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                  Est. Value (₹)
                </label>
                <input
                  type="number"
                  value={activeLead.value || ''}
                  onChange={(e) =>
                    updateLead(activeLead.id, {
                      value: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  placeholder="Est. value"
                  className="w-full h-8 px-2.5 text-[12px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded-md text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                  Category
                </label>
                <select
                  value={activeLead.type}
                  onChange={(e) => updateLead(activeLead.id, { type: e.target.value as LeadType })}
                  className="w-full h-8 px-2 text-[12px] font-medium bg-[#F4F6F9] border border-[#E5E7EB] rounded-md text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Product">Product (NivaOps)</option>
                  <option value="Client Work">Client Work</option>
                </select>
              </div>
            </div>

            {/* 4. Strategic Pitch Angle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
                <span>Strategic Pitch Angle</span>
                {!editingDetails && (
                  <button
                    onClick={handleStartEditDetails}
                    className="text-[11px] text-[#3B82F6] hover:underline font-sans"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingDetails ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={editAngle}
                    onChange={(e) => setEditAngle(e.target.value)}
                    placeholder="Specific pitch angle or pain point..."
                    className="w-full p-2.5 text-[12px] bg-white border border-[#E5E7EB] rounded-md text-[#12151C] focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDetails}
                      className="h-7 px-3 bg-[#12151C] text-white text-[11px] font-medium rounded-md hover:bg-[#3B82F6]"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingDetails(false)}
                      className="h-7 px-2.5 text-[11px] text-[#12151C]/60 hover:text-[#12151C] rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-md bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] text-[#12151C]/80 italic">
                  {activeLead.angle || 'No angle specified. Click edit to add pitch rationale.'}
                </div>
              )}
            </div>

            {/* 5. Inline Activity Timeline */}
            <div className="space-y-2.5 pt-2 border-t border-[#E5E7EB]">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50 block">
                Activity ({activeActivities.length})
              </label>

              {/* Add Note Form - Uniform 32px (h-8) */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log quick observation or note..."
                  className="flex-1 h-8 px-2.5 text-[12px] bg-[#F4F6F9] border border-[#E5E7EB] rounded-md focus:outline-none text-[#12151C]"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="h-8 px-3.5 bg-[#12151C] text-white text-[11.5px] font-medium rounded-md hover:bg-[#3B82F6] disabled:opacity-40 transition-colors shadow-xs"
                >
                  Log
                </button>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-0.5">
                {activeActivities.length === 0 ? (
                  <div className="text-[11.5px] text-[#12151C]/40 italic py-2">
                    No activity recorded yet.
                  </div>
                ) : (
                  activeActivities.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-md p-2 bg-[#F4F6F9] border border-[#E5E7EB] text-[11.5px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#12151C]/50">
                        <span className="uppercase font-semibold text-[#12151C]">
                          {act.type.replace('_', ' ')}
                        </span>
                        <span>
                          {new Date(act.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="text-[#12151C]/80">{act.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Delete Lead */}
            <div className="pt-2 border-t border-[#E5E7EB] flex justify-end">
              <button
                onClick={() => {
                  if (confirm(`Delete ${activeLead.business_name}?`)) {
                    deleteLead(activeLead.id);
                  }
                }}
                className="text-[11px] text-[#12151C]/40 hover:text-[#12151C] flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex w-[420px] lg:w-[460px] rounded-lg bg-white border border-[#E5E7EB] flex-col h-full items-center justify-center p-8 text-center shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center text-[#12151C]/30 mb-3">
            <UserIcon className="w-5 h-5" />
          </div>
          <h3 className="text-[14px] font-semibold text-[#12151C]">No Lead Selected</h3>
          <p className="text-[12px] text-[#12151C]/50 mt-1 max-w-xs">
            Select a lead from the list to view contact details, schedule next actions, or reassign reps.
          </p>
        </div>
      )}
    </div>
  );
}
