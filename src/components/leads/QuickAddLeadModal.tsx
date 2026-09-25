'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { LeadType, LeadStage } from '@/types/crm';
import { X, Sparkles } from 'lucide-react';

export function QuickAddLeadModal() {
  const { quickAddOpen, setQuickAddOpen, addLead, setSelectedLeadId, setCurrentView, teamMembers } = useCRM();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<LeadType>('Product');
  const [assignedTo, setAssignedTo] = useState(teamMembers[0] || 'Abid');
  const [angle, setAngle] = useState('');
  const [nextAction, setNextAction] = useState('Initial outreach call');
  const [nextActionDue, setNextActionDue] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [value, setValue] = useState<string>('');

  if (!quickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const newLead = addLead({
      business_name: businessName.trim(),
      contact_name: contactName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      type,
      stage: 'New',
      assigned_to: assignedTo || 'Abid',
      angle: angle.trim(),
      next_action: nextAction.trim(),
      next_action_due: nextActionDue,
      value: value ? Number(value) : undefined
    });

    // Reset & close
    setBusinessName('');
    setContactName('');
    setPhone('');
    setCity('');
    setAngle('');
    setValue('');
    setQuickAddOpen(false);

    // Open lead
    setSelectedLeadId(newLead.id);
    setCurrentView('leads');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 p-4"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F4F6F9]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6]">
                New Intake
              </span>
              <span className="text-[#E5E7EB]">/</span>
              <h2 className="text-[14px] font-bold text-[#12151C] uppercase tracking-wide">
                Add Lead
              </h2>
            </div>
            <p className="text-[12px] text-[#12151C]/60 mt-0.5">
              Record a prospect for Product (NivaOps) or Client Work.
            </p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1 text-[#12151C]/60 hover:text-[#12151C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {/* Business Line Segmented Control */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Line of Business *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('Product')}
                className={`py-1.5 text-[12px] font-medium border text-center transition-colors ${
                  type === 'Product'
                    ? 'bg-[#12151C] text-white border-[#12151C]'
                    : 'bg-[#F4F6F9] text-[#12151C] border-[#E5E7EB]'
                }`}
              >
                Product (NivaOps)
              </button>
              <button
                type="button"
                onClick={() => setType('Client Work')}
                className={`py-1.5 text-[12px] font-medium border text-center transition-colors ${
                  type === 'Client Work'
                    ? 'bg-[#12151C] text-white border-[#12151C]'
                    : 'bg-[#F4F6F9] text-[#12151C] border-[#E5E7EB]'
                }`}
              >
                Client Work
              </button>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Business / Hostel / Account Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal PG / Calicut Biriyani Hub"
              className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
            />
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Salman K."
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
          </div>

          {/* City & Assigned To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kozhikode"
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Assigned To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              >
                {teamMembers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Angle (Pitch) */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Angle / Reason Worth Pursuing
            </label>
            <textarea
              rows={2}
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="e.g. 120-bed PG running manually on WhatsApp; perfect for NivaOps demo..."
              className="w-full px-3 py-2 text-[12.5px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white resize-none"
            />
          </div>

          {/* Next Action & Date */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Immediate Next Action
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Call owner"
                className="w-full px-3 py-1.5 text-[12.5px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={nextActionDue}
                onChange={(e) => setNextActionDue(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] font-mono text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Estimated Deal Value (₹)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full px-3 py-1.5 text-[12.5px] font-mono text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="px-4 py-2 text-[12px] border border-[#E5E7EB] text-[#12151C]/70 hover:text-[#12151C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[12px] font-medium text-white bg-[#12151C] hover:bg-[#3B82F6] transition-colors"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
