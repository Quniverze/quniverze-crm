'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, LeadType, LeadStage, PIPELINE_STAGES } from '@/types/crm';
import {
  X,
  UserCheck,
  Building,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Check
} from 'lucide-react';

export function EditLeadModal() {
  const {
    leadModalOpen,
    setLeadModalOpen,
    editingLead,
    setEditingLead,
    updateLead,
    deleteLead,
    teamMembers,
    showToast
  } = useCRM();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<LeadType>('Product');
  const [stage, setStage] = useState<LeadStage>('New');
  const [assignedTo, setAssignedTo] = useState('');
  const [angle, setAngle] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDue, setNextActionDue] = useState('');
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (editingLead) {
      setBusinessName(editingLead.business_name || '');
      setContactName(editingLead.contact_name || '');
      setPhone(editingLead.phone || '');
      setCity(editingLead.city || '');
      setType(editingLead.type || 'Product');
      setStage(editingLead.stage || 'New');
      setAssignedTo(editingLead.assigned_to || (teamMembers[0] || 'Abid'));
      setAngle(editingLead.angle || '');
      setNextAction(editingLead.next_action || '');
      setNextActionDue(editingLead.next_action_due || '');
      setValue(editingLead.value ? String(editingLead.value) : '');
    }
  }, [editingLead, leadModalOpen, teamMembers]);

  if (!leadModalOpen || !editingLead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      showToast('Business name is required');
      return;
    }

    updateLead(editingLead.id, {
      business_name: businessName.trim(),
      contact_name: contactName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      type,
      stage,
      assigned_to: assignedTo,
      angle: angle.trim(),
      next_action: nextAction.trim(),
      next_action_due: nextActionDue,
      value: value ? Number(value) : undefined
    });

    showToast(`Updated lead: ${businessName}`);
    setEditingLead(null);
    setLeadModalOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete lead "${editingLead.business_name}"?`)) {
      deleteLead(editingLead.id);
      setEditingLead(null);
      setLeadModalOpen(false);
    }
  };

  const handleClose = () => {
    setEditingLead(null);
    setLeadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFB] border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#1A5336] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">
                Edit Lead Details
              </h3>
              <p className="text-[11.5px] text-gray-500">
                Update contact, qualification stage, and next steps
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Business & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Royal PG, Apex Studio..."
                className="w-full px-3.5 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Contact Person</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2 text-[13px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Kochi"
                className="w-full px-3.5 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
          </div>

          {/* Line of Business & Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Line of Business</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LeadType)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              >
                <option value="Product">Product (NivaOps SaaS)</option>
                <option value="Client Work">Client Work (Studio)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned To & Deal Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              >
                {teamMembers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Est. Deal Value (₹)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full px-3 py-2 text-[12.5px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
          </div>

          {/* Next Action & Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Next Action</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Follow-up demo call"
                className="w-full px-3.5 py-2 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Due Date</label>
              <input
                type="date"
                value={nextActionDue}
                onChange={(e) => setNextActionDue(e.target.value)}
                className="w-full px-2.5 py-2 text-[12px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
          </div>

          {/* Pitch Angle */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-gray-700">Strategic Angle / Pitch</label>
            <textarea
              rows={2}
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="Why this lead is worth pursuing..."
              className="w-full px-3.5 py-2 text-[12.5px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Lead</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-[12.5px] font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1A5336] hover:bg-[#14422B] text-white text-[13px] font-medium rounded-full shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
