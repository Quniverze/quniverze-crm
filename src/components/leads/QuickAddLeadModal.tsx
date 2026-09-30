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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EAECEF] bg-[#FAFAFB]">
          <div>
            <h2 className="text-[17px] font-bold text-[#111827] tracking-tight">
              Add New Lead
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Record a prospect for Product (NivaOps) or Client Work.
            </p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Business Line Segmented Control */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
              Line of Business *
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-1 rounded-full border border-gray-200">
              <button
                type="button"
                onClick={() => setType('Product')}
                className={`py-1.5 text-[12.5px] font-medium rounded-full text-center transition-all ${
                  type === 'Product'
                    ? 'bg-[#1A5336] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Product (NivaOps)
              </button>
              <button
                type="button"
                onClick={() => setType('Client Work')}
                className={`py-1.5 text-[12.5px] font-medium rounded-full text-center transition-all ${
                  type === 'Client Work'
                    ? 'bg-[#1A5336] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Client Work
              </button>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Business / Account Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal Hostels / Urban Stays"
              className="w-full px-3.5 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
            />
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul Nair"
                className="w-full px-3 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 text-[13px] font-mono text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
          </div>

          {/* City & Assigned To */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full px-3 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Assigned Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336]"
              >
                {teamMembers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Angle (The Pitch) */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Strategic Angle / Pitch
            </label>
            <input
              type="text"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="e.g. 120-bed hostel looking to automate rent & mess billing"
              className="w-full px-3.5 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
            />
          </div>

          {/* Next Action & Due Date */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Next Action
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Initial demo call"
                className="w-full px-3 py-2 text-[13px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={nextActionDue}
                onChange={(e) => setNextActionDue(e.target.value)}
                className="w-full px-2 py-2 text-[12px] font-mono text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Deal Value */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Estimated Deal Value (₹)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3.5 py-2 text-[13px] font-mono text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#EAECEF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="px-4 py-2 text-[12.5px] border border-gray-200 text-gray-600 rounded-full hover:border-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary py-2 px-5 text-[12.5px]"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
