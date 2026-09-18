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
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  Briefcase,
  Upload
} from 'lucide-react';

export function LeadsView() {
  const {
    leads,
    opportunities,
    updateLead,
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

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT COLUMN: TABLE / LIST (Master) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#E5E5E5] bg-white">
        
        {/* Table Controls Header */}
        <div className="p-4 border-b border-[#E5E5E5] space-y-3 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-label">PROSPECT DATABASE</span>
              <h1 className="text-[22px] font-bold text-[#111111] tracking-tight">Leads</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium border border-[#E5E5E5] hover:border-[#111111] rounded text-[#111111] bg-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setQuickAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-white bg-[#111111] hover:bg-black rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lead</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex-1 min-w-[180px] relative">
              <Search className="w-3.5 h-3.5 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by name, phone, city..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded bg-[#F7F7F5] focus:bg-white focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-[12.5px] border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
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
              className="px-2.5 py-1.5 text-[12.5px] border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
            >
              <option value="All">All Industries</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-[12.5px] border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
            >
              <option value="All">All Assignees</option>
              <option value="usr_outreach">Adil (Outreach)</option>
              <option value="usr_founder">Faslu (Founder)</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-[#6B6B6B] text-[13.5px]">
              No leads match your filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F5] text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2.5 px-4 font-semibold">Business</th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Contact</th>
                  <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Industry</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold hidden lg:table-cell">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredLeads.map((lead) => {
                  const isSelected = activeLead?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F4F4F1] font-medium' : 'hover:bg-[#FAFAF8]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#111111]">{lead.business_name}</div>
                        <div className="text-[12px] text-[#6B6B6B] truncate max-w-[200px]">
                          {lead.location} · {lead.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#111111] hidden sm:table-cell">
                        {lead.contact_name || '—'}
                      </td>
                      <td className="py-3 px-3 text-[#6B6B6B] hidden md:table-cell">
                        {lead.industry}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EEEEEC] text-[#111111]">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[12px] text-[#6B6B6B] hidden lg:table-cell">
                        {lead.assigned_to === 'usr_founder' ? 'Founder' : 'Outreach'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: LEAD DETAIL SLIDE-OVER / PANE (Detail) */}
      <div className="w-full md:w-[480px] lg:w-[540px] h-full bg-[#F7F7F5] overflow-y-auto p-6 flex flex-col flex-shrink-0 border-t md:border-t-0 md:border-l border-[#E5E5E5]">
        {activeLead ? (
          <div className="space-y-6">
            
            {/* Lead Title & Main Attributes */}
            <div className="pb-5 border-b border-[#E5E5E5] space-y-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[24px] font-bold text-[#111111] tracking-tight">
                  {activeLead.business_name}
                </h2>
              </div>
              <div className="text-[13.5px] text-[#6B6B6B]">
                {activeLead.industry} · {activeLead.location}
              </div>

              {/* Action Buttons: CALL, WHATSAPP, EMAIL */}
              <div className="flex items-center gap-2 pt-2">
                {activeLead.phone && (
                  <a
                    href={`tel:${activeLead.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-[12.5px] font-medium rounded transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>CALL</span>
                  </a>
                )}
                {activeLead.phone && (
                  <a
                    href={`https://wa.me/${activeLead.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] hover:border-[#111111] text-[#111111] bg-white text-[12.5px] font-medium rounded transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#16803C]" />
                    <span>WHATSAPP</span>
                  </a>
                )}
                {activeLead.website && (
                  <a
                    href={`https://${activeLead.website.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] hover:border-[#111111] text-[#111111] bg-white text-[12.5px] font-medium rounded transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>SITE</span>
                  </a>
                )}
              </div>
            </div>

            {/* Section: CONTACT */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg space-y-2.5">
              <div className="section-label">CONTACT DETAILS</div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Primary Person</span>
                  <span className="font-medium text-[#111111]">{activeLead.contact_name || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Phone</span>
                  <span className="font-mono font-medium text-[#111111]">{activeLead.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Email</span>
                  <span className="text-[#111111]">{activeLead.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[#6B6B6B] block text-[11px]">Instagram</span>
                  <span className="text-[#111111]">{activeLead.instagram || '—'}</span>
                </div>
              </div>
            </div>

            {/* Section: RESEARCH OBSERVATIONS */}
            {activeLead.observation && (
              <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg space-y-2">
                <div className="section-label">OBSERVATIONS &amp; SALES ANGLE</div>
                <div className="text-[13.5px] text-[#111111] leading-relaxed">
                  {activeLead.observation}
                </div>
              </div>
            )}

            {/* Section: OPPORTUNITY / VALUE */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="section-label">OPPORTUNITY CONTEXT</div>
                {leadOpp && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#111111] text-white uppercase">
                    {leadOpp.stage}
                  </span>
                )}
              </div>

              {leadOpp ? (
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#6B6B6B]">Estimated Deal Value:</span>
                    <span className="text-[16px] font-bold text-[#111111]">
                      ₹{leadOpp.estimated_value.toLocaleString()}
                    </span>
                  </div>
                  {leadOpp.next_action && (
                    <div>
                      <span className="text-[#6B6B6B] block text-[11px]">Next Action:</span>
                      <span className="font-medium text-[#111111]">{leadOpp.next_action}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[13px] text-[#6B6B6B]">
                  No active pipeline opportunity linked yet. Qualify lead to create opportunity.
                </div>
              )}
            </div>

            {/* Section: STATUS & ASSIGNMENT */}
            <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg space-y-3">
              <div className="section-label">STATUS &amp; OWNERSHIP</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6B6B] mb-1">
                    Current Status
                  </label>
                  <select
                    value={activeLead.status}
                    onChange={(e) => updateLead(activeLead.id, { status: e.target.value as LeadStatus })}
                    className="w-full px-2.5 py-1.5 text-[13px] border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
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
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B6B6B] mb-1">
                    Assigned Owner
                  </label>
                  <select
                    value={activeLead.assigned_to}
                    onChange={(e) => updateLead(activeLead.id, { assigned_to: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-[13px] border border-[#E5E5E5] rounded bg-white text-[#111111] focus:outline-none"
                  >
                    <option value="usr_outreach">Adil (Outreach)</option>
                    <option value="usr_founder">Faslu (Founder)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: ACTIVITY TIMELINE (Section 17) */}
            <div className="space-y-3">
              <div className="section-label">ACTIVITY TIMELINE</div>

              <div className="p-4 bg-white border border-[#E5E5E5] rounded-lg space-y-3">
                {leadActivities.length === 0 ? (
                  <div className="text-[12.5px] text-[#6B6B6B] py-2">
                    No activity recorded for this lead yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leadActivities.map((act) => (
                      <div key={act.id} className="text-[12.5px] border-l-2 border-[#111111] pl-3 py-0.5">
                        <div className="text-[#111111] leading-relaxed">{act.body}</div>
                        <div className="text-[11px] text-[#6B6B6B] mt-0.5">
                          {new Date(act.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Manual Short Note */}
                <form onSubmit={handleAddManualNote} className="pt-3 border-t border-[#E5E5E5] flex gap-2">
                  <input
                    type="text"
                    value={newActivityNote}
                    onChange={(e) => setNewActivityNote(e.target.value)}
                    placeholder="Add a quick note or outcome..."
                    className="flex-1 px-3 py-1.5 text-[12.5px] border border-[#E5E5E5] rounded focus:outline-none bg-[#F7F7F5]"
                  />
                  <button
                    type="submit"
                    disabled={!newActivityNote.trim()}
                    className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#111111] hover:bg-black rounded disabled:opacity-40"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[#6B6B6B] text-[13.5px]">
            Select a lead from the table to view details.
          </div>
        )}
      </div>

    </div>
  );
}
