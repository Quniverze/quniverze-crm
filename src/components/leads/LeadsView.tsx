'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, LeadStatus } from '@/types/crm';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Globe,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  X,
  ExternalLink,
  Briefcase,
  Upload,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export function LeadsView() {
  const {
    leads,
    opportunities,
    updateLead,
    deleteLead,
    addActivity,
    getLeadActivities,
    selectedLeadId,
    setSelectedLeadId,
    setQuickAddOpen,
    setImportModalOpen,
    currentUser
  } = useCRM();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  // Manual activity state
  const [newActivityNote, setNewActivityNote] = useState('');

  // Selected lead
  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || leads[0] || null;
  }, [leads, selectedLeadId]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          l.business_name.toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      if (industryFilter !== 'All' && l.industry !== industryFilter) return false;
      if (assigneeFilter !== 'All' && l.assigned_to !== assigneeFilter) return false;
      return true;
    });
  }, [leads, searchTerm, statusFilter, industryFilter, assigneeFilter]);

  // Unique industries
  const industries = useMemo(() => {
    const set = new Set(leads.map((l) => l.industry).filter(Boolean));
    return Array.from(set);
  }, [leads]);

  // Opportunity for selected lead if any
  const leadOpp = useMemo(() => {
    if (!activeLead) return null;
    return opportunities.find((o) => o.lead_id === activeLead.id);
  }, [opportunities, activeLead]);

  const leadActivities = useMemo(() => {
    if (!activeLead) return [];
    return getLeadActivities(activeLead.id);
  }, [activeLead, getLeadActivities]);

  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !newActivityNote.trim()) return;

    addActivity({
      lead_id: activeLead.id,
      type: 'note',
      body: newActivityNote.trim()
    });

    setNewActivityNote('');
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!activeLead) return;
    updateLead(activeLead.id, { status: newStatus });
    addActivity({
      lead_id: activeLead.id,
      type: 'stage_changed',
      body: `Status changed to ${newStatus} by ${currentUser.name}`
    });
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#F4F6F9]">
      
      {/* LEFT COLUMN: DENSE LEADS DATA TABLE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white border-r border-[#E5E7EB]">
        
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-[#E5E7EB] bg-white flex flex-col gap-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="section-label">CRM</span>
              <h1 className="text-[18px] font-bold text-[#12151C] tracking-tight">Leads</h1>
              <span className="text-[11px] font-mono text-[#6B7280]">
                ({filteredLeads.length} of {leads.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Import CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-white bg-[#12151C] hover:bg-black rounded transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search company, contact, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="To Call">To Call</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Qualified">Qualified</option>
              <option value="Meeting">Meeting</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Industry Filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="All">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            {/* Owner Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="All">All Owners</option>
              <option value="usr_founder">Founder</option>
              <option value="usr_outreach">Outreach</option>
            </select>
          </div>
        </div>

        {/* Dense Table Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280] text-[13px] space-y-3">
              <div>{leads.length === 0 ? 'No leads in the CRM yet.' : 'No leads match your filter criteria.'}</div>
              {leads.length === 0 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    className="px-3 py-1.5 bg-[#12151C] text-white text-[12px] font-medium rounded"
                  >
                    Add First Lead
                  </button>
                  <button
                    onClick={() => setImportModalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#12151C] text-[12px] font-medium rounded"
                  >
                    Import CSV
                  </button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F4F6F9] text-[10.5px] font-semibold text-[#6B7280] uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2 px-3 font-semibold">Company / Lead</th>
                  <th className="py-2 px-3 font-semibold hidden sm:table-cell">Contact</th>
                  <th className="py-2 px-3 font-semibold hidden md:table-cell">Source</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold hidden lg:table-cell">Owner</th>
                  <th className="py-2 px-3 font-semibold hidden xl:table-cell">Next Follow-up</th>
                  <th className="py-2 px-3 font-semibold hidden xl:table-cell font-mono text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredLeads.map((lead) => {
                  const isSelected = activeLead?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EBF3FE] font-medium border-l-2 border-[#3B82F6]'
                          : 'hover:bg-[#F4F6F9]'
                      }`}
                    >
                      <td className="py-2 px-3">
                        <div className="font-semibold text-[#12151C] leading-tight">
                          {lead.business_name}
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate max-w-[180px]">
                          {lead.industry} · {lead.location}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-[#12151C] hidden sm:table-cell">
                        {lead.contact_name || '—'}
                      </td>
                      <td className="py-2 px-3 text-[#6B7280] hidden md:table-cell text-[11.5px]">
                        {lead.lead_source}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10.5px] font-medium px-2 py-0.5 rounded bg-[#F4F6F9] text-[#12151C] border border-[#E5E7EB]">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11.5px] text-[#6B7280] hidden lg:table-cell">
                        {lead.assigned_to === 'usr_founder' ? 'Founder' : 'Outreach'}
                      </td>
                      <td className="py-2 px-3 text-[11.5px] text-[#6B7280] hidden xl:table-cell font-mono">
                        {lead.next_follow_up_at
                          ? new Date(lead.next_follow_up_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-[#6B7280] hidden xl:table-cell font-mono text-right">
                        {new Date(lead.created_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: FOCUSED LEAD DETAIL PANE */}
      <div className="w-full md:w-[460px] lg:w-[500px] h-full bg-[#F4F6F9] overflow-y-auto p-4 md:p-6 flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-[#E5E7EB]">
        {activeLead ? (
          <div className="space-y-5">
            
            {/* 1. Header: Company, Contact, Status, Owner, Primary Actions */}
            <div className="bg-white border border-[#E5E7EB] rounded p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-[20px] font-bold text-[#12151C] tracking-tight">
                    {activeLead.business_name}
                  </h2>
                  <div className="text-[12.5px] text-[#6B7280] mt-0.5">
                    {activeLead.contact_name ? `${activeLead.contact_name} · ` : ''}{activeLead.industry} · {activeLead.location}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select
                    value={activeLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className="text-[11px] font-semibold px-2 py-1 rounded bg-[#F4F6F9] text-[#12151C] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="New">New</option>
                    <option value="To Call">To Call</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteLead(activeLead.id)}
                    title="Delete Lead"
                    className="p-1.5 text-[#6B7280] hover:text-[#12151C] rounded border border-transparent hover:border-[#E5E7EB]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Phone, WhatsApp, Web */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#E5E7EB]">
                {activeLead.phone && (
                  <a
                    href={`tel:${activeLead.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#12151C] hover:bg-black text-white text-[12px] font-medium rounded transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {activeLead.phone}</span>
                  </a>
                )}
                {activeLead.phone && (
                  <a
                    href={`https://wa.me/${activeLead.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C] bg-white text-[12px] font-medium rounded transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                )}
                {activeLead.website && (
                  <a
                    href={`https://${activeLead.website.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 border border-[#E5E7EB] hover:border-[#12151C] text-[#12151C] bg-white text-[12px] font-medium rounded transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* 2. PROMINENT: "WHAT HAPPENS NEXT?" */}
            <div className="p-3.5 bg-white border-l-2 border-l-[#3B82F6] border border-[#E5E7EB] rounded space-y-1.5">
              <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                NEXT ACTION
              </div>
              <div className="text-[13px] font-semibold text-[#12151C]">
                {leadOpp?.next_action || (activeLead.status === 'To Call' ? 'Initial phone qualification call required' : 'Review status and schedule follow-up')}
              </div>
              <div className="text-[11.5px] text-[#6B7280]">
                Assigned to: <span className="font-medium text-[#12151C]">{activeLead.assigned_to === 'usr_founder' ? 'Founder (Faslu)' : 'Outreach (Adil)'}</span>
                {activeLead.next_follow_up_at && ` · Due: ${new Date(activeLead.next_follow_up_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
              </div>
            </div>

            {/* 3. CONTACT INFORMATION */}
            <div className="p-3.5 bg-white border border-[#E5E7EB] rounded space-y-2">
              <div className="section-label">CONTACT INFORMATION</div>
              <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                <div>
                  <span className="text-[#6B7280] block text-[10.5px]">Primary Person</span>
                  <span className="font-medium text-[#12151C]">{activeLead.contact_name || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10.5px]">Phone</span>
                  <span className="font-mono text-[#12151C]">{activeLead.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10.5px]">Email</span>
                  <span className="text-[#12151C] truncate block">{activeLead.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[10.5px]">Source</span>
                  <span className="text-[#12151C]">{activeLead.lead_source}</span>
                </div>
              </div>
            </div>

            {/* 4. RESEARCH OBSERVATIONS & NOTES */}
            {(activeLead.observation || activeLead.notes) && (
              <div className="p-3.5 bg-white border border-[#E5E7EB] rounded space-y-1.5">
                <div className="section-label">RESEARCH &amp; CONTEXT</div>
                {activeLead.observation && (
                  <p className="text-[12.5px] text-[#12151C] leading-relaxed">
                    {activeLead.observation}
                  </p>
                )}
                {activeLead.notes && (
                  <p className="text-[12px] text-[#4B5563] pt-1 border-t border-[#E5E7EB] leading-relaxed">
                    {activeLead.notes}
                  </p>
                )}
              </div>
            )}

            {/* 5. OPPORTUNITY CONTEXT */}
            {leadOpp && (
              <div className="p-3.5 bg-white border border-[#E5E7EB] rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="section-label">OPPORTUNITY</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#12151C] text-white">
                    {leadOpp.stage}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] text-[#6B7280]">Estimated Deal Value:</span>
                  <span className="text-[15px] font-bold text-[#12151C] font-mono">
                    ₹{leadOpp.estimated_value.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* 6. ACTIVITY TIMELINE & NOTE COMPOSER */}
            <div className="p-3.5 bg-white border border-[#E5E7EB] rounded space-y-3">
              <div className="section-label">ACTIVITY TIMELINE</div>

              {/* Note Composer */}
              <form onSubmit={handleAddManualNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Add note or update on this lead..."
                  value={newActivityNote}
                  onChange={(e) => setNewActivityNote(e.target.value)}
                  className="w-full p-2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[12px] text-[#12151C] placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6]"
                />
                <button
                  type="submit"
                  disabled={!newActivityNote.trim()}
                  className="px-3 py-1 bg-[#12151C] text-white text-[11.5px] font-medium rounded hover:bg-black disabled:opacity-40 transition-colors"
                >
                  Log Note
                </button>
              </form>

              {/* History stream */}
              <div className="divide-y divide-[#E5E7EB] pt-2">
                {leadActivities.length === 0 ? (
                  <div className="text-[12px] text-[#6B7280] py-2">
                    No activities recorded yet for this lead.
                  </div>
                ) : (
                  leadActivities.map((act) => (
                    <div key={act.id} className="py-2 text-[12px] space-y-0.5">
                      <div className="text-[#12151C] leading-snug">
                        {act.body}
                      </div>
                      <div className="text-[10.5px] text-[#6B7280] font-mono">
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
            Select a lead to inspect details.
          </div>
        )}
      </div>

    </div>
  );
}
